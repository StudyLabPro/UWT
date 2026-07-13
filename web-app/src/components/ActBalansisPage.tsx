import { useMemo, useState } from 'react'
import { actConcepts } from '../data/tasks'
import { loc, useLang } from '../i18n/language'
import { CredibilityBadge } from './CredibilityBadge'
import { RangeControl } from './RangeControl'
import { buildCancellationSeries, naiveSum, neumaierSum } from '../lib/compensation'

type InstabilityType = {
  code: string
  title: { ru: string; en: string }
  threshold: { ru: string; en: string }
  text: { ru: string; en: string }
}

const instabilityTypes: InstabilityType[] = [
  {
    code: 'STABILITY',
    title: loc('Устойчивость', 'Stability'),
    threshold: loc('порог ~1e-12', 'threshold ~1e-12'),
    text: loc(
      'Компенсирует потерю точности при сложении и вычитании близких по модулю величин.',
      'Compensates for precision loss when adding or subtracting values of comparable magnitude.',
    ),
  },
  {
    code: 'OVERFLOW',
    title: loc('Переполнение', 'Overflow'),
    threshold: loc('порог ~1e100', 'threshold ~1e100'),
    text: loc(
      'Предотвращает срыв вычисления в бесконечность при экстремально больших величинах.',
      'Prevents a computation from blowing up to infinity at extremely large magnitudes.',
    ),
  },
  {
    code: 'UNDERFLOW',
    title: loc('Антипереполнение', 'Underflow'),
    threshold: loc('порог ~1e-100', 'threshold ~1e-100'),
    text: loc(
      'Не даёт исчезающе малым величинам обнулиться раньше, чем это оправдано моделью.',
      'Keeps vanishingly small magnitudes from collapsing to zero before the model justifies it.',
    ),
  },
  {
    code: 'SINGULARITY',
    title: loc('Особая точка', 'Singularity'),
    threshold: loc('деление на ABSOLUTE', 'division by ABSOLUTE'),
    text: loc(
      'Вместо необработанного деления на ноль вводит структуру EternalRatio/ABSOLUTE как часть модели данных.',
      'Instead of a raw divide-by-zero, introduces the EternalRatio/ABSOLUTE structure as part of the data model.',
    ),
  },
  {
    code: 'BALANCE',
    title: loc('Баланс', 'Balance'),
    threshold: loc('коэффициент 0…1', 'factor 0…1'),
    text: loc(
      'Распределяет компенсацию между операндами операции согласно коэффициенту баланса.',
      'Distributes the compensation between the operands of an operation according to a balance factor.',
    ),
  },
  {
    code: 'CONVERGENCE',
    title: loc('Сходимость', 'Convergence'),
    threshold: loc('лимит итераций + допуск', 'iteration cap + tolerance'),
    text: loc(
      'Ограничивает число итераций и задаёт допуск, чтобы итеративные вычисления гарантированно сходились.',
      'Bounds the iteration count and sets a tolerance so iterative computations are guaranteed to converge.',
    ),
  },
]

function formatNumber(value: number, lang: 'ru' | 'en'): string {
  if (!Number.isFinite(value)) {
    return String(value)
  }
  return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
    maximumFractionDigits: 6,
  }).format(value)
}

export function ActBalansisPage() {
  const { t, lang } = useLang()
  const [scaleExp, setScaleExp] = useState(10)
  const [steps, setSteps] = useState(24)

  const { naiveResult, corrected, compensation, trueValue, naiveLossPercent, compLossPercent } = useMemo(() => {
    const scale = Math.pow(10, scaleExp)
    const series = buildCancellationSeries(scale, steps)
    const naive = naiveSum(series)
    const { compensation: comp, corrected: fixed } = neumaierSum(series)
    const expected = steps
    const naiveLoss = Math.min(100, (Math.abs(naive - expected) / Math.max(1, expected)) * 100)
    const compLoss = Math.min(100, (Math.abs(fixed - expected) / Math.max(1, expected)) * 100)

    return {
      naiveResult: naive,
      corrected: fixed,
      compensation: comp,
      trueValue: expected,
      naiveLossPercent: naiveLoss,
      compLossPercent: compLoss,
    }
  }, [scaleExp, steps])

  return (
    <section className="page actPage">
      <div className="sectionHeader narrow">
        <p className="kicker">{t(loc('Вкладка 3 · АКТ и Balansis', 'Tab 3 · ACT and Balansis'))}</p>
        <h1>{t(loc('Абсолютно Компенсационная Теория', 'Absolute Compensation Theory'))}</h1>
        <p>
          {t(
            loc(
              'АКТ делает численную потерю видимой: результат и компенсация существуют рядом, а не прячутся в округлении.',
              'ACT makes numerical loss visible: the result and the compensation exist side by side, instead of hiding inside rounding.',
            ),
          )}
        </p>
        <CredibilityBadge marker="DEMO" />
      </div>

      <div className="compensationStage">
        <div className="calcBox danger">
          <small>{t(loc('Обычная арифметика', 'Plain arithmetic'))}</small>
          <code>1e16 + 1 - 1e16</code>
          <strong>0</strong>
          <p>{t(loc('Малый остаток потерян.', 'The small residual is lost.'))}</p>
        </div>
        <div className="calcBox success">
          <small>{t(loc('Balansis / ACT', 'Balansis / ACT'))}</small>
          <code>sequence_sum([...])</code>
          <strong>result + compensation</strong>
          <p>{t(loc('Остаток становится частью вычисления.', 'The residual becomes part of the computation.'))}</p>
        </div>
      </div>

      <section className="compensationLab glass" aria-labelledby="compensation-lab-title">
        <div className="sectionHeader compact">
          <p className="kicker">{t(loc('Живой пример · катастрофическое сокращение', 'Live example · catastrophic cancellation'))}</p>
          <h2 id="compensation-lab-title">
            {t(loc('Подвиньте масштаб — и точность исчезнет', 'Move the scale — and precision disappears'))}
          </h2>
          <p>
            {t(
              loc(
                'N раз складывается тройка (масштаб, +1, −масштаб). В точной арифметике масштаб всегда полностью сокращается, и сумма должна остаться равна N. Ползунки управляют порядком величины масштаба и числом повторений N — так растёт накопленная ошибка.',
                'A triple (scale, +1, −scale) is summed N times. In exact arithmetic the scale always cancels completely, so the sum should stay equal to N. The sliders control the order of magnitude of the scale and the repeat count N — this is how accumulated error grows.',
              ),
            )}
          </p>
        </div>

        <pre className="codeBlock compLabFormula">
          <code>{`for step in 1..N:\n    sum += 10^${scaleExp}\n    sum += 1\n    sum += -10^${scaleExp}\n# ожидаемо: sum == N`}</code>
        </pre>

        <div className="compLabControls">
          <label>
            {t(loc('Порядок величины масштаба', 'Scale order of magnitude'))} <strong>10^{scaleExp}</strong>
            <span>
              {t(
                loc(
                  'При масштабе крупнее ~2^53 (около 10^16) один float64 уже не может хранить «+1» рядом с масштабом.',
                  'Once the scale passes ~2^53 (about 10^16), a single float64 can no longer hold "+1" next to it.',
                ),
              )}
            </span>
            <RangeControl min={0} max={20} value={scaleExp} onChange={setScaleExp} />
          </label>
          <label>
            {t(loc('Число повторений N', 'Repeat count N'))} <strong>{steps}</strong>
            <span>{t(loc('Больше повторений — больше шансов увидеть накопленную ошибку.', 'More repeats — more chances to see the accumulated error.'))}</span>
            <RangeControl min={1} max={300} value={steps} onChange={setSteps} />
          </label>
        </div>

        <div className="compLabColumns">
          <article className="compColumn compColumnNaive">
            <h3>{t(loc('float64 naive', 'float64 naive'))}</h3>
            <p className="compColumnHint">{t(loc('Обычное последовательное сложение: sum += x', 'Plain sequential addition: sum += x'))}</p>
            <div className="compStat">
              <span>{t(loc('Ожидаемое значение', 'Expected value'))}</span>
              <strong>{formatNumber(trueValue, lang)}</strong>
            </div>
            <div className="compStat">
              <span>{t(loc('Получено', 'Computed'))}</span>
              <strong>{formatNumber(naiveResult, lang)}</strong>
            </div>
            <div className="compStat compStatError">
              <span>{t(loc('Накопленная ошибка', 'Accumulated error'))}</span>
              <strong>{formatNumber(naiveResult - trueValue, lang)}</strong>
            </div>
            <div className="compBarTrack" role="img" aria-label={`${naiveLossPercent.toFixed(0)}%`}>
              <div className="compBarFill compBarFillDanger" style={{ width: `${naiveLossPercent}%` }} />
            </div>
            <small>{t(loc('доля потерянного сигнала', 'share of signal lost'))}</small>
          </article>

          <article className="compColumn compColumnFixed">
            <h3>{t(loc('Компенсированная (Kahan/EFT)', 'Compensated (Kahan/EFT)'))}</h3>
            <p className="compColumnHint">
              {t(loc('Neumaier / Kahan-Babuska: остаток каждого шага копится отдельно.', 'Neumaier / Kahan-Babuska: the residual of every step is tracked separately.'))}
            </p>
            <div className="compStat">
              <span>{t(loc('Компенсация (отдельный регистр)', 'Compensation (separate register)'))}</span>
              <strong>{formatNumber(compensation, lang)}</strong>
            </div>
            <div className="compStat">
              <span>{t(loc('Результат + компенсация', 'Result + compensation'))}</span>
              <strong>{formatNumber(corrected, lang)}</strong>
            </div>
            <div className="compStat compStatOk">
              <span>{t(loc('Остаточная ошибка', 'Residual error'))}</span>
              <strong>{formatNumber(corrected - trueValue, lang)}</strong>
            </div>
            <div className="compBarTrack" role="img" aria-label={`${compLossPercent.toFixed(0)}%`}>
              <div className="compBarFill compBarFillSuccess" style={{ width: `${Math.max(compLossPercent, 1.5)}%` }} />
            </div>
            <small>{t(loc('доля потерянного сигнала', 'share of signal lost'))}</small>
          </article>
        </div>

        <p className="compLabNote">
          {t(
            loc(
              'EFT (error-free transform) — приём, при котором ошибка округления одной операции сложения вычисляется точно и хранится отдельно, а не отбрасывается. Kahan/Neumaier — конкретная схема EFT для сумм; Balansis обобщает её на структуру AbsoluteValue и возвращает компенсацию как обычное значение API, а не отладочную деталь.',
              'EFT (error-free transform) is a technique where the rounding error of one addition is computed exactly and kept, instead of being discarded. Kahan/Neumaier is a concrete EFT scheme for sums; Balansis generalizes it onto the AbsoluteValue structure and returns the compensation as a normal API value, not a debugging detail.',
            ),
          )}
        </p>
      </section>

      <section className="instabilitySection">
        <div className="sectionHeader compact">
          <p className="kicker">{t(loc('Из ядра Balansis · balansis/logic/compensator.py', 'From the Balansis core · balansis/logic/compensator.py'))}</p>
          <h2>{t(loc('6 типов нестабильности, которые ловит компенсатор', '6 types of instability the compensator catches'))}</h2>
          <p>
            {t(
              loc(
                'Компенсатор Balansis классифицирует, какая именно поправка нужна операции, прежде чем её применить — это перечисление CompensationType в движке compensator.py.',
                'The Balansis compensator classifies exactly which correction an operation needs before applying it — this is the CompensationType enumeration in the compensator.py engine.',
              ),
            )}
          </p>
        </div>
        <div className="instabilityGrid">
          {instabilityTypes.map((item) => (
            <article key={item.code} className="instabilityCard glass">
              <span className="instabilityCode">{item.code}</span>
              <h3>{t(item.title)}</h3>
              <small>{t(item.threshold)}</small>
              <p>{t(item.text)}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="conceptGrid">
        {actConcepts.map((concept) => (
          <article key={concept.title} className="conceptCard">
            <span>{concept.title.slice(0, 2)}</span>
            <h3>{concept.title}</h3>
            <p>{t(concept.text)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
