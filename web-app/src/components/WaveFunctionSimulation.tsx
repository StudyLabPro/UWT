import { useMemo, useState } from 'react'
import { RangeControl } from './RangeControl'

// Браузерное зеркало uwt_modeling.wavefunction (Python): амплитуда — из устойчивости
// отношений, фаза — из накопленного действия; иллюстративная демонстрация, не расчётная модель.
const N = 64
const POTENTIAL_ALPHA = 0.002
const M0 = 0.1
const MSCALE = 10

const QUANTUM_COLOR = '#d97706'
const CLASSICAL_COLOR = '#059669'

function mulberry32(seed: number) {
  let a = seed | 0
  return function next() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function mod(value: number) {
  return ((value % N) + N) % N
}

function shortest(value: number) {
  return mod(value + N / 2) - N / 2
}

function circularSpread(prob: number[]) {
  let zr = 0
  let zi = 0
  for (let u = 0; u < prob.length; u += 1) {
    const angle = (2 * Math.PI * u) / prob.length
    zr += prob[u] * Math.cos(angle)
    zi += prob[u] * Math.sin(angle)
  }
  const resultant = Math.min(1, Math.max(1e-12, Math.hypot(zr, zi)))
  return (Math.sqrt(-2 * Math.log(resultant)) * prob.length) / (2 * Math.PI)
}

type WaveModel = {
  positions: number[]
  probability: number[]
  phase: number[]
  classical: number[]
  momentum: number[]
  normalization: number
  interference: number
  deltaX: number
  deltaP: number
  strongestPart: number
  strongestWeight: number
  peakSite: number
  peakProbability: number
}

function computeWaveModel(parts: number, steps: number, center: number, hbar: number, sigma: number, seed: number): WaveModel {
  const rand = mulberry32(seed * 7919 + 13)
  const x = Array.from({ length: parts }, () => Math.floor(rand() * N))
  const action = Array.from({ length: parts }, () => new Array<number>(parts).fill(0))
  const accumDelta = Array.from({ length: parts }, () => new Array<number>(parts).fill(0))
  const relation = (state: number[], i: number, j: number) => mod(state[j] - state[i])

  let prev = x.slice()
  for (let t = 0; t < steps; t += 1) {
    const next = prev.map((value) => mod(value + (Math.floor(rand() * 3) - 1)))
    const variation = new Array<number>(parts).fill(0)
    for (let i = 0; i < parts; i += 1) {
      for (let j = 0; j < parts; j += 1) {
        if (i !== j) variation[i] += Math.abs(shortest(relation(next, i, j) - relation(prev, i, j)))
      }
    }
    for (let i = 0; i < parts; i += 1) {
      const mass = M0 + MSCALE / (1 + variation[i])
      for (let j = 0; j < parts; j += 1) {
        if (i === j) continue
        const oldDistance = Math.abs(shortest(relation(prev, i, j)))
        const newDistance = Math.abs(shortest(relation(next, i, j)))
        const velocity = Math.abs(newDistance - oldDistance)
        action[i][j] += 0.5 * mass * velocity * velocity - POTENTIAL_ALPHA * newDistance * newDistance
        accumDelta[i][j] += velocity
      }
    }
    prev = next
  }

  const weights = new Array<number>(parts).fill(0)
  let weightSum = 0
  for (let j = 0; j < parts; j += 1) {
    if (j === center) continue
    weights[j] = 1 / (1 + accumDelta[center][j])
    weightSum += weights[j]
  }

  const psiRe = new Array<number>(N).fill(0)
  const psiIm = new Array<number>(N).fill(0)
  const classical = new Array<number>(N).fill(0)
  for (let j = 0; j < parts; j += 1) {
    if (j === center) continue
    const share = weights[j] / weightSum
    const amplitude = Math.sqrt(share)
    const phase = action[center][j] / hbar
    const cos = Math.cos(phase)
    const sin = Math.sin(phase)
    for (let u = 0; u < N; u += 1) {
      const offset = shortest(u - prev[j])
      const kernel = Math.exp(-(offset * offset) / (4 * sigma * sigma))
      psiRe[u] += amplitude * cos * kernel
      psiIm[u] += amplitude * sin * kernel
      classical[u] += share * kernel * kernel
    }
  }

  let norm = 0
  for (let u = 0; u < N; u += 1) norm += psiRe[u] * psiRe[u] + psiIm[u] * psiIm[u]
  norm = Math.sqrt(Math.max(norm, 1e-30))
  let classicalSum = 0
  for (let u = 0; u < N; u += 1) classicalSum += classical[u]

  const probability = new Array<number>(N).fill(0)
  const phase = new Array<number>(N).fill(0)
  let normalization = 0
  let interference = 0
  let peakSite = 0
  for (let u = 0; u < N; u += 1) {
    psiRe[u] /= norm
    psiIm[u] /= norm
    probability[u] = psiRe[u] * psiRe[u] + psiIm[u] * psiIm[u]
    phase[u] = Math.atan2(psiIm[u], psiRe[u])
    classical[u] /= classicalSum
    normalization += probability[u]
    interference += Math.abs(probability[u] - classical[u])
    if (probability[u] > probability[peakSite]) peakSite = u
  }

  const momentum = new Array<number>(N).fill(0)
  for (let k = 0; k < N; k += 1) {
    let re = 0
    let im = 0
    for (let u = 0; u < N; u += 1) {
      const angle = (-2 * Math.PI * ((u * k) % N)) / N
      re += psiRe[u] * Math.cos(angle) - psiIm[u] * Math.sin(angle)
      im += psiRe[u] * Math.sin(angle) + psiIm[u] * Math.cos(angle)
    }
    momentum[k] = (re * re + im * im) / N
  }
  const shiftedMomentum = momentum.map((_, index) => momentum[(index + N / 2) % N])

  let strongestPart = center === 0 ? 1 : 0
  for (let j = 0; j < parts; j += 1) {
    if (j !== center && weights[j] > weights[strongestPart]) strongestPart = j
  }

  return {
    positions: prev,
    probability,
    phase,
    classical,
    momentum: shiftedMomentum,
    normalization,
    interference: 0.5 * interference,
    deltaX: circularSpread(probability),
    deltaP: hbar * ((2 * Math.PI) / N) * circularSpread(momentum),
    strongestPart,
    strongestWeight: weights[strongestPart] / weightSum,
    peakSite,
    peakProbability: probability[peakSite],
  }
}

function phaseColor(value: number) {
  return `hsl(${Math.round(((value + Math.PI) / (2 * Math.PI)) * 360)}, 62%, 56%)`
}

export function WaveFunctionSimulation({ embedded = false }: { embedded?: boolean }) {
  const [parts, setParts] = useState(10)
  const [steps, setSteps] = useState(60)
  const [centerRaw, setCenterRaw] = useState(0)
  const [hbarX10, setHbarX10] = useState(10)
  const [sigmaX10, setSigmaX10] = useState(20)
  const [scenario, setScenario] = useState(42)
  const [hoverSite, setHoverSite] = useState<number | null>(null)

  const center = Math.min(centerRaw, parts - 1)
  const hbar = hbarX10 / 10
  const sigma = sigmaX10 / 10

  const model = useMemo(
    () => computeWaveModel(parts, steps, center, hbar, sigma, scenario),
    [parts, steps, center, hbar, sigma, scenario],
  )

  const densityScale = 13 / Math.max(...model.probability, ...model.classical, 1e-9)
  const momentumScale = 18 / Math.max(...model.momentum, 1e-9)
  const bound = hbar / 2
  const product = model.deltaX * model.deltaP

  const linePath = (values: number[]) =>
    values.map((value, u) => `${u === 0 ? 'M' : 'L'}${(4 + (u * 92) / (N - 1)).toFixed(2)},${(36 - value * densityScale * 2.2).toFixed(2)}`).join(' ')

  return (
    <section className={embedded ? 'waveLab embeddedVisualizer visualizerShell' : 'waveLab visualizerShell'}>
      <div className="sectionHeader compact visualizerHeader">
        <p className="kicker">Визуализация ψ · демо</p>
        <h2>Волновая функция из отношений</h2>
        <p>
          ψ не постулируется: амплитуда вклада каждой части — корень из устойчивости её отношения к центру описания, фаза — накопленное действие
          S/ħ по истории отношений. Браузерная модель зеркалит Python-модуль <code>uwt_modeling.wavefunction</code> в одном измерении решётки Z<sub>64</sub>.
        </p>
      </div>

      <div className="visualizerGrid labGrid">
        <div className="controlPanel glass visualizerControls">
          <label>Части <strong>{parts}</strong><span>Сколько частей строит суперпозицию; каждая часть кроме центра даёт один волновой пакет.</span><RangeControl min={2} max={24} value={parts} onChange={setParts} /></label>
          <label>Шаги истории <strong>{steps}</strong><span>Длина истории отношений: действие S и устойчивость w накапливаются по шагам — фазы «закручиваются» со временем.</span><RangeControl min={1} max={200} value={steps} onChange={setSteps} /></label>
          <label>Центр описания <strong>A{center + 1}</strong><span>Часть, «глазами» которой строится ψ; все отношения считаются относительно неё.</span><RangeControl min={0} max={parts - 1} value={center} onChange={setCenterRaw} /></label>
          <label>Постоянная ħ eff <strong>{hbar.toFixed(1)}</strong><span>Делитель фазы e^(iS/ħ): меньше ħ — быстрее вращаются фазы и резче интерференция.</span><RangeControl min={2} max={40} value={hbarX10} onChange={setHbarX10} /></label>
          <label>Ширина пакета σ <strong>{sigma.toFixed(1)}</strong><span>Ширина гауссова пакета вокруг каждой части: уже пакет — точнее позиция, шире разброс импульса.</span><RangeControl min={5} max={50} value={sigmaX10} onChange={setSigmaX10} /></label>
          <label>Сценарий <strong>{scenario}</strong><span>Зерно генератора истории: детерминированно порождает новую вселенную отношений.</span><RangeControl min={0} max={999} value={scenario} onChange={setScenario} /></label>
          <div className="formulaBox">ψ(u) = Σⱼ √wⱼ · e^(iSⱼ/ħ) · K(u−xⱼ)</div>
        </div>

        <div className="waveStage visualizerStage">
          <div className="waveViewport">
            <article className="wavePrimaryPanel" aria-label="Главный экран волновой функции">
              <div className="wavePanelHeader">
                <span>ψ ENGINE</span>
                <strong>Z₆₄ · phase ring</strong>
                <small>{parts - 1} пакетов · пик u={model.peakSite}</small>
              </div>
              <svg viewBox="0 0 100 92" className="waveSvg waveOrbitalSvg" role="img" aria-label="Плотность вероятности и фаза волновой функции на круговой решётке">
                <circle cx="50" cy="46" r="26" className="waveRing" />
                {model.probability.map((value, u) => {
                  const angle = (u / N) * 2 * Math.PI - Math.PI / 2
                  const inner = 26
                  const outer = 26 + Math.max(0.25, value * densityScale)
                  return (
                    <line
                      key={u}
                      x1={50 + Math.cos(angle) * inner}
                      y1={46 + Math.sin(angle) * inner}
                      x2={50 + Math.cos(angle) * outer}
                      y2={46 + Math.sin(angle) * outer}
                      stroke={phaseColor(model.phase[u])}
                      strokeWidth="1.1"
                      strokeLinecap="round"
                    >
                      <title>{`u=${u} · |ψ|²=${value.toFixed(4)} · фаза=${model.phase[u].toFixed(2)} рад`}</title>
                    </line>
                  )
                })}
                {model.positions.map((position, j) => {
                  const angle = (position / N) * 2 * Math.PI - Math.PI / 2
                  const isCenter = j === center
                  return (
                    <g key={j}>
                      <circle cx={50 + Math.cos(angle) * 22} cy={46 + Math.sin(angle) * 22} r={isCenter ? 2 : 1.3} className={isCenter ? 'wavePart center' : 'wavePart'}>
                        <title>{isCenter ? `A${j + 1} — центр описания` : `часть A${j + 1}, узел ${position}`}</title>
                      </circle>
                    </g>
                  )
                })}
                <g aria-hidden="true">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <rect key={i} x={38 + i * 1} y={88} width="1" height="2.4" fill={phaseColor(-Math.PI + (i / 23) * 2 * Math.PI)} />
                  ))}
                  <text x="36.4" y="90.4" textAnchor="end" className="waveAxisText">−π</text>
                  <text x="63.6" y="90.4" className="waveAxisText">+π</text>
                  <text x="50" y="86.4" textAnchor="middle" className="waveAxisText">фаза arg ψ</text>
                </g>
              </svg>

              <div className="waveLegend" role="list">
                <span role="listitem"><span className="chip" style={{ background: QUANTUM_COLOR }} />|ψ(u)|² — квантовая плотность</span>
                <span role="listitem"><span className="chip" style={{ background: CLASSICAL_COLOR }} />Σw·K² — смесь без фаз</span>
              </div>
            </article>

            <div className="waveAuxGrid">
              <article className="waveAuxPanel">
                <p className="waveChartTitle">Плотность / классическая смесь</p>
                <svg
                  viewBox="0 0 100 40"
                  className="waveSvg waveDensitySvg"
                  role="img"
                  aria-label="Сравнение квантовой плотности вероятности с классической смесью пакетов"
                  onMouseMove={(event) => {
                    const box = event.currentTarget.getBoundingClientRect()
                    const relative = ((event.clientX - box.left) / box.width) * 100
                    setHoverSite(Math.max(0, Math.min(N - 1, Math.round(((relative - 4) / 92) * (N - 1)))))
                  }}
                  onMouseLeave={() => setHoverSite(null)}
                >
                  <line x1="4" y1="36" x2="96" y2="36" className="waveAxis" />
                  {model.positions.map((position, j) => (
                    <line key={j} x1={4 + (position * 92) / (N - 1)} y1="36" x2={4 + (position * 92) / (N - 1)} y2="37.6" className={j === center ? 'waveTick center' : 'waveTick'} />
                  ))}
                  <path d={`${linePath(model.probability)} L96,36 L4,36 Z`} fill={QUANTUM_COLOR} opacity="0.14" stroke="none" />
                  <path d={linePath(model.classical)} fill="none" stroke={CLASSICAL_COLOR} strokeWidth="0.65" strokeDasharray="1.6 1.1" />
                  <path d={linePath(model.probability)} fill="none" stroke={QUANTUM_COLOR} strokeWidth="0.7" />
                  {hoverSite !== null && (
                    <g>
                      <line x1={4 + (hoverSite * 92) / (N - 1)} y1="4" x2={4 + (hoverSite * 92) / (N - 1)} y2="36" className="waveCrosshair" />
                      <text x={hoverSite < N / 2 ? 4 + (hoverSite * 92) / (N - 1) + 2 : 4 + (hoverSite * 92) / (N - 1) - 2} y="7" textAnchor={hoverSite < N / 2 ? 'start' : 'end'} className="waveTooltipText">
                        {`u=${hoverSite} · |ψ|²=${model.probability[hoverSite].toFixed(4)} · смесь=${model.classical[hoverSite].toFixed(4)}`}
                      </text>
                    </g>
                  )}
                </svg>
              </article>

              <article className="waveAuxPanel">
                <p className="waveChartTitle">Импульс |ψ̃(k)|²</p>
                <svg viewBox="0 0 100 26" className="waveSvg waveMomentumSvg" role="img" aria-label="Спектр импульсов волновой функции">
                  <line x1="4" y1="22" x2="96" y2="22" className="waveAxis" />
                  <line x1="50" y1="22" x2="50" y2="23.6" className="waveTick center" />
                  <text x="50" y="25.8" textAnchor="middle" className="waveAxisText">k = 0</text>
                  {model.momentum.map((value, index) => (
                    <rect
                      key={index}
                      x={4 + index * (92 / N) + 0.2}
                      y={22 - Math.max(0.15, value * momentumScale)}
                      width={92 / N - 0.4}
                      height={Math.max(0.15, value * momentumScale)}
                      rx="0.3"
                      fill={QUANTUM_COLOR}
                      opacity="0.85"
                    >
                      <title>{`k=${index - N / 2} · |ψ̃|²=${value.toFixed(4)}`}</title>
                    </rect>
                  ))}
                </svg>
              </article>
            </div>
          </div>

          <div className="metricsGrid matterMetrics waveMetrics">
            <div title="Сумма вероятностей по всем узлам решётки — правило Борна."><small>Нормировка Σ|ψ|²</small><strong>{model.normalization.toFixed(3)}</strong><span>правило Борна</span></div>
            <div title="Полувариационное расстояние между |ψ|² и классической смесью пакетов."><small>Интерференция</small><strong>{(model.interference * 100).toFixed(1)}%</strong><span>отличие от смеси без фаз</span></div>
            <div title="Круговое стандартное отклонение позиции в узлах решётки."><small>Δx</small><strong>{model.deltaX.toFixed(2)}</strong><span>разброс позиции</span></div>
            <div title="Разброс импульса из спектра ДПФ."><small>Δp</small><strong>{model.deltaP.toFixed(2)}</strong><span>разброс импульса</span></div>
            <div title="Аналог соотношения неопределённостей Гейзенберга."><small>Δx·Δp</small><strong>{product.toFixed(2)}</strong><span>{product >= bound ? `≥ ħ/2 = ${bound.toFixed(2)} — выполнено` : `ниже ħ/2 = ${bound.toFixed(2)}`}</span></div>
            <div title="Узел решётки с максимальной вероятностью."><small>Пик |ψ|²</small><strong>u={model.peakSite}</strong><span>максимум {model.peakProbability.toFixed(3)}</span></div>
            <div title="Часть с наибольшим весом (самое устойчивое отношение к центру)."><small>Устойчивое отношение</small><strong>A{model.strongestPart + 1}</strong><span>вес {(model.strongestWeight * 100).toFixed(0)}%</span></div>
            <div title="Число гауссовых пакетов в суперпозиции."><small>Пакеты</small><strong>{parts - 1}</strong><span>вкладов в ψ</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
