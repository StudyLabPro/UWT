import { useEffect, useState } from 'react'
import { practicalTasks } from '../data/tasks'
import { MiniUniverseCanvas } from './MiniUniverseCanvas'
import { MatterAtomsSimulation } from './MatterAtomsSimulation'
import { NeuromorphicBrainSimulation } from './NeuromorphicBrainSimulation'
import { ElectronInteractionSimulation } from './ElectronInteractionSimulation'
import { DnaModelSimulation } from './DnaModelSimulation'
import { MagicBrainSimulation } from './MagicBrainSimulation'
import { WaveFunctionSimulation } from './WaveFunctionSimulation'
import { BrowserPythonRunner } from './BrowserPythonRunner'
import { RangeControl } from './RangeControl'

type Visualizer = 'uwt' | 'wave' | 'matter' | 'brain' | 'electrons' | 'dna' | 'magicbrain'

export function ExamplesLab() {
  const [activeVisualizer, setActiveVisualizer] = useState<Visualizer>('uwt')
  const [activeTask, setActiveTask] = useState(0)
  const [activeCode, setActiveCode] = useState<'python' | 'act'>('python')
  const [parts, setParts] = useState(64)
  const [motion, setMotion] = useState(250)
  const [center, setCenter] = useState(0)
  const [randomizer, setRandomizer] = useState(0)
  const [rotation, setRotation] = useState({ x: 24, y: -34, z: 18 })
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    if (parts === 0) {
      setCenter(0)
    } else if (center >= parts) {
      setCenter(parts - 1)
    }
  }, [center, parts])

  function randomizeAll(value: number) {
    setRandomizer(value)
    const seed = Math.sin(value * 999.91) * 10000
    const nextParts = Math.max(0, Math.min(128, Math.floor(Math.abs(seed % 129))))
    const nextMotion = Math.max(0, Math.min(1000, Math.floor(Math.abs(Math.sin(seed) * 1000))))
    const nextCenter = nextParts > 0 ? Math.floor(Math.abs(Math.cos(seed * 0.73) * nextParts)) : 0
    setParts(nextParts)
    setMotion(nextMotion)
    setCenter(nextCenter)
    setRotation({
      x: Math.round(Math.sin(seed) * 180),
      y: Math.round(Math.cos(seed * 0.7) * 180),
      z: Math.round(Math.sin(seed * 0.37) * 180),
    })
    setCenterOffset({
      x: Math.round(Math.sin(seed * 0.21) * 5),
      y: Math.round(Math.cos(seed * 0.33) * 5),
      z: Math.round(Math.sin(seed * 0.49) * 5),
    })
  }

  const task = practicalTasks[activeTask]
  const executableCode = activeCode === 'python' ? task.pythonSolution : task.actSolution

  return (
    <section className="page labPage">
      <div className="sectionHeader">
        <p className="kicker">Вкладка 2 · примеры и визуализации</p>
        <h1>Единый визуализатор отношений</h1>
        <p>Переключайте тип системы: мини-вселенная UWT, вещество, мозг или электроны. В каждом режиме видны части, отношения и устойчивые структуры.</p>
      </div>

      <div className="visualizerTabs">
        {[
          ['uwt', 'UWT'],
          ['wave', 'Волновая'],
          ['electrons', 'Электроны'],
          ['matter', 'Вещество'],
          ['dna', 'ДНК'],
          ['brain', 'Мозг'],
          ['magicbrain', 'MagicBrain'],
        ].map(([id, label]) => <button key={id} className={activeVisualizer === id ? 'visualizerTab active' : 'visualizerTab'} onClick={() => setActiveVisualizer(id as Visualizer)}>{label}</button>)}
      </div>

      {activeVisualizer === 'uwt' && (
        <div className="labGrid unifiedVisualizer">
          <div className="controlPanel glass">
            <label>Количество частей <strong>{parts}</strong><span>Сколько элементов существует в модели; при 0–1 части нет отношений, пространства, времени и скорости.</span><RangeControl min={0} max={128} value={parts} onChange={setParts} /></label>
            <label>Изменение отношений <strong>{motion}</strong><span>Параметр состояния S: меняет конфигурацию отношений и порождает реляционное время ΔS.</span><RangeControl min={0} max={1000} value={motion} onChange={setMotion} /></label>
            <label>Центр описания <strong>{parts > 0 ? `A${center + 1}` : 'нет частей'}</strong><span>Выбранная часть становится локальным началом координат (0,0,0); все величины считаются относительно неё.</span><RangeControl min={0} max={Math.max(0, parts - 1)} value={parts > 0 ? center : 0} onChange={setCenter} /></label>
            <label>Сдвиг X <strong>{centerOffset.x}</strong><span>Двигает выбранную часть по оси X относительно остальных.</span><RangeControl min={-10} max={10} value={centerOffset.x} onChange={(x) => setCenterOffset((o) => ({ ...o, x }))} /></label>
            <label>Сдвиг Y <strong>{centerOffset.y}</strong><span>Двигает центр по оси Y; отношения и энергия пересчитываются.</span><RangeControl min={-10} max={10} value={centerOffset.y} onChange={(y) => setCenterOffset((o) => ({ ...o, y }))} /></label>
            <label>Сдвиг Z <strong>{centerOffset.z}</strong><span>Двигает центр по глубине Z и меняет 3D-расстояния.</span><RangeControl min={-10} max={10} value={centerOffset.z} onChange={(z) => setCenterOffset((o) => ({ ...o, z }))} /></label>
            <label>Вращение X <strong>{rotation.x}°</strong><span>Меняет только вид вокруг оси X.</span><RangeControl min={-180} max={180} value={rotation.x} onChange={(x) => setRotation((r) => ({ ...r, x }))} /></label>
            <label>Вращение Y <strong>{rotation.y}°</strong><span>Меняет только визуальную проекцию вокруг Y.</span><RangeControl min={-180} max={180} value={rotation.y} onChange={(y) => setRotation((r) => ({ ...r, y }))} /></label>
            <label>Вращение Z <strong>{rotation.z}°</strong><span>Поворачивает вид вокруг Z без изменения физики.</span><RangeControl min={-180} max={180} value={rotation.z} onChange={(z) => setRotation((r) => ({ ...r, z }))} /></label>
            <label>Рандом <strong>{randomizer}</strong><span>Создаёт новый сценарий параметров.</span><RangeControl min={0} max={1000} value={randomizer} onChange={randomizeAll} /></label>
          </div>
          <MiniUniverseCanvas parts={parts} motion={motion} center={center} centerOffset={centerOffset} rotation={rotation} onCenterOffsetChange={setCenterOffset} onRotationChange={setRotation} onCenterChange={setCenter} />
        </div>
      )}

      {activeVisualizer === 'wave' && <WaveFunctionSimulation embedded />}
      {activeVisualizer === 'matter' && <MatterAtomsSimulation embedded />}
      {activeVisualizer === 'brain' && <NeuromorphicBrainSimulation embedded />}
      {activeVisualizer === 'electrons' && <ElectronInteractionSimulation embedded />}
      {activeVisualizer === 'dna' && <DnaModelSimulation embedded />}
      {activeVisualizer === 'magicbrain' && <MagicBrainSimulation embedded />}

      <section className="taskTabsPanel glass">
        <div className="sectionHeader compact">
          <p className="kicker">Исполнимые примеры</p>
          <h2>Задачи UWT как код</h2>
          <p>Выберите задачу: внутри есть описание, решение на чистом Python и исполнимый вариант на библиотеке Balansis для конкретной UWT-задачи.</p>
        </div>

        <div className="taskTabs">
          {practicalTasks.map((item, index) => (
            <button key={item.title} className={activeTask === index ? 'taskTab active' : 'taskTab'} onClick={() => setActiveTask(index)}>{item.title}</button>
          ))}
        </div>

        <article className="taskWorkspace">
          <div className="taskBrief">
            <h3>{task.title}</h3>
            <p><b>Задача:</b> {task.problem}</p>
            <p><b>Решение UWT:</b> {task.uwtSolution}</p>
          </div>

          <div className="codeModeTabs">
            <button className={activeCode === 'python' ? 'active' : ''} onClick={() => setActiveCode('python')}>Чистый Python</button>
            <button className={activeCode === 'act' ? 'active' : ''} onClick={() => setActiveCode('act')}>Balansis UWT</button>
          </div>

          <pre className="codeBlock"><code>{executableCode}</code></pre>
          <BrowserPythonRunner code={executableCode} needsBalansis={activeCode === 'act'} />
        </article>
      </section>
    </section>
  )
}
