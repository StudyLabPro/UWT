# Unified Whole Theory (UWT)

Единый каталог материалов по Unified Whole Theory.

На русском: **ТЕЦ — Теория Единого Целого**.

## Структура

- `theory/` — основная монография и исходники LaTeX/Markdown.
- `papers/` — отдельные документы с решениями открытых задач и проблем.
- `modeling/` — Python-проект для моделирования, проверки и прогнозирования UWT.

## Быстрый запуск модели

```powershell
cd "Unified Whole Theory\modeling"
python -m pip install -e .[test]
pytest
uwt-model --steps 200 --parts 24 --out results/run.json
```
