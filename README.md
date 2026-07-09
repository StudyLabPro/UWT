[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20Commercial-blue.svg)](./LICENSING.md)

# Unified Whole Theory (UWT)

Единый каталог материалов по Unified Whole Theory.

На русском: **ТЕЦ — Теория Единого Целого**.

## Структура

- `theory/` — основная монография и исходники LaTeX/Markdown.
- `papers/` — отдельные документы с решениями открытых задач и проблем.
- `modeling/` — Python-проект для моделирования, проверки и прогнозирования UWT.

## Быстрый запуск модели

```powershell
cd "modeling"
python -m pip install -e .[test]
pytest
uwt-model --steps 200 --parts 24 --out results/run.json
```

## Быстрый запуск web-платформы

```powershell
cd "web-app"
npm install
npm run dev
```

## Полная проверка проекта

```powershell
cd "."
.\check-all.ps1
```

Скрипт выполняет:

- `npm run build` для `web-app`;
- `npm run lint` для `web-app`;
- `python -m pytest` для `modeling`.

## Лицензия

Copyright (c) 2026 Andrey Tikhonov.

UWT распространяется по дуальной лицензии:

- [LICENSE](LICENSE): AGPL-3.0
- [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md): коммерческие проприетарные условия
- [LICENSING.md](LICENSING.md): руководство по выбору лицензионного маршрута

Коммерческие материалы:

- [ORDER_FORM_TEMPLATE.md](ORDER_FORM_TEMPLATE.md)
- [NOTICE](NOTICE)

Copyright (c) 2026 Andrey Tikhonov (XTeam-Pro). All rights reserved.
