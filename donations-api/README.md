# UWT Donations API

Минимальный Node.js API для создания Stripe Checkout Sessions для страницы `/donate`.

## Environment

- `STRIPE_SECRET_KEY` — live/test secret key Stripe. Не хранить в git.
- `UWT_PUBLIC_URL` — публичный URL сайта, например `https://uwt.xteam.pro`.
- `UWT_DONATION_CURRENCY` — валюта Stripe, по умолчанию `usd`.
- `UWT_DONATION_MIN_MINOR` — минимум в центах, по умолчанию `100`.
- `UWT_DONATION_MAX_MINOR` — максимум в центах, по умолчанию `500000`.
- `UWT_ALLOWED_ORIGINS` — опциональный список разрешённых origin через запятую.
