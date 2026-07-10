import { useMemo } from 'react'

type Rotation = { x: number; y: number; z: number }
type CenterOffset = { x: number; y: number; z: number }

type Part = {
  id: number
  absolute: [number, number, number]
  relative: [number, number, number]
  projected: [number, number]
  mass: number
  stability: number
}

type Relation = {
  i: number
  j: number
  vector: [number, number, number]
  distance: number
  previousDistance: number
  velocity: number
  acceleration: number
  mass: number
  momentum: number
  force: number
  kinetic: number
  potential: number
  energy: number
  stable: boolean
  centered: boolean
  intensity: number
}

function compensatedSum(values: number[]) {
  let sum = 0
  let compensation = 0
  for (const value of values) {
    const y = value - compensation
    const t = sum + y
    compensation = (t - sum) - y
    sum = t
  }
  return { sum, compensation: Math.abs(compensation) }
}

function length3([x, y, z]: [number, number, number]) {
  return Math.hypot(x, y, z)
}

function latticePoint(index: number, motion: number): [number, number, number] {
  const layer = Math.floor(index / 25)
  const local = index % 25
  const col = local % 5
  const row = Math.floor(local / 5)
  const t = motion / 1000
  const wave = Math.round(Math.sin(t * Math.PI * 2 + index * 0.73))
  return [
    col - 2 + ((layer + wave) % 3) - 1,
    row - 2 + ((index + wave) % 3) - 1,
    layer - 2 + ((index * 2 + wave) % 3) - 1,
  ]
}

function relativeVector(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
}

function radians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function rotateVector([x, y, z]: [number, number, number], rotation: Rotation): [number, number, number] {
  const ax = radians(rotation.x)
  const ay = radians(rotation.y)
  const az = radians(rotation.z)

  const y1 = y * Math.cos(ax) - z * Math.sin(ax)
  const z1 = y * Math.sin(ax) + z * Math.cos(ax)
  const x1 = x

  const x2 = x1 * Math.cos(ay) + z1 * Math.sin(ay)
  const z2 = -x1 * Math.sin(ay) + z1 * Math.cos(ay)
  const y2 = y1

  const x3 = x2 * Math.cos(az) - y2 * Math.sin(az)
  const y3 = x2 * Math.sin(az) + y2 * Math.cos(az)

  return [x3, y3, z2]
}

function project(vector: [number, number, number], rotation: Rotation) {
  const [x, y, z] = rotateVector(vector, rotation)
  const scale = 7.2
  const depth = 1 / (1 + (z + 18) / 90)
  return [50 + (x - y) * scale * depth, 50 + (x + y) * scale * 0.42 * depth - z * scale * depth] as [number, number]
}

function shiftedLatticePoint(index: number, motion: number, center: number, offset: CenterOffset): [number, number, number] {
  const point = latticePoint(index, motion)
  if (index !== center) return point
  return [point[0] + offset.x, point[1] + offset.y, point[2] + offset.z]
}

function buildModel(parts: number, motion: number, center: number, rotation: Rotation, centerOffset: CenterOffset) {
  const normalizedCenter = parts > 0 ? Math.min(center, parts - 1) : 0
  const absolute = Array.from({ length: parts }).map((_, id) => latticePoint(id, motion))
  const previousAbsolute = Array.from({ length: parts }).map((_, id) => latticePoint(id, Math.max(0, motion - 1)))
  const origin = absolute[normalizedCenter] ?? [0, 0, 0]

  const allRelations: Relation[] = []
  const relationDeltasByPart = Array.from({ length: parts }, () => 0)

  for (let i = 0; i < parts; i += 1) {
    for (let j = i + 1; j < parts; j += 1) {
      const vector = relativeVector(absolute[i], absolute[j])
      const previousVector = relativeVector(previousAbsolute[i], previousAbsolute[j])
      const distance = length3(vector)
      const previousDistance = length3(previousVector)
      const velocity = Math.abs(distance - previousDistance)
      const previousPreviousDistance = length3(relativeVector(latticePoint(i, Math.max(0, motion - 2)), latticePoint(j, Math.max(0, motion - 2))))
      const previousVelocity = Math.abs(previousDistance - previousPreviousDistance)
      const acceleration = velocity - previousVelocity
      relationDeltasByPart[i] += velocity
      relationDeltasByPart[j] += velocity
      allRelations.push({
        i,
        j,
        vector,
        distance,
        previousDistance,
        velocity,
        acceleration,
        mass: 0,
        momentum: 0,
        force: 0,
        kinetic: 0,
        potential: 0,
        energy: 0,
        stable: false,
        centered: i === normalizedCenter || j === normalizedCenter,
        intensity: 0,
      })
    }
  }

  const masses = relationDeltasByPart.map((delta) => 0.25 + 8 / (1 + delta))

  const relations = allRelations.map((relation) => {
    const mass = (masses[relation.i] + masses[relation.j]) / 2
    const momentum = mass * relation.velocity
    const force = mass * relation.acceleration
    const kinetic = 0.5 * mass * relation.velocity ** 2
    const potential = 0.025 * relation.distance ** 2
    const energy = kinetic + potential
    const stable = relation.distance > 0 && relation.distance <= 2.25 && Math.abs(relation.velocity) < 0.35
    const intensity = stable ? 1 : Math.max(0.18, 1 - relation.distance / 8)
    return { ...relation, mass, momentum, force, kinetic, potential, energy, stable, intensity }
  })

  const partsData: Part[] = absolute.map((point, id) => {
    const relative = relativeVector(origin, point)
    const projected = project(relative, rotation)
    const stability = 1 / (1 + relationDeltasByPart[id])
    return { id, absolute: point, relative, projected, mass: masses[id] ?? 0, stability }
  })

  const hasRelations = parts > 1
  const centeredRelations = hasRelations ? relations.filter((relation) => relation.centered) : []
  const stableRelations = relations.filter((relation) => relation.stable)
  const visibleRelations = relations.filter((relation) => relation.centered || relation.stable || (parts <= 48 && relation.distance <= 2.5))
  const nextRelations = buildNextRelationForecast(parts, motion + 1, normalizedCenter, centerOffset)

  const distanceAudit = compensatedSum(centeredRelations.map((relation) => relation.distance))
  const energyAudit = compensatedSum(relations.map((relation) => relation.energy))
  const velocityAudit = compensatedSum(relations.map((relation) => relation.velocity))
  const massAudit = compensatedSum(partsData.map((part) => part.mass))

  const time = hasRelations ? compensatedSum(relations.map((relation) => Math.abs(relation.distance - relation.previousDistance))).sum : 0
  const meanDistance = centeredRelations.length ? distanceAudit.sum / centeredRelations.length : 0
  const meanVelocity = relations.length ? velocityAudit.sum / relations.length : 0
  const totalEnergy = hasRelations ? energyAudit.sum : 0
  const spaceDimension = hasRelations ? inferDimension(partsData) : 0

  return {
    normalizedCenter,
    partsData,
    relations,
    visibleRelations,
    centeredRelations,
    stableRelations,
    hasRelations,
    metrics: {
      spaceDimension,
      time,
      meanDistance,
      meanVelocity,
      totalMass: massAudit.sum,
      totalEnergy,
      stableCount: stableRelations.length,
      compensation: energyAudit.compensation + distanceAudit.compensation,
      predictedEnergy: nextRelations.energy,
      predictedMeanDistance: nextRelations.meanDistance,
    },
  }
}

function buildNextRelationForecast(parts: number, motion: number, center: number, centerOffset: CenterOffset) {
  if (parts <= 1) return { energy: 0, meanDistance: 0 }
  const absolute = Array.from({ length: parts }).map((_, id) => shiftedLatticePoint(id, motion, center, centerOffset))
  const origin = absolute[center] ?? [0, 0, 0]
  const distances: number[] = []
  let energy = 0
  for (let i = 0; i < parts; i += 1) {
    for (let j = i + 1; j < parts; j += 1) {
      const d = length3(relativeVector(absolute[i], absolute[j]))
      energy += 0.025 * d ** 2
      if (i === center || j === center) distances.push(length3(relativeVector(origin, i === center ? absolute[j] : absolute[i])))
    }
  }
  return { energy, meanDistance: distances.length ? compensatedSum(distances).sum / distances.length : 0 }
}

function inferDimension(partsData: Part[]) {
  const axes = [0, 1, 2].map((axis) => new Set(partsData.map((part) => part.relative[axis] as number)).size > 1)
  return axes.filter(Boolean).length
}

export function MiniUniverseCanvas({
  parts,
  motion,
  center,
  rotation,
  centerOffset,
  onRotationChange,
  onCenterOffsetChange,
  onCenterChange,
}: {
  parts: number
  motion: number
  center: number
  rotation: Rotation
  centerOffset: CenterOffset
  onRotationChange: (rotation: Rotation) => void
  onCenterOffsetChange: (offset: CenterOffset) => void
  onCenterChange: (center: number) => void
}) {
  const model = useMemo(() => buildModel(parts, motion, center, rotation, centerOffset), [parts, motion, center, rotation, centerOffset])
  const centerPart = model.partsData[model.normalizedCenter]

  function rotateByDrag(event: React.PointerEvent<SVGSVGElement>) {
    if (event.buttons !== 1) return
    onRotationChange({
      x: Math.max(-180, Math.min(180, rotation.x + event.movementY)),
      y: Math.max(-180, Math.min(180, rotation.y + event.movementX)),
      z: rotation.z,
    })
  }

  function moveSelectedCenter(event: React.PointerEvent<SVGGElement>) {
    if (event.buttons !== 1) return
    event.stopPropagation()
    onCenterOffsetChange({
      x: Math.max(-10, Math.min(10, centerOffset.x + Math.sign(event.movementX))),
      y: Math.max(-10, Math.min(10, centerOffset.y + Math.sign(event.movementY))),
      z: centerOffset.z,
    })
  }

  return (
    <div className="universePanel visualizerStage">
      <div className="centerReadout">
        <span>UWT-вычислитель отношений · вращение вокруг (0,0,0)</span>
        <strong>{parts > 0 ? `A${model.normalizedCenter + 1}` : '∅'}</strong>
        <small>{model.hasRelations ? 'Тяните сцену или меняйте X/Y/Z — отношения не искажаются' : 'Нет отношений: пространство, время и скорость = 0'}</small>
      </div>
      <svg viewBox="0 0 100 100" className="universeSvg lattice" role="img" aria-label="UWT вычислитель отношений" onPointerMove={rotateByDrag}>
        <defs>
          <radialGradient id="nodeGlow"><stop offset="0" stopColor="#f4f1e8" /><stop offset="1" stopColor="#2f80ed" /></radialGradient>
          <radialGradient id="centerGlow"><stop offset="0" stopColor="#ffb347" /><stop offset="1" stopColor="#2f80ed" /></radialGradient>
          <radialGradient id="stableGlow"><stop offset="0" stopColor="#7ee0b8" /><stop offset="1" stopColor="#2f80ed" /></radialGradient>
        </defs>
        <g className="gridAxes">
          <line x1="50" y1="50" x2="88" y2="66" />
          <line x1="50" y1="50" x2="14" y2="66" />
          <line x1="50" y1="50" x2="50" y2="12" />
          <text x="90" y="68">x</text><text x="10" y="68">y</text><text x="52" y="12">z</text>
        </g>
        {centerPart && model.hasRelations && <circle cx={centerPart.projected[0]} cy={centerPart.projected[1]} r="18" className="centerHalo" />}
        {parts === 0 && <text x="50" y="50" textAnchor="middle" className="emptyUniverseText">нет частей → нет пространства и времени</text>}
        {parts === 1 && <text x="50" y="62" textAnchor="middle" className="emptyUniverseText">A1=(0,0,0), отношений нет, t=0, v=0</text>}
        {model.visibleRelations.map((relation, index) => {
          const a = model.partsData[relation.i]
          const b = model.partsData[relation.j]
          const className = relation.stable ? 'relationLine stable' : relation.centered ? 'relationLine centered' : 'relationLine'
          return <line key={index} x1={a.projected[0]} y1={a.projected[1]} x2={b.projected[0]} y2={b.projected[1]} className={className} opacity={relation.stable ? 0.95 : relation.centered ? 0.78 : relation.intensity * 0.38} />
        })}
        {model.partsData.map((part) => (
          <g key={part.id} className="nodeButton" onPointerMove={part.id === model.normalizedCenter ? moveSelectedCenter : undefined} onClick={() => onCenterChange(part.id)}>
            <circle cx={part.projected[0]} cy={part.projected[1]} r={part.id === model.normalizedCenter ? 4.9 : part.stability > 0.65 ? 3.5 : 2.2} className={part.id === model.normalizedCenter && model.hasRelations ? 'nodeDot center' : part.stability > 0.65 ? 'nodeDot stable' : 'nodeDot'} />
            <text x={part.projected[0] + 2.4} y={part.projected[1] - 2.4} className={part.id === model.normalizedCenter && model.hasRelations ? 'nodeLabel active' : 'nodeLabel'}>{part.id + 1}</text>
          </g>
        ))}
      </svg>
      <div className="metricsGrid expanded physicsGrid">
        <div title="Сколько независимых направлений различимости возникает из отношений."><small>Размерность пространства</small><strong>{model.metrics.spaceDimension}D</strong><span>выведена из различимых осей</span></div>
        <div title="Суммарное изменение расстояний между состояниями; если изменений нет, время равно нулю."><small>Время ΔS</small><strong>{model.metrics.time.toFixed(2)}</strong><span>мера изменения отношений</span></div>
        <div title="Среднее расстояние от выбранного центра до связанных с ним частей."><small>Среднее расстояние</small><strong>{model.metrics.meanDistance.toFixed(2)}</strong><span>d = F(R)</span></div>
        <div title="Средняя скорость как изменение расстояния между соседними состояниями."><small>Средняя скорость</small><strong>{model.metrics.meanVelocity.toFixed(2)}</strong><span>v = Δd / ΔS</span></div>
        <div title="Масса выводится из устойчивости: чем меньше скачут отношения, тем выше масса."><small>Масса системы</small><strong>{model.metrics.totalMass.toFixed(2)}</strong><span>из устойчивости связей</span></div>
        <div title="Сумма кинетической и потенциальной частей отношений."><small>Энергия</small><strong>{model.metrics.totalEnergy.toFixed(2)}</strong><span>K + P отношений</span></div>
        <div title="Количество связей с малой дистанцией и малым изменением: модель устойчивой структуры."><small>Устойчивые структуры</small><strong>{model.metrics.stableCount}</strong><span>память/форма системы</span></div>
        <div title="Компенсационный остаток суммирования в духе ACT/Balansis."><small>ACT compensation</small><strong>{model.metrics.compensation.toExponential(1)}</strong><span>аудит численной потери</span></div>
        <div title="Оценка энергии следующего состояния при motion + 1."><small>Прогноз E</small><strong>{model.metrics.predictedEnergy.toFixed(2)}</strong><span>следующий шаг</span></div>
        <div title="Оценка среднего расстояния следующего состояния."><small>Прогноз d</small><strong>{model.metrics.predictedMeanDistance.toFixed(2)}</strong><span>будущее d</span></div>
        <div title="Углы камеры; меняют только вид, не физику."><small>Поворот</small><strong>{rotation.x},{rotation.y},{rotation.z}</strong><span>только визуальная проекция</span></div>
        <div title="Физическое смещение выбранной части относительно остальных."><small>Сдвиг центра</small><strong>{centerOffset.x},{centerOffset.y},{centerOffset.z}</strong><span>пересчитывает R</span></div>
        <div title="Полное количество парных отношений между частями."><small>Всего отношений</small><strong>{model.relations.length}</strong><span>n(n−1)/2</span></div>
      </div>
    </div>
  )
}
