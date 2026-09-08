#!/usr/bin/env python3
"""Mechanical checks on a compiled skill produced by the AGI Agent compiler.

Catches the defects that are cheap to detect and expensive to miss: missing structure,
unresolved abstraction, rules with no boundary, absent autonomy limits, missing tests.
It cannot judge fidelity to the sources — that is what expert comparison is for.

Usage:
    python3 lint_skill.py <path/to/SKILL.md> [--package-dir <dir>] [--json]

Exit codes:
    0  no errors (warnings may be present)
    1  errors found
    2  file unreadable
"""

import argparse
import json
import re
import sys
from pathlib import Path

# Sections 1-13 of the compiled-skill template. Each entry: (label, [heading keywords]).
REQUIRED_SECTIONS = [
    ("mission", ["mission"]),
    ("core definition", ["core definition", "definition", "what this skill"]),
    ("scope", ["scope"]),
    ("out of scope", ["out of scope", "not in scope", "excluded"]),
    ("activation triggers", ["activation", "trigger"]),
    ("goals", ["goal", "objective"]),
    ("domain model", ["domain model", "domain", "vocabulary", "ontology"]),
    ("knowledge taxonomy", ["taxonomy", "knowledge types", "rule types"]),
    ("required inputs", ["required input", "inputs"]),
    ("evidence rules", ["evidence"]),
    ("confidence model", ["confidence", "uncertainty"]),
    ("main workflow", ["workflow", "procedure", "process", "pipeline"]),
]

RECOMMENDED_SECTIONS = [
    ("decision rules", ["decision"]),
    ("exceptions", ["exception", "boundary", "fails when"]),
    ("tool usage", ["tool"]),
    ("output contracts", ["output"]),
    ("failure handling", ["failure", "error handling"]),
    ("escalation rules", ["escalat"]),
    ("safety boundaries", ["safety", "autonomy", "boundaries"]),
    ("quality gates", ["quality gate", "quality"]),
    ("examples", ["example"]),
    ("counterexamples", ["counterexample", "counter-example"]),
    ("anti-patterns", ["anti-pattern", "antipattern"]),
    ("test cases", ["test"]),
    ("definition of done", ["definition of done", "done"]),
    ("versioning", ["version", "update"]),
]

# Unresolved abstraction: phrases that hand the decision back to a human who is not there.
BANNED_PHRASES = [
    "best judgment", "good judgment", "professional judgment", "sound judgment",
    "act like an expert", "act as an expert", "behave like an expert",
    "use common sense", "common sense",
    "consider all factors", "consider all relevant factors", "take everything into account",
    "do your best", "as best you can",
    "choose the best option", "pick the best approach",
    "use your discretion", "at your discretion",
]

SOFT_PHRASES = ["as appropriate", "as needed", "if necessary", "where relevant", "etc."]

# Absolute rules that ought to carry a stated boundary.
ABSOLUTE_RE = re.compile(r"\b(never|always|must not|must always|under no circumstances)\b", re.I)
BOUNDARY_MARKERS = [
    "fails_when", "fails when", "except", "unless", "exception", "boundary",
    "applies_when", "applies when", "does not apply",
]

CONFIDENCE_LEVELS = ["confirmed", "probable", "hypothesis", "unknown", "conflicted"]

PACKAGE_FILES = {
    "test-cases.yaml": "error",
    "knowledge-map.md": "warning",
    "decision-rules.md": "warning",
    "source-ledger.md": "warning",
    "knowledge-gaps.md": "warning",
    "change-log.md": "warning",
}


class Report:
    def __init__(self):
        self.errors = []
        self.warnings = []

    def error(self, check, message, line=None):
        self.errors.append({"check": check, "message": message, "line": line})

    def warn(self, check, message, line=None):
        self.warnings.append({"check": check, "message": message, "line": line})

    @property
    def ok(self):
        return not self.errors


def split_frontmatter(text):
    """Return (frontmatter_dict, body, body_offset). Minimal parser: name/description only."""
    if not text.startswith("---"):
        return None, text, 0
    end = text.find("\n---", 3)
    if end == -1:
        return None, text, 0
    raw = text[3:end]
    body = text[end + 4:]
    offset = text[:end + 4].count("\n")

    fm, key = {}, None
    for line in raw.splitlines():
        m = re.match(r"^([a-zA-Z_-]+):\s*(.*)$", line)
        if m:
            key = m.group(1)
            fm[key] = m.group(2).strip()
        elif key and line.strip():
            fm[key] = (fm[key] + " " + line.strip()).strip()
    return fm, body, offset


def headings(body):
    return [
        (i + 1, m.group(2).strip().lower())
        for i, line in enumerate(body.splitlines())
        if (m := re.match(r"^(#{1,4})\s+(.*)$", line))
    ]


def find_section(heads, keywords):
    return any(any(k in title for k in keywords) for _, title in heads)


def check_frontmatter(fm, rep):
    if fm is None:
        rep.error("frontmatter", "No YAML frontmatter. A skill without frontmatter never triggers.")
        return
    name = fm.get("name", "")
    desc = fm.get("description", "")

    if not name:
        rep.error("frontmatter", "Missing 'name'.")
    elif not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name):
        rep.error("frontmatter", f"name '{name}' is not kebab-case.")

    if not desc:
        rep.error("frontmatter", "Missing 'description' — this is the only trigger mechanism.")
        return
    if len(desc) < 80:
        rep.error(
            "frontmatter",
            f"description is {len(desc)} chars; too thin to trigger reliably. "
            "State what the agent can do AND the request patterns that fire it.",
        )
    if not re.search(r"\b(use when|use it when|triggers?|when the user|when asked)\b", desc, re.I):
        rep.warn(
            "frontmatter",
            "description states capability but no trigger condition. Add 'Use when …'.",
        )


def check_sections(body, rep):
    heads = headings(body)
    if not heads:
        rep.error("structure", "No headings. A skill with no sections cannot be navigated.")
        return

    for label, keys in REQUIRED_SECTIONS:
        if not find_section(heads, keys):
            rep.error("structure", f"Missing required section: {label}.")

    for label, keys in RECOMMENDED_SECTIONS:
        if not find_section(heads, keys):
            rep.warn("structure", f"Missing recommended section: {label}.")


def quoted_spans(line):
    """Character ranges enclosed in quotes or backticks.

    Citing a forbidden phrase in order to forbid it is legitimate; instructing with it is not.
    """
    spans = []
    for opener, closer in (('"', '"'), ("'", "'"), ("\u201c", "\u201d"), ("`", "`")):
        start = None
        for i, ch in enumerate(line):
            if start is None and ch == opener:
                start = i
            elif start is not None and ch == closer and i > start:
                spans.append((start, i))
                start = None
    return spans


def is_quoted(line, index, length):
    return any(a < index and index + length - 1 < b for a, b in quoted_spans(line))


def check_phrases(body, offset, rep):
    lowered = body.lower().splitlines()
    for idx, line in enumerate(lowered):
        for phrase in BANNED_PHRASES:
            # check every occurrence: quoted once and used unquoted later is still a violation
            positions = [m.start() for m in re.finditer(re.escape(phrase), line)]
            if not any(not is_quoted(line, pos, len(phrase)) for pos in positions):
                continue
            if True:
                rep.error(
                    "abstraction",
                    f"Unresolved abstraction: \"{phrase}\". Convert to observable behavior "
                    "(signals, threshold, action) via the abstraction ladder.",
                    offset + idx + 1,
                )
        for phrase in SOFT_PHRASES:
            if phrase in line:
                rep.warn("abstraction", f"Vague qualifier: \"{phrase}\".", offset + idx + 1)


def check_boundaries(body, offset, rep):
    lines = body.splitlines()
    lowered_body = body.lower()
    absolutes = [
        (offset + i + 1, line.strip())
        for i, line in enumerate(lines)
        if ABSOLUTE_RE.search(line)
    ]
    if not absolutes:
        return
    has_boundaries = any(m in lowered_body for m in BOUNDARY_MARKERS)
    if not has_boundaries:
        first = absolutes[0]
        rep.error(
            "boundaries",
            f"{len(absolutes)} absolute rule(s) and no boundary of applicability anywhere "
            "(no 'unless' / 'except' / 'fails_when'). Every rule needs a stated limit.",
            first[0],
        )
    elif len(absolutes) > 12:
        rep.warn(
            "boundaries",
            f"{len(absolutes)} absolute rules. Check each has its own boundary, "
            "not just one shared exception section.",
        )


def check_autonomy(body, rep):
    lowered = body.lower()
    if "escalat" not in lowered:
        rep.error(
            "safety",
            "No escalation rules. The agent cannot know when to stop deciding alone.",
        )
    if not any(level in lowered for level in CONFIDENCE_LEVELS):
        rep.error(
            "safety",
            "No confidence model. Bind confidence levels to permitted autonomy.",
        )
    if not re.search(r"(reversib|cannot be undone|undo)", lowered):
        rep.warn("safety", "Irreversibility is never mentioned; it is the main escalation trigger.")


def check_executability(body, rep):
    lowered = body.lower()
    if not re.search(r"\b(if|when)\b.*\bthen\b", lowered) and "|" not in body:
        rep.warn(
            "executability",
            "No conditional logic and no tables — decisions may be under-specified.",
        )
    if not re.search(r"\b(inputs?|given)\b", lowered):
        rep.error("executability", "Inputs are never specified.")
    if not re.search(r"\b(outputs?|deliverables?|returns)\b", lowered):
        rep.error("executability", "No output contract.")


def check_size(body, rep):
    n = len(body.strip().splitlines())
    if n > 500:
        rep.warn(
            "modularity",
            f"Body is {n} lines (>500). Move stage-specific depth into references/.",
        )
    if n < 40:
        rep.warn("coverage", f"Body is {n} lines. Likely under-specified.")


def check_traceability(body, rep):
    if not re.search(r"\b(source|provenance|ledger|derived from|per §|section \d)\b", body, re.I):
        rep.warn("traceability", "No source references. Rules cannot be traced to their origin.")


def check_package(package_dir, rep):
    d = Path(package_dir)
    if not d.is_dir():
        rep.error("package", f"Package directory not found: {package_dir}")
        return
    for filename, severity in PACKAGE_FILES.items():
        if not (d / filename).exists():
            msg = f"Missing artifact: {filename}"
            if severity == "error":
                rep.error("package", msg + " — behavior is unverified without test cases.")
            else:
                rep.warn("package", msg)


def main():
    ap = argparse.ArgumentParser(description="Lint a compiled agent skill.")
    ap.add_argument("skill", help="path to SKILL.md")
    ap.add_argument("--package-dir", help="directory holding the companion artifacts")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    args = ap.parse_args()

    path = Path(args.skill)
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        print(f"cannot read {path}: {exc}", file=sys.stderr)
        return 2

    rep = Report()
    fm, body, offset = split_frontmatter(text)

    check_frontmatter(fm, rep)
    check_sections(body, rep)
    check_phrases(body, offset, rep)
    check_boundaries(body, offset, rep)
    check_autonomy(body, rep)
    check_executability(body, rep)
    check_size(body, rep)
    check_traceability(body, rep)
    if args.package_dir:
        check_package(args.package_dir, rep)

    if args.json:
        print(json.dumps({
            "file": str(path),
            "ok": rep.ok,
            "errors": rep.errors,
            "warnings": rep.warnings,
        }, indent=2, ensure_ascii=False))
        return 0 if rep.ok else 1

    def render(items, label):
        for it in items:
            loc = f":{it['line']}" if it["line"] else ""
            print(f"{label} [{it['check']}] {path.name}{loc}: {it['message']}")

    render(rep.errors, "ERROR  ")
    render(rep.warnings, "WARNING")

    print()
    if rep.ok and not rep.warnings:
        print("PASS — no mechanical defects. Behavioral validation still required.")
    elif rep.ok:
        print(f"PASS with {len(rep.warnings)} warning(s). Behavioral validation still required.")
    else:
        print(f"FAIL — {len(rep.errors)} error(s), {len(rep.warnings)} warning(s).")
    return 0 if rep.ok else 1


if __name__ == "__main__":
    sys.exit(main())
