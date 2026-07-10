import { useMemo, useState } from 'react'
import { RangeControl } from './RangeControl'

type Regime = 'atom' | 'conductor' | 'plasma'

const regimeLabels: Record<Regime, string> = {
  atom: 'атомная оболочка',
  conductor: 'проводник',
  plasma: 'плазма',
}

function regimeParams(regime: Regime) {
  if (regime === 'atom') return { confinement: 0.86, repulsion: 0.42, field: 0.2 }
  if (regime === 'conductor') return { confinement: 0.38, repulsion: 0.58, field: 0.55 }
  return { confinement: 0.14, repulsion: 0.92, field: 0.88 }
}

function coulombLike(distance: number, repulsion: number) {
  return repulsion / Math.max(1.2, distance ** 2)
}

export function ElectronInteractionSimulation({ embedded = false }: { embedded?: boolean }) {
  const [electronsCount, setElectronsCount] = useState(18)
  const [fieldStrength, setFieldStrength] = useState(45)
  const [time, setTime] = useState(12)
  const [regime, setRegime] = useState<Regime>('atom')
  const params = regimeParams(regime)

  const electrons = useMemo(() => {
    return Array.from({ length: electronsCount }).map((_, i) => {
      const shell = 10 + ((i * 13) % 34) * params.confinement + (regime === 'plasma' ? i % 9 : 0)
      const angle = i * 2.399 + time * 0.07 + fieldStrength * 0.004
      const fieldDrift = (fieldStrength - 50) * params.field * 0.24
      const spin = i % 2 === 0 ? 1 : -1
      return {
        id: i,
        x: 50 + Math.cos(angle) * shell + fieldDrift,
        y: 50 + Math.sin(angle * 1.11) * shell + spin * params.field * 3,
        spin,
        shell,
      }
    })
  }, [electronsCount, fieldStrength, time, regime, params.confinement, params.field])

  const interactions = useMemo(() => {
    const result: { a: number; b: number; distance: number; force: number; paired: boolean }[] = []
    for (let i = 0; i < electrons.length; i += 1) {
      for (let j = i + 1; j < electrons.length; j += 1) {
        const a = electrons[i]
        const b = electrons[j]
        const distance = Math.hypot(a.x - b.x, a.y - b.y)
        const force = coulombLike(distance, params.repulsion)
        const paired = a.spin !== b.spin && distance < 16 && regime !== 'plasma'
        if (distance < 28 || paired || regime === 'plasma') {
          result.push({ a: i, b: j, distance, force, paired })
        }
      }
    }
    return result
  }, [electrons, params.repulsion, regime])

  const paired = interactions.filter((interaction) => interaction.paired).length
  const repulsionEnergy = interactions.reduce((sum, interaction) => sum + interaction.force, 0)
  const orbitalStability = Math.max(0, Math.round(100 * params.confinement - repulsionEnergy * 12))
  const meanDistance = interactions.length ? interactions.reduce((sum, interaction) => sum + interaction.distance, 0) / interactions.length : 0

  return (
    <section className={embedded ? 'electronLab embeddedVisualizer visualizerShell' : 'electronLab visualizerShell'}>
      <div className="sectionHeader compact visualizerHeader">
        <p className="kicker">Визуализация электронов</p>
        <h2>Электроны как система отталкивающихся отношений</h2>
        <p>Электроны моделируются как части с зарядом и спином: расстояние задаёт силу отталкивания, режим задаёт связанность, поле смещает облако.</p>
      </div>

      <div className="visualizerGrid electronGrid">
        <div className="electronControls glass visualizerControls">
          <label>Электроны <strong>{electronsCount}</strong><span>Количество заряженных частей; больше электронов — больше парных кулоновских отношений.</span><RangeControl min={1} max={64} value={electronsCount} onChange={setElectronsCount} /></label>
          <label>Сила поля <strong>{fieldStrength}</strong><span>Внешнее поле смещает электронное облако и меняет распределение расстояний.</span><RangeControl min={0} max={100} value={fieldStrength} onChange={setFieldStrength} /></label>
          <label>Время состояния <strong>{time}</strong><span>Поворачивает фазу движения электронов; меняются расстояния и энергия взаимодействий.</span><RangeControl min={0} max={100} value={time} onChange={setTime} /></label>
          <label>Режим среды<span>Атом удерживает электроны, проводник ослабляет связь, плазма делает систему свободной и энергичной.</span></label>
          <div className="phaseButtons">
            {(['atom', 'conductor', 'plasma'] as Regime[]).map((item) => <button key={item} type="button" className={regime === item ? 'active' : ''} onClick={() => setRegime(item)}>{regimeLabels[item]}</button>)}
          </div>
          <div className="formulaBox">F ≈ q₁q₂ / r² · отношения задают поле</div>
        </div>

        <div className="electronStage visualizerStage">
          <svg viewBox="0 0 100 100" className="electronSvg" role="img" aria-label="Взаимодействия электронов">
            <defs>
              <radialGradient id="electronGlow"><stop offset="0" stopColor="#f4f1e8" /><stop offset="0.42" stopColor="#2f80ed" /><stop offset="1" stopColor="#7ee0b8" /></radialGradient>
              <radialGradient id="nucleusGlow"><stop offset="0" stopColor="#ffb347" /><stop offset="1" stopColor="#ff6b6b" /></radialGradient>
            </defs>
            {regime === 'atom' && <circle cx="50" cy="50" r="5.5" className="nucleus" />}
            {regime !== 'plasma' && [14, 27, 40].map((r) => <circle key={r} cx="50" cy="50" r={r} className="orbitalRing" />)}
            {interactions.map((interaction, index) => {
              const a = electrons[interaction.a]
              const b = electrons[interaction.b]
              return <line key={index} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={interaction.paired ? 'electronLink paired' : 'electronLink'} opacity={interaction.paired ? 0.85 : Math.min(0.5, interaction.force * 18)} />
            })}
            {electrons.map((electron) => <g key={electron.id}><circle cx={electron.x} cy={electron.y} r="2.35" className={electron.spin > 0 ? 'electron up' : 'electron down'} /><text x={electron.x + 2.1} y={electron.y - 1.8} className="electronSpin">{electron.spin > 0 ? '↑' : '↓'}</text></g>)}
          </svg>
          <div className="metricsGrid matterMetrics">
            <div title="Количество электронов в системе."><small>Электроны</small><strong>{electronsCount}</strong><span>заряженные части</span></div>
            <div title="Количество видимых парных взаимодействий."><small>Взаимодействия</small><strong>{interactions.length}</strong><span>парные отношения</span></div>
            <div title="Среднее расстояние между взаимодействующими электронами."><small>Среднее r</small><strong>{meanDistance.toFixed(1)}</strong><span>дистанция связей</span></div>
            <div title="Суммарная кулоновская энергия отталкивания в модели."><small>Энергия отталкивания</small><strong>{repulsionEnergy.toFixed(2)}</strong><span>∑1/r²</span></div>
            <div title="Пары электронов с противоположным спином в близкой области."><small>Спин-пары</small><strong>{paired}</strong><span>↑↓ структуры</span></div>
            <div title="Насколько электронное облако сохраняет устойчивую форму."><small>Орбитальная устойчивость</small><strong>{orbitalStability}%</strong><span>сохранение оболочки</span></div>
            <div title="Внешнее поле, которое сдвигает облако."><small>Поле</small><strong>{fieldStrength}</strong><span>смещение облака</span></div>
            <div title="Текущий режим среды."><small>Режим</small><strong>{regimeLabels[regime]}</strong><span>тип поведения</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
