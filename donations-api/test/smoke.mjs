/**
 * Smoke-тест donations API: поднимает server.mjs как дочерний процесс на
 * случайном порту и проверяет healthz, деградацию без ключей, webhook-подпись
 * и статистику. Запуск: `npm test` (или node test/smoke.mjs).
 */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import crypto from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const serverPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'server.mjs')
const WEBHOOK_SECRET = 'whsec_smoke_test_secret'

function startServer(env) {
  const child = spawn(process.execPath, [serverPath], {
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server start timeout')), 5000)
    child.stdout.on('data', (chunk) => {
      if (String(chunk).includes('listening')) {
        clearTimeout(timer)
        resolve(child)
      }
    })
    child.on('exit', (code) => reject(new Error(`server exited early: ${code}`)))
  })
}

function stripeSignature(rawBody, secret, timestampSeconds = Math.floor(Date.now() / 1000)) {
  const signature = crypto.createHmac('sha256', secret).update(`${timestampSeconds}.${rawBody}`).digest('hex')
  return `t=${timestampSeconds},v1=${signature}`
}

const port = 18000 + Math.floor(Math.random() * 2000)
const base = `http://127.0.0.1:${port}`
const dataDir = mkdtempSync(join(tmpdir(), 'uwt-donations-'))

const server = await startServer({
  PORT: String(port),
  STRIPE_SECRET_KEY: '',
  STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
  DONATIONS_LOG_PATH: join(dataDir, 'donations.jsonl'),
})

try {
  // 1. healthz
  assert.equal((await fetch(`${base}/healthz`)).status, 204, 'healthz should be 204')

  // 2. checkout без STRIPE_SECRET_KEY → 503
  const checkout = await fetch(`${base}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: '10' }),
  })
  assert.equal(checkout.status, 503, 'checkout without secret key should be 503')

  // 3. webhook: неверная подпись → 400
  const badEvent = JSON.stringify({ id: 'evt_bad', type: 'checkout.session.completed' })
  const badSig = await fetch(`${base}/api/stripe/webhook`, {
    method: 'POST',
    headers: { 'stripe-signature': stripeSignature(badEvent, 'whsec_wrong_secret') },
    body: badEvent,
  })
  assert.equal(badSig.status, 400, 'wrong webhook signature should be 400')

  // 4. webhook: устаревшая метка времени → 400
  const staleSig = await fetch(`${base}/api/stripe/webhook`, {
    method: 'POST',
    headers: {
      'stripe-signature': stripeSignature(badEvent, WEBHOOK_SECRET, Math.floor(Date.now() / 1000) - 3600),
    },
    body: badEvent,
  })
  assert.equal(staleSig.status, 400, 'stale webhook timestamp should be 400')

  // 5. webhook: корректная подпись + checkout.session.completed → 200 и учёт
  const goodEvent = JSON.stringify({
    id: 'evt_smoke_1',
    type: 'checkout.session.completed',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'cs_smoke_1',
        amount_total: 2500,
        currency: 'usd',
        metadata: { donor_name: 'Smoke Tester' },
      },
    },
  })
  const goodResponse = await fetch(`${base}/api/stripe/webhook`, {
    method: 'POST',
    headers: { 'stripe-signature': stripeSignature(goodEvent, WEBHOOK_SECRET) },
    body: goodEvent,
  })
  assert.equal(goodResponse.status, 200, 'valid webhook should be 200')

  // 6. идемпотентность: повтор того же event.id не задваивает статистику
  await fetch(`${base}/api/stripe/webhook`, {
    method: 'POST',
    headers: { 'stripe-signature': stripeSignature(goodEvent, WEBHOOK_SECRET) },
    body: goodEvent,
  })

  const stats = await (await fetch(`${base}/api/donations/stats`)).json()
  assert.equal(stats.count, 1, `stats.count should be 1, got ${stats.count}`)
  assert.equal(stats.total_usd, 25, `stats.total_usd should be 25, got ${stats.total_usd}`)

  console.log('SMOKE OK: healthz, 503-degradation, webhook signature/staleness, accounting, idempotency, stats')
} finally {
  server.kill()
  rmSync(dataDir, { recursive: true, force: true })
}
