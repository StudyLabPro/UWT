#!/usr/bin/env python3
"""Технический SEO-аудит живых URL: то, что видит краулер без JavaScript.

    python3 seo_check.py https://www.xteam.pro/                     # одна страница
    python3 seo_check.py --sitemap https://www.xteam.pro/sitemap.xml
    python3 seo_check.py --site https://www.xteam.pro               # весь набор проверок
    python3 seo_check.py --site https://www.xteam.pro --json report.json

Уровни: FAIL — ломает индексацию, WARN — ухудшает позиции/сниппет, OK — норма.
Код возврата = количество FAIL.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

UA = "Mozilla/5.0 (compatible; seo-check/1.0; +audit)"
TIMEOUT = 25
MAX_HOPS = 6


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *_args, **_kwargs):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


def fetch(url: str, method: str = "GET") -> dict:
    """Один запрос без автоматического следования редиректу."""
    req = urllib.request.Request(url, headers={"User-Agent": UA}, method=method)
    try:
        with OPENER.open(req, timeout=TIMEOUT) as resp:
            body = resp.read() if method == "GET" else b""
            return {"url": url, "status": resp.status, "headers": dict(resp.headers),
                    "body": body.decode("utf-8", "replace"), "error": None}
    except urllib.error.HTTPError as exc:
        body = exc.read() if method == "GET" else b""
        return {"url": url, "status": exc.code, "headers": dict(exc.headers or {}),
                "body": body.decode("utf-8", "replace"), "error": None}
    except Exception as exc:
        return {"url": url, "status": 0, "headers": {}, "body": "", "error": str(exc)}


def follow(url: str) -> tuple[list[tuple[str, int, str]], dict]:
    """Возвращает цепочку [(url, status, location)] и финальный ответ."""
    chain, current = [], url
    for _ in range(MAX_HOPS):
        resp = fetch(current)
        loc = resp["headers"].get("Location") or resp["headers"].get("location") or ""
        chain.append((current, resp["status"], loc))
        if resp["status"] in (301, 302, 303, 307, 308) and loc:
            current = urllib.parse.urljoin(current, loc)
            continue
        return chain, resp
    return chain, resp


# ---------- разбор HTML ----------

def _first(pattern: str, html: str) -> str | None:
    m = re.search(pattern, html, re.I | re.S)
    return m.group(1).strip() if m else None


def parse(html: str) -> dict:
    head = html[:200_000]
    data: dict[str, object] = {}
    data["title"] = _first(r"<title[^>]*>(.*?)</title>", head)
    data["description"] = _first(
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']', head) or _first(
        r'<meta[^>]+content=["\'](.*?)["\'][^>]+name=["\']description["\']', head)
    data["canonical"] = _first(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\'](.*?)["\']', head)
    data["robots"] = _first(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\'](.*?)["\']', head)
    data["lang"] = _first(r"<html[^>]+lang=[\"'](.*?)[\"']", head)
    data["og_title"] = _first(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\'](.*?)["\']', head)
    data["og_image"] = _first(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\'](.*?)["\']', head)
    data["h1"] = [re.sub(r"<[^>]+>", "", h).strip()
                  for h in re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)]
    data["hreflang"] = re.findall(r'<link[^>]+hreflang=["\'](.*?)["\']', head, re.I)

    types: list[str] = []
    for block in re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.I | re.S):
        try:
            parsed = json.loads(block.strip())
        except json.JSONDecodeError:
            types.append("!invalid-json")
            continue
        for node in (parsed.get("@graph", [parsed]) if isinstance(parsed, dict) else parsed):
            if isinstance(node, dict) and node.get("@type"):
                t = node["@type"]
                types.extend(t if isinstance(t, list) else [t])
    data["jsonld"] = types

    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    data["text_len"] = len(re.sub(r"\s+", " ", text).strip())
    return data


def norm(url: str | None) -> str:
    if not url:
        return ""
    u = url.split("#")[0].rstrip("/")
    return u.replace("http://", "https://")


# ---------- проверки ----------

def check_page(url: str, findings: list) -> dict:
    chain, resp = follow(url)
    add = lambda lvl, msg: findings.append((lvl, url, msg))

    if resp["error"]:
        add("FAIL", f"запрос не выполнен: {resp['error']}")
        return {"url": url, "ok": False}

    hops = len(chain) - 1
    if hops:
        path = " → ".join(f"{u} [{s}]" for u, s, _ in chain)
        if any(u.startswith("http://") for u, _, _ in chain[1:]):
            add("FAIL", f"редирект проходит через http: {path}")
        elif hops > 1:
            add("WARN", f"цепочка из {hops} редиректов: {path}")

    final = chain[-1][0]
    if resp["status"] != 200:
        add("FAIL", f"финальный код {resp['status']} ({final})")
        return {"url": url, "final": final, "status": resp["status"], "ok": False}

    xrobots = resp["headers"].get("X-Robots-Tag", "")
    if "noindex" in xrobots.lower():
        add("FAIL", f"заголовок X-Robots-Tag: {xrobots}")

    p = parse(resp["body"])

    if p["robots"] and "noindex" in str(p["robots"]).lower():
        add("FAIL", f"meta robots: {p['robots']}")

    title = p["title"] or ""
    if not title:
        add("FAIL", "нет <title>")
    elif len(title) > 65:
        add("WARN", f"title длиннее 65 символов ({len(title)}): {title[:70]}…")
    elif len(title) < 15:
        add("WARN", f"title слишком короткий: {title}")

    desc = p["description"] or ""
    if not desc:
        add("WARN", "нет meta description — сниппет соберётся автоматически")
    elif not 50 <= len(desc) <= 180:
        add("WARN", f"description длиной {len(desc)} символов (норма 50–180)")

    h1 = p["h1"]
    if not h1:
        add("WARN", "нет H1 в статическом HTML")
    elif len(h1) > 1:
        add("WARN", f"H1 несколько ({len(h1)}): {', '.join(x[:40] for x in h1[:3])}")

    can = norm(str(p["canonical"] or ""))
    if not can:
        add("WARN", "нет canonical")
    elif can != norm(final):
        add("FAIL", f"canonical указывает на другой URL: {p['canonical']}")

    if not p["jsonld"]:
        add("WARN", "нет structured data (JSON-LD)")
    elif "!invalid-json" in p["jsonld"]:
        add("FAIL", "JSON-LD не парсится")

    if not p["og_image"]:
        add("WARN", "нет og:image — ссылка без превью в мессенджерах")
    if not p["lang"]:
        add("WARN", "нет атрибута lang у <html>")
    else:
        m = re.search(r"/(en|ru|de|fr|es)(/|$)", urllib.parse.urlparse(final).path)
        if m and not str(p["lang"]).lower().startswith(m.group(1)):
            add("WARN", f'URL языковой ветки /{m.group(1)}, а lang="{p["lang"]}" — '
                        "для не-JS-краулера язык страницы объявлен неверно")

    if p["hreflang"] and "x-default" not in [h.lower() for h in p["hreflang"]]:
        add("WARN", f"hreflang без x-default: {p['hreflang']}")

    if p["text_len"] < 600:
        add("FAIL", f"в статическом HTML всего {p['text_len']} символов текста — "
                    "краулер без JS почти ничего не видит")
    elif p["text_len"] < 1500:
        add("WARN", f"мало текста в статическом HTML: {p['text_len']} символов")

    return {"url": url, "final": final, "status": 200, "title": title,
            "description": desc, "canonical": p["canonical"], "h1": h1,
            "jsonld": p["jsonld"], "text_len": p["text_len"],
            "hreflang": p["hreflang"], "ok": True}


def sitemap_urls(url: str) -> list[str]:
    resp = fetch(url)
    if resp["status"] != 200:
        return []
    locs = re.findall(r"<loc>\s*(.*?)\s*</loc>", resp["body"], re.I | re.S)
    nested = [u for u in locs if u.endswith(".xml")]
    plain = [u for u in locs if not u.endswith(".xml")]
    for n in nested:
        plain += sitemap_urls(n)
    return plain


def check_site(base: str, findings: list) -> dict:
    base = base.rstrip("/")
    parts = urllib.parse.urlparse(base)
    host = parts.netloc
    add = lambda lvl, msg: findings.append((lvl, base, msg))
    info: dict[str, object] = {}

    robots = fetch(f"{base}/robots.txt")
    if robots["status"] != 200:
        add("FAIL", f"robots.txt отдаёт {robots['status']}")
    else:
        info["robots"] = robots["body"][:500]
        if "sitemap" not in robots["body"].lower():
            add("WARN", "в robots.txt нет директивы Sitemap")
        if re.search(r"^\s*Disallow:\s*/\s*$", robots["body"], re.M | re.I):
            add("FAIL", "robots.txt закрывает весь сайт (Disallow: /)")

    sm = fetch(f"{base}/sitemap.xml")
    if sm["status"] != 200:
        add("FAIL", f"sitemap.xml отдаёт {sm['status']}")
    else:
        urls = sitemap_urls(f"{base}/sitemap.xml")
        info["sitemap_count"] = len(urls)
        if not urls:
            add("FAIL", "sitemap.xml пуст или не парсится")
        elif len(urls) < 5:
            add("WARN", f"в sitemap всего {len(urls)} URL — под несколько кластеров запросов мало")

    missing = fetch(f"{base}/seo-check-404-probe")
    if missing["status"] != 404:
        add("WARN", f"несуществующая страница отдаёт {missing['status']} вместо 404")

    if host.startswith("www."):
        apex = f"{parts.scheme}://{host[4:]}"
        chain, _ = follow(apex)
        if chain[0][1] not in (301, 308):
            add("WARN", f"апекс {apex} не отдаёт 301 на www (код {chain[0][1]})")

    dup = fetch(f"{base}/index.html")
    if dup["status"] == 200 and "noindex" not in dup["headers"].get("X-Robots-Tag", "").lower():
        add("FAIL", "/index.html доступен как дубль главной без noindex")

    rsc = fetch(f"{base}/index.txt")
    if rsc["status"] == 200 and "noindex" not in rsc["headers"].get("X-Robots-Tag", "").lower():
        add("WARN", "/index.txt (RSC-пейлоад) доступен без noindex — дубль контента")

    return info


def report(findings: list, pages: list[dict]) -> int:
    titles: dict[str, list[str]] = {}
    for p in pages:
        if p.get("ok") and p.get("title"):
            titles.setdefault(p["title"], []).append(p["url"])
    for title, urls in titles.items():
        if len(urls) > 1:
            findings.append(("WARN", ", ".join(urls), f"одинаковый title на {len(urls)} страницах: {title[:60]}"))

    fails = [f for f in findings if f[0] == "FAIL"]
    warns = [f for f in findings if f[0] == "WARN"]

    print("\n" + "=" * 70)
    print(f"Проверено страниц: {len(pages)} · FAIL: {len(fails)} · WARN: {len(warns)}")
    print("=" * 70)
    for level in ("FAIL", "WARN"):
        for lvl, url, msg in findings:
            if lvl == level:
                print(f"[{lvl}] {url}\n       {msg}")
    if not findings:
        print("[OK] замечаний нет")
    return len(fails)


def main() -> int:
    ap = argparse.ArgumentParser(description="Технический SEO-аудит по живым URL")
    ap.add_argument("urls", nargs="*", help="страницы для проверки")
    ap.add_argument("--sitemap", help="проверить все URL из sitemap")
    ap.add_argument("--site", help="полный набор проверок сайта (robots, sitemap, 404, дубли)")
    ap.add_argument("--limit", type=int, default=50, help="максимум страниц из sitemap")
    ap.add_argument("--json", dest="json_out", help="сохранить результат в JSON")
    args = ap.parse_args()

    findings: list = []
    pages: list[dict] = []
    targets = list(args.urls)
    site_info: dict = {}

    if args.site:
        site_info = check_site(args.site, findings)
        targets.append(args.site.rstrip("/") + "/")
        targets += sitemap_urls(args.site.rstrip("/") + "/sitemap.xml")[: args.limit]
    if args.sitemap:
        targets += sitemap_urls(args.sitemap)[: args.limit]
    if not targets:
        ap.error("нужен хотя бы один URL, --sitemap или --site")

    seen = set()
    for url in targets:
        key = norm(url)
        if key in seen:
            continue
        seen.add(key)
        print(f"→ {url}")
        pages.append(check_page(url, findings))

    fails = report(findings, pages)

    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as fh:
            json.dump({"site": site_info, "pages": pages,
                       "findings": [{"level": l, "url": u, "message": m} for l, u, m in findings]},
                      fh, ensure_ascii=False, indent=2)
        print(f"JSON: {args.json_out}")
    return fails


if __name__ == "__main__":
    sys.exit(main())
