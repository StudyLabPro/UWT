import { useMemo, useState } from 'react'
import { RangeControl } from './RangeControl'

type Phase = 'solid' | 'liquid' | 'gas'

const phaseLabels: Record<Phase, string> = {
  solid: 'твёрдое тело',
  liquid: 'жидкость',
  gas: 'газ',
}

function phaseParams(phase: Phase) {
  if (phase === 'solid') return { jitter: 1.2, bond: 13, speed: 0.18, cohesion: 92 }
  if (phase === 'liquid') return { jitter: 5.5, bond: 17, speed: 0.62, cohesion: 58 }
  return { jitter: 13, bond: 10, speed: 1.25, cohesion: 18 }
}

export function MatterAtomsSimulation({ embedded = false }: { embedded?: boolean }) {
  const [phase, setPhase] = useState<Phase>('solid')
  const [temperature, setTemperature] = useState(28)
  const [time, setTime] = useState(0)
  const params = phaseParams(phase)

  const atoms = useMemo(() => {
    const grid = 7
    return Array.from({ length: grid * grid }).map((_, i) => {
      const row = Math.floor(i / grid)
      const col = i % grid
      const wave = Math.sin(time * params.speed + i * 1.7) * params.jitter * (temperature / 50)
      const swirl = Math.cos(time * params.speed * 0.8 + i) * params.jitter * 0.55 * (temperature / 50)
      return {
        id: i,
        x: 12 + col * 12 + (phase === 'solid' ? wave * 0.22 : wave),
        y: 12 + row * 12 + (phase === 'solid' ? swirl * 0.22 : swirl),
        energy: Math.min(100, temperature + (i * 7) % 28),
      }
    })
  }, [phase, temperature, time, params.jitter, params.speed])

  const bonds = useMemo(() => {
    const result: { a: number; b: number; d: number }[] = []
    for (let i = 0; i < atoms.length; i += 1) {
      for (let j = i + 1; j < atoms.length; j += 1) {
        const d = Math.hypot(atoms[i].x - atoms[j].x, atoms[i].y - atoms[j].y)
        if (d < params.bond) result.push({ a: i, b: j, d })
      }
    }
    return result
  }, [atoms, params.bond])

  const relationEnergy = Math.round(atoms.reduce((sum, atom) => sum + atom.energy, 0) / atoms.length)
  const stability = Math.max(0, Math.round(params.cohesion - temperature * (phase === 'solid' ? 0.2 : phase === 'liquid' ? 0.35 : 0.55)))

  return (
    <section className={embedded ? 'matterLab embeddedVisualizer' : 'matterLab'}>
      <div className="sectionHeader compact">
        <p className="kicker">Симуляция вещества</p>
        <h2>Атомы как реляционная структура</h2>
        <p>В UWT вещество можно показать как устойчивую сеть отношений между частями: при нагреве связи ослабевают, расстояния меняются, устойчивость падает.</p>
      </div>

      <div className="matterGrid">
        <div className="matterControls glass">
          <label>Фаза вещества<span>Выбирает тип устойчивости: твёрдое — сильные связи, жидкость — текучие, газ — слабые и редкие.</span></label>
          <div className="phaseButtons">
            {(['solid', 'liquid', 'gas'] as Phase[]).map((item) => <button key={item} className={phase === item ? 'active' : ''} onClick={() => setPhase(item)}>{phaseLabels[item]}</button>)}
          </div>
          <label>Температура <strong>{temperature}</strong><span>Увеличивает амплитуду движения атомов; при росте температуры связи становятся менее устойчивыми.</span><RangeControl min={5} max={100} value={temperature} onChange={setTemperature} /></label>
          <label>Внутреннее время <strong>{time.toFixed(1)}</strong><span>Сдвигает состояние системы; показывает, как отношения атомов меняются изнутри.</span><RangeControl min={0} max={40} step={0.1} value={time} onChange={setTime} /></label>
          <div className="formulaBox">вещество = устойчивые отношения атомов</div>
        </div>

        <div className="matterStage">
          <svg viewBox="0 0 100 100" className="matterSvg" role="img" aria-label="Симуляция атомов вещества">
            <defs>
              <radialGradient id="atomGlow"><stop offset="0" stopColor="#f4f1e8" /><stop offset="0.55" stopColor="#ffb347" /><stop offset="1" stopColor="#2f80ed" /></radialGradient>
            </defs>
            {bonds.map((bond, i) => {
              const a = atoms[bond.a]
              const b = atoms[bond.b]
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="atomBond" opacity={Math.max(0.12, 1 - bond.d / params.bond)} />
            })}
            {atoms.map((atom) => <circle key={atom.id} cx={atom.x} cy={atom.y} r={phase === 'gas' ? 1.7 : 2.25} className="atomDot" />)}
          </svg>
          <div className="metricsGrid matterMetrics">
            <div title="Текущий режим вещества как тип реляционной устойчивости."><small>Фаза</small><strong>{phaseLabels[phase]}</strong><span>тип связи атомов</span></div>
            <div title="Количество атомных отношений, которые сейчас достаточно близки, чтобы считаться связями."><small>Связи</small><strong>{bonds.length}</strong><span>локальные отношения</span></div>
            <div title="Средняя энергия атомной сети: выше при температуре и активном движении."><small>Энергия</small><strong>{relationEnergy}</strong><span>движение + связи</span></div>
            <div title="Насколько структура сохраняет форму при текущей температуре и фазе."><small>Устойчивость</small><strong>{stability}%</strong><span>сохранение формы</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
