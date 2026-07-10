import { FormEvent, useMemo, useState } from 'react'

const presetAmounts = ['10', '25', '50', '100']

function getDonationStatus() {
  return new URLSearchParams(window.location.search).get('donation')
}

function isValidAmount(value: string) {
  const normalized = value.trim().replace(',', '.')
  const amount = Number(normalized)

  return /^\d+(\.\d{1,2})?$/.test(normalized) && Number.isFinite(amount) && amount >= 1
}

export function DonationPage() {
  const [amount, setAmount] = useState('25')
  const [donorName, setDonorName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const donationStatus = getDonationStatus()

  const normalizedAmount = useMemo(() => amount.trim().replace(',', '.'), [amount])
  const canSubmit = isValidAmount(amount) && !isSubmitting

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!isValidAmount(amount)) {
      setError('Введите сумму от 1 USD: целое число или два знака после точки.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: normalizedAmount,
          donorName,
          email,
          message,
        }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok || typeof payload.url !== 'string') {
        throw new Error(payload.error || 'Stripe Checkout временно недоступен.')
      }

      window.location.assign(payload.url)
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Не удалось открыть Stripe Checkout.')
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page donationPage">
      <div className="donationHero glass">
        <div className="donationCopy">
          <p className="kicker">UWT · открытый исследовательский атлас</p>
          <h1>Поддержать Теорию Единого Целого</h1>
          <p>
            Донат помогает развивать цифровой атлас UWT: визуализации, моделирование, монографию,
            браузерные эксперименты и аккуратную исследовательскую инфраструктуру вокруг проекта.
          </p>

          {donationStatus === 'success' && (
            <div className="donationNotice success" role="status">
              Спасибо! Stripe подтвердил возврат после оплаты. Ваш вклад уже стал частью общей структуры.
            </div>
          )}
          {donationStatus === 'cancelled' && (
            <div className="donationNotice" role="status">
              Оплата отменена. Можно выбрать другую сумму и попробовать ещё раз.
            </div>
          )}
        </div>

        <div className="donationOrb" aria-hidden="true">
          <span />
          <span />
          <span />
          <strong>UWT</strong>
        </div>
      </div>

      <div className="donationLayout">
        <form className="donationForm glass" onSubmit={handleSubmit}>
          <div>
            <p className="kicker">Произвольная сумма</p>
            <h2>Сумма поддержки</h2>
            <p>Платёж проходит через защищённый Stripe Checkout. Данные карты не попадают на сервер UWT.</p>
          </div>

          <div className="amountPresets" aria-label="Быстрый выбор суммы">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                className={normalizedAmount === preset ? 'active' : ''}
                type="button"
                onClick={() => setAmount(preset)}
              >
                ${preset}
              </button>
            ))}
          </div>

          <label className="donationField amountField">
            <span>Сумма, USD</span>
            <input
              inputMode="decimal"
              min="1"
              name="amount"
              placeholder="25"
              type="text"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          <div className="donationFieldGrid">
            <label className="donationField">
              <span>Имя или никнейм</span>
              <input
                autoComplete="name"
                maxLength={80}
                name="donorName"
                placeholder="Можно анонимно"
                type="text"
                value={donorName}
                onChange={(event) => setDonorName(event.target.value)}
              />
            </label>
            <label className="donationField">
              <span>Email для Stripe</span>
              <input
                autoComplete="email"
                maxLength={160}
                name="email"
                placeholder="необязательно"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </div>

          <label className="donationField">
            <span>Сообщение проекту</span>
            <textarea
              maxLength={280}
              name="message"
              placeholder="Например: на визуализатор реляционных моделей"
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>

          {error && (
            <div className="donationNotice error" role="alert">
              {error}
            </div>
          )}

          <button className="donationSubmit" disabled={!canSubmit} type="submit">
            {isSubmitting ? 'Открываем Stripe…' : `Поддержать на $${isValidAmount(amount) ? normalizedAmount : '—'}`}
          </button>
        </form>

        <aside className="donationAside glass" aria-label="Куда пойдёт донат">
          <h2>Куда идёт вклад</h2>
          <div>
            <strong>01 · Визуализация</strong>
            <span>Интерактивные модели отношений, устойчивости, материи, мозга и волновой функции.</span>
          </div>
          <div>
            <strong>02 · Проверяемость</strong>
            <span>Численные эксперименты, сценарии моделирования и воспроизводимые результаты.</span>
          </div>
          <div>
            <strong>03 · Публикация</strong>
            <span>Монография, документация, открытые материалы и исследовательский интерфейс.</span>
          </div>
        </aside>
      </div>
    </section>
  )
}
