---
name: xteam-infra
description: "Карта доступов и рабочих команд для инфраструктуры XTeam.Pro — этот сервер (185.233.3.14), dev-сервер, кластер Cloud.ru, Plesk (DNS и почта), Cloud.ru API, GitHub, реестры и базы. Используй, когда нужно что-то посмотреть, развернуть, починить или изменить в инфраструктуре: домены и DNS, контейнеры, Kubernetes, сертификаты, почта, заявки, снапшот инфраструктуры."
---

# Инфраструктура XTeam.Pro: доступы и команды

**Полный реестр доступов: `/root/.config/agent-access/ACCESS.md`** — 12 серверов SSH, 1cloud (3
аккаунта), Kubernetes, Cloud.ru, Plesk, GitHub, почта, расположение всех секретов. Нужные почтовые
ящики и их статус — `/root/.config/agent-access/MAILBOXES.md`. Этот скилл — краткая версия того же.

Этот скилл — **реестр точек доступа и рабочих инструментов**. Правила поведения задают соседние
скиллы, и они главнее: `xteam-control-center` (доктрина: лаборатория наблюдает прод, прод никогда
не зависит от лаборатории; чек-лист перед изменением), `production-access` (граница наблюдения и
изменения, least privilege, обращение с секретами), `infra-inventory` (как устанавливать факты),
`observability-ops` (метрики и логи). Сначала доктрина — потом команды отсюда.

Все секреты лежат в файлах с правами 600 и **никогда не попадают в git и в ответы**.
Называй переменную или путь, а не значение.

## Где что находится

| Контур | Где | Чем управлять |
|---|---|---|
| Лаборатория (сайты, dev-стенд, ИИ-лаборатория) | этот сервер, 185.233.3.14, root | `docker`, compose-проекты в `/root/*` |
| Второй сервер | 188.94.155.20 | `ssh dev "команда"` |
| Продакшен StudyNinja | Kubernetes в Cloud.ru | `kubectl` (контекст `prod`), Helm-чарт в `StudyNinja-Eco/deploy/charts` |
| Домены, DNS, почта | Plesk `dns1.xteam.pro:8443` (авторитативный NS зон) | `xt-plesk` |
| Облачный аккаунт | Cloud.ru, andrew@xteam.pro | `xt-cloudru` |
| Серверы (хостинг) | 1cloud.ru, 3 отдельных аккаунта | `xt-1cloud -p <проект>` |
| Код | GitHub: организация `XTeam-Pro` + личные репозитории `AndrewHakmi` | `gh` (авторизован) |
| Автоматизация | n8n Cloud, `studylabpro.app.n8n.cloud` | MCP `n8n-mcp` в Codex |

## Готовые инструменты

```bash
xt-plesk domains                        # домены в панели
xt-plesk dns xteam.pro                  # все записи зоны с их id
xt-plesk dns-set <id> 185.233.3.14      # переставить запись
xt-plesk dns-add xteam.pro A sub.xteam.pro 185.233.3.14   # host обязательно FQDN
xt-plesk dns-del <id>
xt-plesk get /path                      # любой GET к Plesk API v2

xt-cloudru token                        # получить/обновить токен (кэш ~/.config/cloudru/.token)
xt-cloudru whoami                       # чей аккаунт (проверено: andrew@xteam.pro)
xt-cloudru get <url>                    # GET к любому эндпоинту Cloud.ru

xt-1cloud projects                      # какие проекты 1cloud доступны с этого сервера
xt-1cloud -p xteam servers              # серверы проекта (xteam | aplo | starexpo)
xt-1cloud -p all servers                # по всем трём проектам сразу
xt-1cloud -p aplo account               # владелец, баланс, дата оплаты
xt-1cloud -p starexpo get /SshKey       # любой GET к API 1cloud

xt-infra-snapshot                       # пересобрать снапшот инфраструктуры
xt-1cloud-snapshot                      # обновить данные 1cloud для карты

codex mcp get n8n-mcp                   # n8n MCP; Authorization маскируется
codex mcp list                          # все MCP-серверы Codex
```

Карта инфраструктуры: **https://infra.xteam.pro** (basic-auth, логин `xteam`,
пароль в `/root/.config/agent-access/infra-map-password`). Обновляется по cron каждые 10 минут,
исходники — `/root/infra-map`.

## Расположение секретов

| Что | Файл | Ключи |
|---|---|---|
| Plesk | `/root/.config/plesk/credentials` | `PLESK_URL`, `PLESK_USER`, `PLESK_PASS` |
| Cloud.ru | `/root/.config/cloudru/credentials` | `CLOUDRU_KEY_ID`, `CLOUDRU_KEY_SECRET` |
| 1cloud.ru | `/root/.config/1cloud/credentials` | ключи проектов `xteam`, `aplo`, `starexpo` |
| Kubernetes | `~/.kube/config` | контекст `prod` |
| GitHub | `~/.config/gh/hosts.yml` | токен `gh` |
| n8n Cloud MCP | `/root/.codex/config.toml` | `mcp_servers.n8n-mcp.http_headers.Authorization` |
| SSH | `~/.ssh/id_ed25519`, алиасы в `~/.ssh/config` | хост `dev` |
| Telegram-бот заявок, OpenAI | `/root/xteam-pro-site/.env`, `/root/AVA/.env`, `/root/StudyNinja-Eco/.env` | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_THREAD_ID`, `OPENAI_API_KEY` |
| Пароль карты инфраструктуры | `/root/.config/agent-access/infra-map-password` | — |

## Что известно про Cloud.ru API

Аутентификация работает: ключ обменивается на токен через `https://iam.api.cloud.ru/api/v1/auth/token`,
токен валиден и опознаётся как `andrew@xteam.pro`. Конкретные REST-пути управления ресурсами пока
**не подтверждены**: `console.api.cloud.ru` и `mk8s.api.cloud.ru` отвечают 404/`code:5` на
перепробованные пути (хост `mk8s.api.cloud.ru` живой — значит адрес верный, ошибается путь).
Практический вывод: кластером управляем через `kubectl` (он настроен и работает), а REST нужен
только для операций уровня аккаунта. Когда понадобится — свериться с документацией Cloud.ru
Evolution и дописать пути в `xt-cloudru`.

## Правила

1. **Разрушительное — только по явной просьбе владельца.** Удаление записей DNS, томов, баз,
   `docker compose down -v`, `kubectl delete`, force-push — сначала спроси.
2. **Секреты не выводить.** Ни в ответ пользователю, ни в коммит, ни в файл внутри репозитория.
   `.env` во всех проектах в `.gitignore` — так и оставить.
3. **Публичные порты.** Наружу (0.0.0.0) слушает только Traefik на 80/443. Любой новый сервис
   вешать на `127.0.0.1:<порт>` и выпускать через Traefik-лейблы. Свободные порты смотреть
   в `ss -tlnp` (заняты 3100–3105).
4. **Правило DOCKER-USER.** В `/etc/iptables/rules.v4` первым идёт правило conntrack
   `RELATED,ESTABLISHED → RETURN`. Без него контейнеры теряют исходящую связь (уже ломало выпуск
   сертификатов). Не удалять.
5. **Traefik.** Домен подключается лейблами на контейнере + сеть `dev-studyninja-network`,
   certresolver `letsencrypt`. Сертификат выпустится сам, если A-запись уже указывает на сервер;
   иначе сначала DNS, потом `docker restart <контейнер>`.
6. **Kubernetes = продакшен.** Менять только осознанно; выкатка образов — `make push-stage` /
   `make push-prod` из `StudyNinja-Eco`, затем `helm upgrade` с явным тегом.
