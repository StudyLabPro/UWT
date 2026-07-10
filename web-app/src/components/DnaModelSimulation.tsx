import { useMemo, useState } from 'react'
import { RangeControl } from './RangeControl'

type Base = 'A' | 'T' | 'G' | 'C'
type Damage = 'none' | 'mutation' | 'break'
type Point3D = { x: number; y: number; z: number }

const pair: Record<Base, Base> = { A: 'T', T: 'A', G: 'C', C: 'G' }
const colors: Record<Base, string> = { A: '#ffb347', T: '#2f80ed', G: '#7ee0b8', C: '#ff6b6b' }
const damageLabels: Record<Damage, string> = { none: 'норма', mutation: 'мутация', break: 'разрыв' }

function baseAt(index: number, seed: number): Base {
  return (['A', 'T', 'G', 'C'] as Base[])[Math.abs(Math.floor(Math.sin(index * 2.17 + seed) * 1000)) % 4]
}

function rotate(point: Point3D, rotation: Point3D): Point3D {
  const rx = rotation.x * Math.PI / 180
  const ry = rotation.y * Math.PI / 180
  const rz = rotation.z * Math.PI / 180
  const cosX = Math.cos(rx)
  const sinX = Math.sin(rx)
  const cosY = Math.cos(ry)
  const sinY = Math.sin(ry)
  const cosZ = Math.cos(rz)
  const sinZ = Math.sin(rz)
  const y1 = point.y * cosX - point.z * sinX
  const z1 = point.y * sinX + point.z * cosX
  const x2 = point.x * cosY + z1 * sinY
  const z2 = -point.x * sinY + z1 * cosY
  const x3 = x2 * cosZ - y1 * sinZ
  const y3 = x2 * sinZ + y1 * cosZ
  return { x: x3, y: y3, z: z2 }
}

function project(point: Point3D) {
  const perspective = 170 / (170 + point.z)
  return {
    x: 50 + point.x * 0.82 * perspective,
    y: 50 + point.y * 0.82 * perspective,
    z: point.z,
    scale: perspective,
  }
}

export function DnaModelSimulation({ embedded = false }: { embedded?: boolean }) {
  const [length, setLength] = useState(28)
  const [twist, setTwist] = useState(48)
  const [damage, setDamage] = useState<Damage>('none')
  const [focus, setFocus] = useState(10)
  const [centerSpread, setCenterSpread] = useState(12)
  const [rotation, setRotation] = useState({ x: -18, y: 36, z: 0 })
  const activeFocus = Math.min(focus, length - 1)

  const nucleotides = useMemo(() => {
    const raw = Array.from({ length }).map((_, i) => {
      const base = baseAt(i, twist / 10)
      const complement = pair[base]
      const angle = i * 0.58 + twist * 0.025
      const y = -42 + (i / Math.max(1, length - 1)) * 84
      const radius = 20 + Math.sin(i * 0.23) * 2
      const p1 = { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius }
      const p2 = { x: Math.cos(angle + Math.PI) * radius, y, z: Math.sin(angle + Math.PI) * radius }
      const damaged = damage !== 'none' && Math.abs(i - activeFocus) <= (damage === 'break' ? 1 : 0)
      const mutated = damage === 'mutation' && i === activeFocus
      return { id: i, base: mutated ? complement : base, complement: mutated ? base : complement, p1, p2, damaged, mutated }
    })

    const centerWeights = raw.map((n) => 1 / (1 + Math.abs(n.id - activeFocus) / Math.max(1, centerSpread)))
    const weightSum = centerWeights.reduce((sum, weight) => sum + weight, 0)
    const center = raw.reduce<Point3D>((sum, n, index) => {
      const weight = centerWeights[index]
      return {
        x: sum.x + ((n.p1.x + n.p2.x) / 2) * weight,
        y: sum.y + ((n.p1.y + n.p2.y) / 2) * weight,
        z: sum.z + ((n.p1.z + n.p2.z) / 2) * weight,
      }
    }, { x: 0, y: 0, z: 0 })
    center.x /= weightSum
    center.y /= weightSum
    center.z /= weightSum

    return raw.map((n) => {
      const rotated1 = rotate({ x: n.p1.x - center.x, y: n.p1.y - center.y, z: n.p1.z - center.z }, rotation)
      const rotated2 = rotate({ x: n.p2.x - center.x, y: n.p2.y - center.y, z: n.p2.z - center.z }, rotation)
      return { ...n, a: project(rotated1), b: project(rotated2), depth: (rotated1.z + rotated2.z) / 2 }
    }).sort((a, b) => a.depth - b.depth)
  }, [length, twist, damage, activeFocus, centerSpread, rotation])

  const axes = useMemo(() => {
    const points = [
      [{ x: -34, y: 0, z: 0 }, { x: 34, y: 0, z: 0 }, 'X'],
      [{ x: 0, y: -42, z: 0 }, { x: 0, y: 42, z: 0 }, 'Y'],
      [{ x: 0, y: 0, z: -34 }, { x: 0, y: 0, z: 34 }, 'Z'],
    ] as const
    return points.map(([from, to, label]) => ({ from: project(rotate(from, rotation)), to: project(rotate(to, rotation)), label }))
  }, [rotation])

  const hydrogenBonds = nucleotides.filter((n) => !(damage === 'break' && n.damaged)).length
  const gcPairs = nucleotides.filter((n) => (n.base === 'G' && n.complement === 'C') || (n.base === 'C' && n.complement === 'G')).length
  const mutationCount = nucleotides.filter((n) => n.mutated).length
  const stability = Math.max(0, Math.round(42 + gcPairs * 1.7 + hydrogenBonds * 0.8 - (damage === 'break' ? 34 : damage === 'mutation' ? 12 : 0)))
  const information = length * 2 - mutationCount * 0.5 - (damage === 'break' ? 3 : 0)

  return (
    <section className={embedded ? 'dnaLab embeddedVisualizer visualizerShell' : 'dnaLab visualizerShell'}>
      <div className="sectionHeader compact visualizerHeader">
        <p className="kicker">Модель ДНК</p>
        <h2>Двойная спираль как 3D-сеть отношений</h2>
        <p>Нуклеотиды — части, пары оснований — отношения, комплементарность — правило устойчивости, распределённый центр — локальная область описания структуры.</p>
      </div>

      <div className="visualizerGrid dnaGrid">
        <div className="dnaControls glass visualizerControls">
          <label>Длина <strong>{length}</strong><span>Количество пар оснований в видимом фрагменте.</span><RangeControl min={8} max={64} value={length} onChange={setLength} /></label>
          <label>Скручивание <strong>{twist}</strong><span>Фаза двойной спирали; меняет геометрию, но не правило парности.</span><RangeControl min={0} max={100} value={twist} onChange={setTwist} /></label>
          <label>Центр <strong>{activeFocus + 1}</strong><span>Позиция, вокруг которой распределяется локальный центр описания.</span><RangeControl min={0} max={Math.max(0, length - 1)} value={activeFocus} onChange={setFocus} /></label>
          <label>Распределение центра <strong>{centerSpread}</strong><span>Чем выше значение, тем больше пар оснований участвуют в центре модели.</span><RangeControl min={1} max={32} value={centerSpread} onChange={setCenterSpread} /></label>
          <label>Вращение X <strong>{rotation.x}°</strong><span>Поворачивает спираль в 3D-пространстве вокруг оси X.</span><RangeControl min={-180} max={180} value={rotation.x} onChange={(x) => setRotation((r) => ({ ...r, x }))} /></label>
          <label>Вращение Y <strong>{rotation.y}°</strong><span>Поворачивает модель вокруг оси Y и раскрывает глубину спирали.</span><RangeControl min={-180} max={180} value={rotation.y} onChange={(y) => setRotation((r) => ({ ...r, y }))} /></label>
          <label>Вращение Z <strong>{rotation.z}°</strong><span>Поворачивает экранную проекцию вокруг оси Z.</span><RangeControl min={-180} max={180} value={rotation.z} onChange={(z) => setRotation((r) => ({ ...r, z }))} /></label>
          <label>Повреждение<span>Норма сохраняет связи, мутация меняет основание, разрыв удаляет водородные связи.</span></label>
          <div className="phaseButtons">
            {(['none', 'mutation', 'break'] as Damage[]).map((item) => <button key={item} type="button" className={damage === item ? 'active' : ''} onClick={() => setDamage(item)}>{damageLabels[item]}</button>)}
          </div>
          <div className="formulaBox">A↔T, G↔C · 3D-центр = распределённая локальность</div>
        </div>

        <div className="dnaStage visualizerStage">
          <svg viewBox="0 0 100 100" className="dnaSvg" role="img" aria-label="3D-модель двойной спирали ДНК">
            <defs>
              <linearGradient id="dnaBackbone" x1="0" x2="1"><stop offset="0" stopColor="#2f80ed" /><stop offset="1" stopColor="#7ee0b8" /></linearGradient>
            </defs>
            <circle cx="50" cy="50" r="39" className="dnaSpaceShell" />
            {axes.map((axis) => <g key={axis.label}><line x1={axis.from.x} y1={axis.from.y} x2={axis.to.x} y2={axis.to.y} className="dnaAxis" /><text x={axis.to.x + 1.2} y={axis.to.y + 1.2} className="dnaAxisLabel">{axis.label}</text></g>)}
            <path className="dnaBackbone" d={nucleotides.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.a.x} ${n.a.y}`).join(' ')} />
            <path className="dnaBackbone second" d={nucleotides.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.b.x} ${n.b.y}`).join(' ')} />
            {nucleotides.map((n) => <line key={`bond-${n.id}`} x1={n.a.x} y1={n.a.y} x2={n.b.x} y2={n.b.y} className={n.damaged ? 'baseBond damaged' : 'baseBond'} opacity={Math.max(0.22, Math.min(0.96, (n.a.scale + n.b.scale) / 2))} />)}
            {nucleotides.map((n) => (
              <g key={n.id} className={n.id === activeFocus ? 'dnaPair focused' : 'dnaPair'}>
                <circle cx={n.a.x} cy={n.a.y} r={(n.id === activeFocus ? 2.9 : 2.1) * n.a.scale} fill={colors[n.base]} />
                <circle cx={n.b.x} cy={n.b.y} r={(n.id === activeFocus ? 2.9 : 2.1) * n.b.scale} fill={colors[n.complement]} />
                <text x={n.a.x - 1.2} y={n.a.y + 1.1}>{n.base}</text>
                <text x={n.b.x - 1.2} y={n.b.y + 1.1}>{n.complement}</text>
              </g>
            ))}
            <circle cx="50" cy="50" r="2.2" className="dnaDistributedCenter" />
          </svg>
          <div className="metricsGrid matterMetrics">
            <div title="Количество пар оснований."><small>Длина</small><strong>{length}</strong><span>пары оснований</span></div>
            <div title="Сохранившиеся водородные связи."><small>Связи</small><strong>{hydrogenBonds}</strong><span>H-bonds</span></div>
            <div title="GC-пары дают повышенную устойчивость."><small>GC-пары</small><strong>{gcPairs}</strong><span>сильные пары</span></div>
            <div title="Индекс сохранности структуры."><small>Устойчивость</small><strong>{stability}%</strong><span>целостность</span></div>
            <div title="Мутации в выбранном фрагменте."><small>Мутации</small><strong>{mutationCount}</strong><span>изменение кода</span></div>
            <div title="Оценка информационной ёмкости участка."><small>Информация</small><strong>{information.toFixed(1)}</strong><span>кодовая мера</span></div>
            <div title="Текущий режим повреждения."><small>Состояние</small><strong>{damageLabels[damage]}</strong><span>режим</span></div>
            <div title="Распределённость локального центра."><small>3D-центр</small><strong>{centerSpread}</strong><span>радиус описания</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
