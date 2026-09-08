#!/usr/bin/env python3
"""Проверка поисковых формулировок по подсказкам Яндекса и Google.

Подсказки доказывают, что фраза употребляется, и показывают соседние интенты.
Частотность они НЕ дают — её снимают в Wordstat/Keyword Planner.

    python3 suggest.py "прогнозирование спроса" "ниокр по по"
    python3 suggest.py --file phrases.txt --engine yandex --json out.json
    python3 suggest.py "внедрение ии" --expand      # + модификаторы цена/заказать/...
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.parse
import urllib.request

UA = "Mozilla/5.0 (compatible; seo-suggest/1.0)"
TIMEOUT = 15

# Маркеры интента: подсказка выдаёт не только слова, но и то, зачем их вводят.
COMMERCIAL = ("цена", "стоимость", "заказать", "купить", "под ключ", "услуг", "внедрен",
              "разработ", "компани", "подрядчик", "аутсорс", "сколько стоит")
INFORMATIONAL = ("что такое", "как ", "почему", "пример", "своими руками", "простыми словами",
                 "виды", "этапы", "отличие", "сравнение")
NOISE = ("курс", "обучени", "вакансии", "работа", "реферат", "диплом", "скачать", "бесплатно",
         "песн", "фото", "нейросет онлайн", "гдз", "тест", "олимпиад", "масло", "молоко",
         "университет", "институт", "магистратура", "презентаци")

MODIFIERS = ["цена", "стоимость", "заказать", "под ключ", "для бизнеса", "компания", "услуги"]


def _get_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        raw = resp.read()
    for encoding in ("utf-8", "cp1251", "latin-1"):
        try:
            return json.loads(raw.decode(encoding))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
    return None


def yandex(phrase: str, n: int = 10) -> list[str]:
    q = urllib.parse.quote(phrase)
    url = f"https://suggest.yandex.ru/suggest-ff.cgi?part={q}&uil=ru&n={n}"
    try:
        data = _get_json(url)
    except Exception as exc:  # сеть/капча — не роняем весь прогон
        print(f"  ! Яндекс недоступен: {exc}", file=sys.stderr)
        return []
    if not data or len(data) < 2:
        return []
    out = []
    for item in data[1]:
        out.append(item[0] if isinstance(item, list) else item)
    return [s for s in out if isinstance(s, str)]


def google(phrase: str, hl: str = "ru") -> list[str]:
    q = urllib.parse.quote(phrase)
    url = f"https://suggestqueries.google.com/complete/search?client=firefox&hl={hl}&q={q}"
    try:
        data = _get_json(url)
    except Exception as exc:
        print(f"  ! Google недоступен: {exc}", file=sys.stderr)
        return []
    if not data or len(data) < 2:
        return []
    return [s for s in data[1] if isinstance(s, str)]


def classify(s: str) -> str:
    low = s.lower()
    if any(m in low for m in NOISE):
        return "noise"
    if any(m in low for m in COMMERCIAL):
        return "commercial"
    if any(m in low for m in INFORMATIONAL):
        return "info"
    return "neutral"


MARK = {"commercial": "$", "info": "i", "noise": "!", "neutral": " "}


def verdict(suggestions: list[str]) -> str:
    if not suggestions:
        return "НЕТ ПОДСКАЗОК — фраза либо редкая, либо сформулирована не так, как пишут люди"
    kinds = [classify(s) for s in suggestions]
    noise = kinds.count("noise") / len(kinds)
    comm = kinds.count("commercial") / len(kinds)
    if noise >= 0.5:
        return "ЛОВУШКА — большинство подсказок из чужой тематики, интент не наш"
    if comm >= 0.3:
        return "КОММЕРЧЕСКИЙ ИНТЕНТ — годится под посадочную страницу услуги"
    if noise >= 0.25:
        return "СМЕШАННЫЙ — часть выдачи уйдёт не туда, уточнить формулировку"
    return "ИНФОРМАЦИОННЫЙ — годится под статью/глоссарий, не под продажу"


def run(phrases: list[str], engine: str, expand: bool, limit: int) -> dict:
    result: dict[str, dict] = {}
    queries = list(phrases)
    if expand:
        queries += [f"{p} {m}" for p in phrases for m in MODIFIERS]

    for phrase in queries:
        entry: dict[str, object] = {}
        merged: list[str] = []
        if engine in ("yandex", "both"):
            ys = yandex(phrase, limit)
            entry["yandex"] = ys
            merged += ys
        if engine in ("google", "both"):
            gs = google(phrase)
            entry["google"] = gs
            merged += gs
        seen, uniq = set(), []
        for s in merged:
            if s.lower() not in seen:
                seen.add(s.lower())
                uniq.append(s)
        entry["all"] = uniq
        entry["classified"] = {s: classify(s) for s in uniq}
        entry["verdict"] = verdict(uniq)
        result[phrase] = entry

        print(f"\n=== {phrase} ===")
        print(f"    → {entry['verdict']}")
        for s in uniq:
            print(f"    [{MARK[classify(s)]}] {s}")
    return result


def main() -> int:
    ap = argparse.ArgumentParser(description="Подсказки Яндекса и Google для проверки формулировок")
    ap.add_argument("phrases", nargs="*", help="фразы для проверки")
    ap.add_argument("--file", help="файл со списком фраз, по одной в строке")
    ap.add_argument("--engine", choices=["yandex", "google", "both"], default="both")
    ap.add_argument("--expand", action="store_true", help="добавить коммерческие модификаторы")
    ap.add_argument("--limit", type=int, default=10, help="сколько подсказок брать у Яндекса")
    ap.add_argument("--json", dest="json_out", help="сохранить результат в JSON")
    args = ap.parse_args()

    phrases = list(args.phrases)
    if args.file:
        with open(args.file, encoding="utf-8") as fh:
            phrases += [ln.strip() for ln in fh if ln.strip() and not ln.startswith("#")]
    if not phrases:
        ap.error("нужна хотя бы одна фраза или --file")

    result = run(phrases, args.engine, args.expand, args.limit)

    print("\nЛегенда: [$] коммерческий · [i] информационный · [!] чужая тематика")
    print("Подсказки доказывают употребимость фразы, но не её частотность — снимать в Wordstat.")

    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as fh:
            json.dump(result, fh, ensure_ascii=False, indent=2)
        print(f"JSON: {args.json_out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
