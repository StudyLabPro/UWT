# Шаги, которые может сделать только владелец (июль 2026)

Свод действий, оставшихся после автоматизированного закрытия плана развития
U0–U3 (2026-07-13). Технические артефакты готовы; ниже — решения и секреты.

## 1. Патентный гейт (блокер всего остального)

**Решить: подаётся ли provisional** «Computer-implemented relational simulation
and prediction using compensated relation dynamics» — ДО открытия репозитория
и/или arXiv-публикаций с applied-деталями.

- Драфт-материалы: `papers/patents/relational_simulation_provisional/README.md`
  (3 независимых claim-драфта; статус: **not filed**).
- Правила: `papers/arxiv/uwt_bilingual/patent_gate.md`.
- Ревью статьи выполнено: `papers/arxiv/uwt_bilingual/ENABLING_REVIEW.md` —
  **main.tex целиком SAFE**, статья может идти theory-first (ветка шага 3
  Publication Order) независимо от решения по provisional.
- ВАЖНО: репозиторий GitHub сейчас приватен. Пакет `modeling/` содержит
  enabling-реализацию — **не делать репозиторий публичным** до решения по
  provisional (file-first или осознанный defensive-publication).

## 2. Подача UWT в arXiv (всё подготовлено)

Пакет: `papers/arxiv/uwt_bilingual/uwt_bilingual_arxiv.tar.gz` (пересобран
2026-07-13; внутри только `00README.XXX` + `main.tex`). Осталось лично:

1. ORCID автора + проверка необходимости endorsement для `math-ph`.
2. Категории: primary `math-ph`, cross-list `gr-qc`, `physics.gen-ph`.
3. Лицензия arXiv (необратима!) — консервативный дефолт: arXiv perpetual
   non-exclusive; CC BY 4.0 только если совместимо с журнальными планами.
4. Загрузка tarball, компилятор XeLaTeX, comments: «Bilingual English/Russian
   submission».
5. После acceptance: проставить arXiv ID в README.md, CITATION.cff, сайт.

Порядок с ACT/Balansis-paper: ACT подаётся **только после** ACT P0 provisional
(иначе необратимая потеря прав EP/JP/CN) — см. экосистемный план
`../../docs/OPEN_REPOSITORY_PUBLICATION_PATENT_COMMERCIALIZATION_PLAN_2026-07-10.md`.

## 3. Stripe (донаты end-to-end)

Код готов (webhook с проверкой подписи, идемпотентный учёт, статистика,
smoke-тест зелёный). Осталось:

1. В Stripe Dashboard → Webhooks добавить endpoint
   `https://uwt.xteam.pro/api/stripe/webhook`, событие
   `checkout.session.completed`; скопировать signing secret.
2. Прописать `STRIPE_WEBHOOK_SECRET=whsec_…` в `.env` оркестратора
   (переменная уже заведена в compose и `environments/.env.dev.example`).
3. Пересоздать контейнер `uwt-donations-api` из обновлённого образа
   (появится volume `donations-data:/data` для журнала).

## 3a. Деплой обновлённого сайта (образ уже собран)

Образ `dev-uwt-web` пересобран 2026-07-13 со всеми обновлениями (i18n RU/EN,
футер с цитированием, пререндер, og-image.png, локализованный контент), но
живой контейнер намеренно не пересоздавался (production-действие). Выполнить:

```bash
docker rm -f dev-uwt-web-1 && docker run -d --name dev-uwt-web-1 \
  --network dev-studyninja-network -p 3100:80 --restart unless-stopped \
  -l 'traefik.enable=true' \
  -l 'traefik.docker.network=dev-studyninja-network' \
  -l 'traefik.http.routers.uwt-web-dev.rule=Host(`uwt.xteam.pro`)' \
  -l 'traefik.http.routers.uwt-web-dev.entrypoints=websecure' \
  -l 'traefik.http.routers.uwt-web-dev.tls.certresolver=letsencrypt' \
  -l 'traefik.http.services.uwt-web-dev.loadbalancer.server.port=80' \
  dev-uwt-web
curl -sI https://uwt.xteam.pro/act/ | head -1   # ожидается 200
```

(Либо дождаться следующего `make dev` — labels уже прописаны в
`docker/docker-compose.dev-traefik.yml`.)

## 4. Конфигурация dev-стека

- В `.env`/`.env.dev` оркестратора отсутствует обязательная
  `TRAEFIK_BASIC_AUTH_USERS` (защита infra-дашбордов; шаблон —
  `environments/.env.dev.example`). Без неё полный `make dev` упадёт.
  Сгенерировать: `htpasswd -nB admin`.
- Незакоммиченные изменения в двух репозиториях (UWT + StudyNinja-Eco) —
  закоммитить после ревью.

## 5. U4 «Мост в экосистему» (намеренно отложен)

UWT→MagicBrain substrate-control bridge и ACT-telemetry-as-control — в списке
«File First Or Remove» патентного гейта. Начинать **только после** решения по
provisional (п. 1). План фазы — в отчёте визионера (журнал сессии 2026-07-13).

## 6. Публикация Balansis на PyPI / CI

CI (`.github/workflows/ci.yml`) ставит `balansis==1.0.0` с PyPI — версия там
есть, ничего делать не нужно. Если понадобится обновить Balansis — публикация
новой версии на PyPI требует ваших учётных данных.

## 7. Научная гигиена (по желанию, быстро)

- PDF монографий пересобраны XeLaTeX 2026-07-13 (был установлен texlive-xetex +
  Times New Roman). В логах ~300 предупреждений polyglossia про отсутствие
  OpenType-тега кириллицы у msttcorefonts — кириллица в PDF есть, но стоит
  визуально пролистать обе PDF перед распространением; альтернатива —
  перейти на шрифт с полноценным `cyrl`-скриптом (XITS/STIX, PT Serif).
- Negative-results заметка готова: `papers/notes/negative_results_wavefunction_arrow.md`
  — можно публиковать (SAFE-категория гейта).
