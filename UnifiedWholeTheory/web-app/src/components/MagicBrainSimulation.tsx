import { useMemo, useState } from 'react'
import { BrowserPythonRunner } from './BrowserPythonRunner'
import { RangeControl } from './RangeControl'

const defaultGenome = '30121033102301230112332100123'

function genomeValue(genome: string, index: number) {
  const digit = Number(genome[index % genome.length] || 0)
  return Number.isFinite(digit) ? digit : 0
}

function buildMagicBrainCode(genome: string, vocabSize: number, steps: number) {
  return `from magicbrain import TextBrain

try:
    from magicbrain.tasks.text_task import train_loop
except Exception:
    train_loop = None

try:
    from magicbrain.sampling import sample_text
except Exception:
    sample_text = None

genome = "${genome}"
text = "uwt memory uwt memory uwt stable memory "
chars = sorted(set(text + "uwt"))
stoi = {char: index for index, char in enumerate(chars)}
vocab_size = max(${vocabSize}, len(chars))
brain = TextBrain(genome, vocab_size=vocab_size)

if train_loop is not None:
    try:
        train_loop(brain, text=text, stoi=stoi, steps=${steps})
    except TypeError:
        train_loop(brain, text, stoi, ${steps})

print("MagicBrain TextBrain создан")
print("genome:", genome)
print("vocab_size:", vocab_size)
print("class:", type(brain).__name__)

if sample_text is not None:
    try:
        print("sample:", sample_text(brain, seed="UWT", n_tokens=24, temperature=0.8))
    except Exception as error:
        print("sample недоступен:", error)
`
}

export function MagicBrainSimulation({ embedded = false }: { embedded?: boolean }) {
  const [genome, setGenome] = useState(defaultGenome)
  const [neurons, setNeurons] = useState(72)
  const [activity, setActivity] = useState(42)
  const [plasticity, setPlasticity] = useState(58)
  const [viewCenter, setViewCenter] = useState(0)
  const [steps, setSteps] = useState(200)
  const safeGenome = genome.replace(/[^0-3]/g, '').slice(0, 96) || defaultGenome
  const activeCenter = Math.min(viewCenter, neurons - 1)

  const graph = useMemo(() => {
    const nodes = Array.from({ length: neurons }).map((_, i) => {
      const g = genomeValue(safeGenome, i)
      const ring = 11 + ((i * 17 + g * 13) % 35)
      const angle = i * 2.399 + g * 0.38 + activity * 0.01
      const layer = genomeValue(safeGenome, i + 5)
      const x = 50 + Math.cos(angle) * ring * (0.65 + layer * 0.08)
      const y = 50 + Math.sin(angle * 1.07) * ring * (0.62 + g * 0.06)
      const charge = (Math.sin(i * 1.31 + activity * 0.06 + g) + 1) / 2
      return { id: i, x, y, charge, active: charge * 100 > 100 - activity, module: (g + layer) % 6 }
    })

    const links: { a: number; b: number; stable: boolean; active: boolean; weight: number }[] = []
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i]
        const b = nodes[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        const sameModule = a.module === b.module
        const centered = i === activeCenter || j === activeCenter
        const geneAffinity = genomeValue(safeGenome, i + j) / 3
        if (d < 16 + plasticity * 0.08 || sameModule || centered) {
          const weight = Math.max(0.05, Math.min(1, (sameModule ? 0.5 : 0.2) + geneAffinity * 0.28 + plasticity / 220 - d / 120))
          links.push({ a: i, b: j, weight, stable: weight > 0.55 && sameModule, active: (a.active || b.active) && weight > 0.32 })
        }
      }
    }
    return { nodes, links }
  }, [safeGenome, neurons, activity, plasticity, activeCenter])

  const stableLinks = graph.links.filter((link) => link.stable).length
  const activeLinks = graph.links.filter((link) => link.active).length
  const activeNeurons = graph.nodes.filter((node) => node.active).length
  const relationEnergy = graph.links.reduce((sum, link) => sum + link.weight, 0)
  const memoryStability = Math.round((stableLinks / Math.max(1, graph.links.length)) * 100)
  const sparsity = Math.round((activeNeurons / Math.max(1, neurons)) * 100)
  const code = buildMagicBrainCode(safeGenome, Math.max(8, Math.min(128, neurons)), steps)

  return (
    <section className={embedded ? 'magicBrainLab embeddedVisualizer' : 'magicBrainLab'}>
      <div className="sectionHeader compact">
        <p className="kicker">MagicBrain · MetaBrain</p>
        <h2>Геномная SNN-память как UWT-сеть отношений</h2>
        <p>Genome задаёт архитектуру, нейроны — части Aᵢ, синапсы — отношения R(Aᵢ,Aⱼ), устойчивые связи — память, Balansis/MagicBrain-код можно запустить прямо в браузере.</p>
      </div>

      <div className="magicBrainGrid">
        <div className="magicBrainControls glass">
          <label>Genome<span>Base-4 строка MagicBrain, управляющая топологией и связностью.</span><input value={genome} onChange={(e) => setGenome(e.target.value)} /></label>
          <label>Нейроны <strong>{neurons}</strong><span>Размер видимой SNN-сети.</span><RangeControl min={16} max={128} value={neurons} onChange={setNeurons} /></label>
          <label>Активность <strong>{activity}%</strong><span>Доля активных спайковых узлов.</span><RangeControl min={0} max={100} value={activity} onChange={setActivity} /></label>
          <label>Пластичность <strong>{plasticity}%</strong><span>Усиление устойчивых синаптических структур.</span><RangeControl min={0} max={100} value={plasticity} onChange={setPlasticity} /></label>
          <label>Центр <strong>N{activeCenter + 1}</strong><span>Локальный центр описания UWT.</span><RangeControl min={0} max={Math.max(0, neurons - 1)} value={activeCenter} onChange={setViewCenter} /></label>
          <label>Шаги обучения <strong>{steps}</strong><span>Параметр для запуска TextBrain-примера.</span><RangeControl min={10} max={1000} value={steps} onChange={setSteps} /></label>
          <div className="formulaBox">MagicBrain = genome → SNN → stable memory</div>
        </div>

        <div className="magicBrainStage">
          <svg viewBox="0 0 100 100" className="magicBrainSvg" role="img" aria-label="MagicBrain SNN визуализация">
            <defs>
              <radialGradient id="magicNeuronGlow"><stop offset="0" stopColor="#f4f1e8" /><stop offset="0.48" stopColor="#7ee0b8" /><stop offset="1" stopColor="#2f80ed" /></radialGradient>
            </defs>
            <circle cx="50" cy="50" r="42" className="magicBrainShell" />
            {graph.links.map((link, index) => {
              const a = graph.nodes[link.a]
              const b = graph.nodes[link.b]
              return <line key={index} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={link.active ? 'magicSynapse active' : link.stable ? 'magicSynapse stable' : 'magicSynapse'} opacity={link.active ? 0.9 : link.stable ? 0.62 : Math.max(0.08, link.weight * 0.28)} />
            })}
            {graph.nodes.map((node) => <g key={node.id} onClick={() => setViewCenter(node.id)} className="magicNeuronGroup"><circle cx={node.x} cy={node.y} r={node.id === activeCenter ? 3.9 : node.active ? 2.7 : 1.75} className={node.id === activeCenter ? 'magicNeuron center' : node.active ? 'magicNeuron active' : 'magicNeuron'} /><text x={node.x + 2.1} y={node.y - 1.4} className="magicNeuronLabel">{node.id + 1}</text></g>)}
          </svg>

          <div className="metricsGrid matterMetrics">
            <div><small>Genome</small><strong>{safeGenome.length}</strong><span>base-4 символов</span></div>
            <div><small>Нейроны</small><strong>{neurons}</strong><span>части Aᵢ</span></div>
            <div><small>Синапсы</small><strong>{graph.links.length}</strong><span>отношения R</span></div>
            <div><small>Активные</small><strong>{activeLinks}</strong><span>спайковые связи</span></div>
            <div><small>Память</small><strong>{stableLinks}</strong><span>устойчивые связи</span></div>
            <div><small>Stab</small><strong>{memoryStability}%</strong><span>устойчивость</span></div>
            <div><small>Sparsity</small><strong>{sparsity}%</strong><span>активация</span></div>
            <div><small>Energy</small><strong>{relationEnergy.toFixed(1)}</strong><span>∑ весов</span></div>
          </div>
        </div>
      </div>

      <div className="magicBrainCode glass">
        <h3>Исполнимый MagicBrain-код</h3>
        <pre className="codeBlock"><code>{code}</code></pre>
        <BrowserPythonRunner code={code} needsMagicBrain />
      </div>
    </section>
  )
}
