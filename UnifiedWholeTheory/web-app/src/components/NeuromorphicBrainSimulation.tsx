import { useMemo, useState } from 'react'
import { RangeControl } from './RangeControl'

type Mode = 'rest' | 'focus' | 'memory' | 'overload'

const modeLabels: Record<Mode, string> = {
  rest: 'покой',
  focus: 'фокус',
  memory: 'память',
  overload: 'перегрузка',
}

function modeParams(mode: Mode) {
  if (mode === 'rest') return { threshold: 0.68, plasticity: 0.28, pulse: 0.22, stability: 76 }
  if (mode === 'focus') return { threshold: 0.48, plasticity: 0.52, pulse: 0.58, stability: 64 }
  if (mode === 'memory') return { threshold: 0.42, plasticity: 0.78, pulse: 0.44, stability: 82 }
  return { threshold: 0.22, plasticity: 0.91, pulse: 0.95, stability: 31 }
}

export function NeuromorphicBrainSimulation({ embedded = false }: { embedded?: boolean }) {
  const [neuronsCount, setNeuronsCount] = useState(42)
  const [activity, setActivity] = useState(54)
  const [mode, setMode] = useState<Mode>('focus')
  const [viewCenter, setViewCenter] = useState(0)
  const params = modeParams(mode)

  const neurons = useMemo(() => {
    return Array.from({ length: neuronsCount }).map((_, i) => {
      const hemisphere = i % 2 === 0 ? -1 : 1
      const ring = 18 + ((i * 11) % 28)
      const angle = (i * 2.399 + activity * 0.015) % (Math.PI * 2)
      const x = 50 + hemisphere * 11 + Math.cos(angle) * ring * 0.72
      const y = 50 + Math.sin(angle * 1.17) * ring
      const charge = (Math.sin(i * 1.7 + activity * 0.06) + 1) / 2
      const active = charge > params.threshold
      return { id: i, x, y, charge, active, cluster: i % 5 }
    })
  }, [neuronsCount, activity, params.threshold])

  const synapses = useMemo(() => {
    const result: { a: number; b: number; weight: number; stable: boolean; active: boolean }[] = []
    for (let i = 0; i < neurons.length; i += 1) {
      for (let j = i + 1; j < neurons.length; j += 1) {
        const a = neurons[i]
        const b = neurons[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        const sameCluster = a.cluster === b.cluster
        const centered = i === viewCenter || j === viewCenter
        if (d < 20 || sameCluster || centered) {
          const weight = Math.max(0.05, Math.min(1, (sameCluster ? 0.65 : 0.35) + params.plasticity * 0.35 - d / 90))
          const active = (a.active || b.active) && weight > 0.34
          const stable = sameCluster && weight > 0.62 && !active
          result.push({ a: i, b: j, weight, stable, active })
        }
      }
    }
    return result
  }, [neurons, params.plasticity, viewCenter])

  const activeNeurons = neurons.filter((n) => n.active).length
  const activeSynapses = synapses.filter((s) => s.active).length
  const stableSynapses = synapses.filter((s) => s.stable).length
  const coherence = Math.round((stableSynapses / Math.max(1, synapses.length)) * 100)
  const signalEnergy = Math.round(activeSynapses * params.pulse + activeNeurons * activity * 0.08)

  return (
    <section className={embedded ? 'brainLab embeddedVisualizer' : 'brainLab'}>
      <div className="sectionHeader compact">
        <p className="kicker">Третий визуализатор · нейроморфные сети</p>
        <h2>Связи в мозгу как реляционная система</h2>
        <p>Нейроны — части, синапсы — отношения, импульсы — изменение отношений, память — устойчивые структуры связей.</p>
      </div>

      <div className="brainGrid">
        <div className="brainControls glass">
          <label>Нейроны <strong>{neuronsCount}</strong><span>Количество узлов сети; больше нейронов — больше возможных синаптических отношений.</span><RangeControl min={8} max={96} value={neuronsCount} onChange={setNeuronsCount} /></label>
          <label>Активность <strong>{activity}</strong><span>Уровень возбуждения: чем выше, тем больше нейронов и связей переходят в импульсный режим.</span><RangeControl min={0} max={100} value={activity} onChange={setActivity} /></label>
          <label>Локальный центр <strong>N{viewCenter + 1}</strong><span>Нейрон, относительно которого подсвечиваются связи; аналог центра описания в UWT.</span><RangeControl min={0} max={Math.max(0, neuronsCount - 1)} value={Math.min(viewCenter, neuronsCount - 1)} onChange={setViewCenter} /></label>
          <label>Режим сети<span>Покой, фокус, память и перегрузка меняют порог возбуждения, пластичность и устойчивость связей.</span></label>
          <div className="phaseButtons">
            {(['rest', 'focus', 'memory', 'overload'] as Mode[]).map((item) => <button key={item} className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>{modeLabels[item]}</button>)}
          </div>
          <div className="formulaBox">нейронная мысль = устойчивый путь импульсов</div>
        </div>

        <div className="brainStage">
          <svg viewBox="0 0 100 100" className="brainSvg" role="img" aria-label="Нейроморфная сеть мозга">
            <defs>
              <radialGradient id="neuronGlow"><stop offset="0" stopColor="#f4f1e8" /><stop offset="0.45" stopColor="#7ee0b8" /><stop offset="1" stopColor="#2f80ed" /></radialGradient>
              <filter id="softGlow"><feGaussianBlur stdDeviation="1.4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <path className="brainOutline" d="M23 49 C16 28, 31 13, 47 22 C55 8, 83 18, 75 42 C91 50, 76 84, 56 74 C45 91, 16 77, 23 49Z" />
            {synapses.map((synapse, index) => {
              const a = neurons[synapse.a]
              const b = neurons[synapse.b]
              const className = synapse.active ? 'synapse active' : synapse.stable ? 'synapse stable' : 'synapse'
              return <line key={index} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={className} opacity={synapse.active ? 0.95 : synapse.stable ? 0.72 : synapse.weight * 0.32} />
            })}
            {neurons.map((neuron) => <g key={neuron.id} onClick={() => setViewCenter(neuron.id)} className="neuronGroup"><circle cx={neuron.x} cy={neuron.y} r={neuron.id === viewCenter ? 3.9 : neuron.active ? 2.8 : 1.9} className={neuron.id === viewCenter ? 'neuron center' : neuron.active ? 'neuron active' : 'neuron'} /><text x={neuron.x + 2.2} y={neuron.y - 1.8} className="neuronLabel">{neuron.id + 1}</text></g>)}
          </svg>
          <div className="metricsGrid matterMetrics">
            <div title="Текущий режим работы нейроморфной сети."><small>Режим</small><strong>{modeLabels[mode]}</strong><span>состояние сети</span></div>
            <div title="Нейроны, заряд которых выше порога возбуждения."><small>Активные нейроны</small><strong>{activeNeurons}</strong><span>возбуждённые части</span></div>
            <div title="Синапсы, по которым сейчас проходит импульс."><small>Импульсные связи</small><strong>{activeSynapses}</strong><span>активные отношения</span></div>
            <div title="Связи, которые сохраняются без перегрузки и могут моделировать память."><small>Устойчивые связи</small><strong>{stableSynapses}</strong><span>след памяти</span></div>
            <div title="Доля устойчивых связей среди всех синапсов."><small>Когерентность</small><strong>{coherence}%</strong><span>согласованность сети</span></div>
            <div title="Оценка энергии передачи импульсов."><small>Энергия сигнала</small><strong>{signalEnergy}</strong><span>стоимость активности</span></div>
            <div title="Способность сети перестраивать веса синапсов."><small>Пластичность</small><strong>{Math.round(params.plasticity * 100)}%</strong><span>обучаемость связей</span></div>
            <div title="Нейрон, выбранный как локальный центр описания."><small>Центр</small><strong>N{viewCenter + 1}</strong><span>точка наблюдения</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
