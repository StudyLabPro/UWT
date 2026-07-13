# UWT Donations API

Zero-dependency Node.js API (без npm-зависимостей) для донатов страницы `/donate`:
Stripe Checkout + webhook-учёт платежей + публичная статистика.

## Endpoints

- `POST /api/stripe/create-checkout-session` — создать Stripe Checkout Session
  (`{amount, donorName?, message?, email?}` → `{url}`); 503 без `STRIPE_SECRET_KEY`.
- `POST /api/stripe/webhook` — приём событий Stripe с проверкой подписи
  (HMAC-SHA256, допуск 5 минут, `timingSafeEqual`); `checkout.session.completed`
  идемпотентно (по `event.id`) пишется в JSONL-журнал `DONATIONS_LOG_PATH`.
  Приватность: сохраняются имя/сумма/валюта, email и сообщение — нет.
  503 без `STRIPE_WEBHOOK_SECRET`.
- `GET /api/donations/stats` — публичная статистика `{count, totals, total_usd}`
  (агрегаты из журнала, без персональных данных).
- `GET /healthz` — 204.

Общие механики: CORS-allowlist, rate-limit 30/мин/IP, лимит тела 16KB.

## Настройка webhook в Stripe

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**.
2. URL: `https://uwt.xteam.pro/api/stripe/webhook`.
3. Событие: `checkout.session.completed`.
4. Скопировать **Signing secret** (`whsec_…`) в `STRIPE_WEBHOOK_SECRET`.

## Environment

Полный список с примерами — в `.env.example`. Ключевые:

- `STRIPE_SECRET_KEY` — live/test secret key Stripe. Не хранить в git.
- `STRIPE_WEBHOOK_SECRET` — signing secret webhook-эндпоинта (см. выше).
- `DONATIONS_LOG_PATH` — путь JSONL-журнала (в Docker — `/data/donations.jsonl` на volume).
- `UWT_PUBLIC_URL` — публичный URL сайта, например `https://uwt.xteam.pro`.
- `UWT_DONATION_CURRENCY` / `UWT_DONATION_MIN_MINOR` / `UWT_DONATION_MAX_MINOR` — валюта и границы.
- `UWT_ALLOWED_ORIGINS` — список разрешённых origin через запятую.

## Запуск

```bash
node server.mjs                 # локально
npm test                        # smoke-тест (test/smoke.mjs)

docker build -t uwt-donations-api .           # автономный образ (Dockerfile здесь)
docker run -p 8080:8080 --env-file .env -v donations-data:/data uwt-donations-api
```

В оркестраторе StudyNinja-Eco сервис описан в `docker/docker-compose.apps.yml`
(`uwt-donations-api`, build через `docker/uwt-donations-api.Dockerfile`,
volume `donations-data:/data`); секреты — в `.env` окружения.
