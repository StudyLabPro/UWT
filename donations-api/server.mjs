import crypto from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import http from 'node:http'
import { dirname } from 'node:path'

const port = Number(process.env.PORT || 8080)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
const donationsLogPath = process.env.DONATIONS_LOG_PATH || 'data/donations.jsonl'
const webhookToleranceSeconds = 300
const stripeApiVersion = process.env.STRIPE_API_VERSION || ''
const currency = (process.env.UWT_DONATION_CURRENCY || 'usd').trim().toLowerCase()
const minDonationMinor = readPositiveInteger(process.env.UWT_DONATION_MIN_MINOR, 100)
const maxDonationMinor = readPositiveInteger(process.env.UWT_DONATION_MAX_MINOR, 500000)
const publicUrl = trimTrailingSlash(process.env.UWT_PUBLIC_URL || '')
const allowedOrigins = new Set(
  (process.env.UWT_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => trimTrailingSlash(origin.trim()))
    .filter(Boolean),
)
const rateLimitWindowMs = readPositiveInteger(process.env.UWT_DONATION_RATE_LIMIT_WINDOW_MS, 60000)
const rateLimitMax = readPositiveInteger(process.env.UWT_DONATION_RATE_LIMIT_MAX, 30)
const rateLimitBuckets = new Map()

function readPositiveInteger(value, fallback) {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function jsonResponse(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  })
  response.end(JSON.stringify(body))
}

function emptyResponse(response, statusCode, headers = {}) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    ...headers,
  })
  response.end()
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk

      if (body.length > 16_384) {
        reject(new Error('REQUEST_TOO_LARGE'))
        request.destroy()
      }
    })

    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('INVALID_JSON'))
      }
    })

    request.on('error', reject)
  })
}

function parseAmountToMinorUnits(value) {
  const normalized = String(value || '').trim().replace(',', '.')

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error('INVALID_AMOUNT')
  }

  const [wholePart, fractionPart = ''] = normalized.split('.')
  const minorUnits = Number(BigInt(wholePart) * 100n + BigInt((fractionPart + '00').slice(0, 2)))

  if (!Number.isSafeInteger(minorUnits) || minorUnits < minDonationMinor || minorUnits > maxDonationMinor) {
    throw new Error('INVALID_AMOUNT_RANGE')
  }

  return minorUnits
}

function sanitizeText(value, maxLength) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function sanitizeEmail(value) {
  const email = sanitizeText(value, 160).toLowerCase()

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

function getBaseUrl(request) {
  if (publicUrl) {
    return publicUrl
  }

  const forwardedProto = request.headers['x-forwarded-proto']
  const forwardedHost = request.headers['x-forwarded-host']
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || 'https'
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || request.headers.host

  return `${protocol}://${host}`
}

function getCorsHeaders(request) {
  const origin = trimTrailingSlash(request.headers.origin || '')

  if (!origin) {
    return {}
  }

  const baseUrl = getBaseUrl(request)
  const requestHost = request.headers['x-forwarded-host'] || request.headers.host || ''
  const isSameHost = requestHost && origin.endsWith(`://${requestHost}`)
  const isAllowed = allowedOrigins.size > 0 ? allowedOrigins.has(origin) : origin === baseUrl || isSameHost

  if (!isAllowed) {
    return null
  }

  return {
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function rateLimitKey(request) {
  const forwardedFor = request.headers['x-forwarded-for']
  const firstForwardedAddress = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(',')[0]

  return firstForwardedAddress?.trim() || request.socket.remoteAddress || 'unknown'
}

function isRateLimited(request) {
  const key = rateLimitKey(request)
  const now = Date.now()
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || now - bucket.startedAt > rateLimitWindowMs) {
    rateLimitBuckets.set(key, { startedAt: now, count: 1 })
    return false
  }

  bucket.count += 1
  return bucket.count > rateLimitMax
}

async function createCheckoutSession(payload, request) {
  if (!stripeSecretKey) {
    const error = new Error('STRIPE_NOT_CONFIGURED')
    error.statusCode = 503
    throw error
  }

  const amountMinor = parseAmountToMinorUnits(payload.amount)
  const donorName = sanitizeText(payload.donorName, 80)
  const message = sanitizeText(payload.message, 280)
  const email = sanitizeEmail(payload.email)
  const baseUrl = getBaseUrl(request)
  const params = new URLSearchParams()

  params.set('mode', 'payment')
  params.set('submit_type', 'donate')
  params.set('locale', 'auto')
  params.set('success_url', `${baseUrl}/donate?donation=success&session_id={CHECKOUT_SESSION_ID}`)
  params.set('cancel_url', `${baseUrl}/donate?donation=cancelled`)
  params.set('line_items[0][price_data][currency]', currency)
  params.set('line_items[0][price_data][unit_amount]', String(amountMinor))
  params.set('line_items[0][price_data][product_data][name]', 'Поддержка проекта UWT')
  params.set(
    'line_items[0][price_data][product_data][description]',
    'Добровольный вклад в развитие цифрового атласа Unified Whole Theory',
  )
  params.set('line_items[0][quantity]', '1')
  params.set('metadata[project]', 'UWT')
  params.set('payment_intent_data[metadata][project]', 'UWT')

  if (donorName) {
    params.set('metadata[donor_name]', donorName)
    params.set('payment_intent_data[metadata][donor_name]', donorName)
  }

  if (message) {
    params.set('metadata[message]', message)
    params.set('payment_intent_data[metadata][message]', message)
  }

  if (email) {
    params.set('customer_email', email)
  }

  const headers = {
    Authorization: `Bearer ${stripeSecretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }

  if (stripeApiVersion) {
    headers['Stripe-Version'] = stripeApiVersion
  }

  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers,
    body: params,
  })
  const stripePayload = await stripeResponse.json().catch(() => ({}))

  if (!stripeResponse.ok || typeof stripePayload.url !== 'string') {
    console.error('Stripe Checkout session error', {
      status: stripeResponse.status,
      type: stripePayload?.error?.type,
      code: stripePayload?.error?.code,
    })

    const error = new Error('STRIPE_CHECKOUT_FAILED')
    error.statusCode = 502
    throw error
  }

  return { url: stripePayload.url }
}

// ---------------------------------------------------------------------------
// Учёт донатов: JSONL-журнал + идемпотентность по Stripe event.id.
// Приватность: имя/сумма/валюта; email и текст сообщения в журнал не пишутся.
// ---------------------------------------------------------------------------

const seenEventIds = new Set()
const donationTotals = new Map() // currency -> { count, totalMinor }

function registerDonationRecord(record) {
  if (!record?.event_id || seenEventIds.has(record.event_id)) {
    return false
  }
  seenEventIds.add(record.event_id)
  const key = String(record.currency || 'usd').toLowerCase()
  const bucket = donationTotals.get(key) || { count: 0, totalMinor: 0 }
  bucket.count += 1
  bucket.totalMinor += Number(record.amount_total) || 0
  donationTotals.set(key, bucket)
  return true
}

function loadDonationsLog() {
  try {
    if (!existsSync(donationsLogPath)) {
      return
    }
    for (const line of readFileSync(donationsLogPath, 'utf8').split('\n')) {
      if (!line.trim()) {
        continue
      }
      try {
        registerDonationRecord(JSON.parse(line))
      } catch {
        // Повреждённая строка журнала не должна ронять сервис.
      }
    }
  } catch (error) {
    console.error('Failed to load donations log', error)
  }
}

loadDonationsLog()

function appendDonationRecord(record) {
  if (!registerDonationRecord(record)) {
    return false
  }
  try {
    mkdirSync(dirname(donationsLogPath), { recursive: true })
    appendFileSync(donationsLogPath, `${JSON.stringify(record)}\n`)
  } catch (error) {
    console.error('Failed to append donations log', error)
  }
  return true
}

function readRawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0

    request.on('data', (chunk) => {
      size += chunk.length
      if (size > 16_384) {
        reject(new Error('REQUEST_TOO_LARGE'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

/**
 * Проверка подписи Stripe webhook: HMAC-SHA256 от `${t}.${rawBody}` с
 * signing secret, сравнение через timingSafeEqual, допуск по времени 5 минут.
 * https://docs.stripe.com/webhooks/signature
 */
function verifyStripeSignature(rawBody, signatureHeader) {
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return false
  }
  let timestamp = ''
  const candidateSignatures = []
  for (const part of signatureHeader.split(',')) {
    const [key, value] = part.split('=', 2)
    if (key?.trim() === 't') {
      timestamp = value?.trim() || ''
    } else if (key?.trim() === 'v1' && value) {
      candidateSignatures.push(value.trim())
    }
  }
  const timestampSeconds = Number(timestamp)
  if (!Number.isInteger(timestampSeconds) || candidateSignatures.length === 0) {
    return false
  }
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > webhookToleranceSeconds) {
    return false
  }
  const expected = crypto
    .createHmac('sha256', stripeWebhookSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest()
  return candidateSignatures.some((candidate) => {
    const candidateBuffer = Buffer.from(candidate, 'hex')
    return candidateBuffer.length === expected.length && crypto.timingSafeEqual(candidateBuffer, expected)
  })
}

async function handleStripeWebhook(request, response) {
  if (request.method !== 'POST') {
    jsonResponse(response, 405, { error: 'Method not allowed' }, { Allow: 'POST' })
    return
  }
  if (!stripeWebhookSecret) {
    jsonResponse(response, 503, { error: 'Stripe webhook пока не настроен на сервере.' })
    return
  }

  let rawBody
  try {
    rawBody = await readRawBody(request)
  } catch (error) {
    jsonResponse(response, error.message === 'REQUEST_TOO_LARGE' ? 413 : 400, { error: 'Bad request' })
    return
  }

  if (!verifyStripeSignature(rawBody, request.headers['stripe-signature'])) {
    jsonResponse(response, 400, { error: 'Invalid signature' })
    return
  }

  let event
  try {
    event = JSON.parse(rawBody.toString('utf8'))
  } catch {
    jsonResponse(response, 400, { error: 'Некорректный JSON.' })
    return
  }

  if (event?.type === 'checkout.session.completed') {
    const session = event.data?.object || {}
    appendDonationRecord({
      event_id: event.id,
      session_id: session.id || '',
      amount_total: Number(session.amount_total) || 0,
      currency: String(session.currency || currency).toLowerCase(),
      donor_name: sanitizeText(session.metadata?.donor_name, 80),
      created: Number(event.created) || Math.floor(Date.now() / 1000),
    })
  }

  jsonResponse(response, 200, { received: true })
}

function handleDonationStats(request, response, corsHeaders) {
  if (request.method !== 'GET') {
    jsonResponse(response, 405, { error: 'Method not allowed' }, { Allow: 'GET', ...corsHeaders })
    return
  }
  const totals = {}
  let count = 0
  for (const [key, bucket] of donationTotals) {
    totals[key] = { count: bucket.count, total_minor: bucket.totalMinor }
    count += bucket.count
  }
  jsonResponse(
    response,
    200,
    {
      count,
      totals,
      total_usd: Math.round((donationTotals.get('usd')?.totalMinor || 0)) / 100,
    },
    corsHeaders,
  )
}

async function handleRequest(request, response) {
  const url = new URL(request.url || '/', 'http://localhost')

  if (request.method === 'GET' && url.pathname === '/healthz') {
    emptyResponse(response, 204)
    return
  }

  if (url.pathname === '/api/stripe/webhook') {
    // Stripe шлёт server-to-server — CORS не применяется, но rate-limit оставляем.
    if (isRateLimited(request)) {
      jsonResponse(response, 429, { error: 'Too many requests' })
      return
    }
    await handleStripeWebhook(request, response)
    return
  }

  if (url.pathname === '/api/donations/stats') {
    const statsCors = getCorsHeaders(request)
    if (statsCors === null) {
      jsonResponse(response, 403, { error: 'Origin is not allowed' })
      return
    }
    if (isRateLimited(request)) {
      jsonResponse(response, 429, { error: 'Too many requests' }, statsCors)
      return
    }
    handleDonationStats(request, response, statsCors)
    return
  }

  if (url.pathname !== '/api/stripe/create-checkout-session') {
    jsonResponse(response, 404, { error: 'Not found' })
    return
  }

  const corsHeaders = getCorsHeaders(request)

  if (corsHeaders === null) {
    jsonResponse(response, 403, { error: 'Origin is not allowed' })
    return
  }

  if (request.method === 'OPTIONS') {
    emptyResponse(response, 204, corsHeaders)
    return
  }

  if (request.method !== 'POST') {
    jsonResponse(response, 405, { error: 'Method not allowed' }, { Allow: 'POST, OPTIONS', ...corsHeaders })
    return
  }

  if (isRateLimited(request)) {
    jsonResponse(response, 429, { error: 'Слишком много попыток. Попробуйте чуть позже.' }, corsHeaders)
    return
  }

  try {
    const payload = await readJsonBody(request)
    const checkoutSession = await createCheckoutSession(payload, request)

    jsonResponse(response, 200, checkoutSession, corsHeaders)
  } catch (error) {
    if (error.message === 'REQUEST_TOO_LARGE') {
      jsonResponse(response, 413, { error: 'Запрос слишком большой.' }, corsHeaders)
      return
    }

    if (error.message === 'INVALID_JSON') {
      jsonResponse(response, 400, { error: 'Некорректный JSON.' }, corsHeaders)
      return
    }

    if (error.message === 'INVALID_AMOUNT' || error.message === 'INVALID_AMOUNT_RANGE') {
      jsonResponse(response, 400, { error: 'Введите сумму от 1 до 5000 USD.' }, corsHeaders)
      return
    }

    if (error.message === 'STRIPE_NOT_CONFIGURED') {
      jsonResponse(response, error.statusCode, { error: 'Stripe пока не настроен на сервере.' }, corsHeaders)
      return
    }

    console.error('Donation API error', error)
    jsonResponse(response, error.statusCode || 500, { error: 'Не удалось создать Stripe Checkout.' }, corsHeaders)
  }
}

const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error('Unhandled Donation API error', error)
    jsonResponse(response, 500, { error: 'Internal server error' })
  })
})

server.listen(port, () => {
  console.log(`UWT donations API listening on ${port}`)
  if (!stripeSecretKey) {
    console.warn('STRIPE_SECRET_KEY is not configured')
  }
})
