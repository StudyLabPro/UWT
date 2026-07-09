# Unified Whole Theory (UWT)

Единый каталог материалов по Unified Whole Theory.

На русском: **ТЕЦ — Теория Единого Целого**.

## Структура

- `theory/` — основная монография и исходники LaTeX/Markdown.
- `papers/` — отдельные документы с решениями открытых задач и проблем.
- `modeling/` — Python-проект для моделирования, проверки и прогнозирования UWT.

## Быстрый запуск модели

```powershell
cd "UnifiedWholeTheory\modeling"
python -m pip install -e .[test]
pytest
uwt-model --steps 200 --parts 24 --out results/run.json
```

## Быстрый запуск web-платформы

```powershell
cd "UnifiedWholeTheory\web-app"
npm install
npm run dev
```

## Полная проверка проекта

```powershell
cd "UnifiedWholeTheory"
.\check-all.ps1
```

Скрипт выполняет:

- `npm run build` для `web-app`;
- `npm run lint` для `web-app`;
- `python -m pytest` для `modeling`.
