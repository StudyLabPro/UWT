import { useMemo, useState } from 'react'
import { BrowserPythonRunner } from './BrowserPythonRunner'
import { MagicBrainSimulation } from './MagicBrainSimulation'

type DemoId = 'textbrain' | 'genome' | 'neurogenesis' | 'twins' | 'hybrid' | 'diagnostics' | 'balansis'

const demos: { id: DemoId; title: string; caption: string; code: string; needsMagicBrain?: boolean; needsBalansis?: boolean }[] = [
  {
    id: 'textbrain',
    title: 'TextBrain SNN',
    caption: 'Создание SNN-мозга из genome и короткий тренировочный цикл.',
    needsMagicBrain: true,
    code: `from magicbrain import TextBrain
try:
    from magicbrain.tasks.text_task import train_loop
except Exception:
    train_loop = None

text = "uwt memory uwt memory stable memory "
chars = sorted(set(text))
stoi = {char: index for index, char in enumerate(chars)}
genome = "30121033102301230112332100123"
brain = TextBrain(genome, vocab_size=max(32, len(chars)))

if train_loop:
    try:
        train_loop(brain, text=text, stoi=stoi, steps=80)
    except TypeError:
        train_loop(brain, text, stoi, 80)

print("TextBrain создан")
print("genome", genome)
print("alphabet", len(chars))
print("brain", type(brain).__name__)`,
  },
  {
    id: 'genome',
    title: 'Genome decode',
    caption: 'Геном как детерминированное описание архитектуры.',
    needsMagicBrain: true,
    code: `genome = "30121033102301230112332100123"
try:
    from magicbrain.genome import decode_genome
    print(decode_genome(genome))
except Exception as error:
    print("decode_genome недоступен в установленной сборке:", error)
    stats = {
        "N_hint": 256 + int(genome[:2], 4) * 64,
        "K_hint": 8 + int(genome[2], 4) * 4,
        "lr_gene": genome[4],
        "dopamine_gene": genome[16],
        "prune_gene": genome[20],
    }
    print(stats)`,
  },
  {
    id: 'neurogenesis',
    title: 'NeuroGenesis',
    caption: 'Компиляция датасета в genome и запуск pipeline, если модуль доступен.',
    needsMagicBrain: true,
    code: `dataset = "relations memory agents stability"
try:
    from magicbrain.neurogenesis.compiler import GenomeCompiler
    compiler = GenomeCompiler(strategy="hybrid")
    genome = compiler.compile(dataset=dataset)
    print("compiled genome:", genome)
except Exception as error:
    print("GenomeCompiler недоступен или требует полную сборку:", error)
    genome = "30121033102301230112332100123"
    print("fallback genome:", genome)

try:
    from magicbrain.neurogenesis.pipeline import NeurogenesisPipeline
    pipeline = NeurogenesisPipeline()
    print("pipeline:", type(pipeline).__name__)
except Exception as error:
    print("pipeline demo skipped:", error)`,
  },
  {
    id: 'twins',
    title: 'Digital Twin',
    caption: 'Нейронный цифровой двойник студента и когнитивное состояние.',
    needsMagicBrain: true,
    code: `try:
    from magicbrain.integration.neural_digital_twin import NeuralDigitalTwin
    twin = NeuralDigitalTwin(student_id="student_42", learning_style="visual")
    twin.learn_topic(topic_id="uwt_relations", steps=20, difficulty=0.45)
    print("mastery:", twin.get_mastery(topic_id="uwt_relations"))
    print("state:", twin.get_cognitive_state())
except Exception as error:
    print("Digital Twin требует дополнительные зависимости или полную сборку:", error)
    print({"student_id": "student_42", "topic": "uwt_relations", "mastery": 0.45, "attention": 0.72})`,
  },
  {
    id: 'hybrid',
    title: 'Hybrid Orchestrator',
    caption: 'Каркас гибридного SNN → DNN/Transformer pipeline.',
    needsMagicBrain: true,
    code: `try:
    from magicbrain.platform import ModelOrchestrator, ExecutionStrategy
    orch = ModelOrchestrator()
    print("orchestrator:", type(orch).__name__)
    print("strategies:", [item.name for item in ExecutionStrategy])
except Exception as error:
    print("Platform-модуль требует расширенные зависимости:", error)
    print(["SEQUENTIAL", "PARALLEL", "PIPELINE", "FEEDBACK", "MOE"])

try:
    from magicbrain.hybrid import HybridBuilder
    print("HybridBuilder доступен:", HybridBuilder)
except Exception as error:
    print("HybridBuilder skipped:", error)`,
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics',
    caption: 'Диагностика активности, пластичности и устойчивости памяти.',
    needsMagicBrain: true,
    code: `genome = "30121033102301230112332100123"
try:
    from magicbrain import TextBrain
    brain = TextBrain(genome, vocab_size=32)
    print("brain class:", type(brain).__name__)
    print("available fields:", [name for name in dir(brain) if not name.startswith("_")][:24])
except Exception as error:
    print("TextBrain diagnostics failed:", error)

metrics = {
    "sparsity_target": "~5%",
    "uwt_parts": "neurons A_i",
    "uwt_relations": "synapses R(A_i,A_j)",
    "memory": "stable relation clusters",
}
print(metrics)`,
  },
  {
    id: 'balansis',
    title: 'Balansis ACT',
    caption: 'Компенсированная сумма весов отношений как UWT-энергия.',
    needsBalansis: true,
    code: `from balansis import AbsoluteValue, Operations

def B(value):
    return AbsoluteValue.from_float(float(value))

weights = [0.12, 0.18, 0.05, 0.44, 0.21, 0.39]
result, compensation = Operations.sequence_sum([B(value) for value in weights])
print("relation_energy:", result.to_float())
print("compensation:", compensation)
print("stable:", result.to_float() > 1.0)`,
  },
]

const modules = [
  ['TextBrain', 'SNN-ядро: sparse top-k, dopamine, Hebbian learning, delays.'],
  ['Genome System', 'Base-4 DNA-код архитектуры, связности и гиперпараметров.'],
  ['NeuroGenesis', 'Dataset → genome → 3D morphogenesis → training → reconstruction.'],
  ['Digital Twins', 'Модель студента: mastery, attention, fatigue, confusion.'],
  ['Hybrid Platform', 'SNN/DNN/Transformer/CNN/RNN orchestration strategies.'],
  ['Diagnostics', 'LiveMonitor, plasticity, synaptic metrics, neuronal dynamics.'],
  ['Balansis ACT', 'Компенсированная арифметика для аудита весов и энергии.'],
]

const roadmap = ['TextBrain', 'Genome', 'NeuroGenesis', 'Digital Twin', 'Hybrid', 'Diagnostics', 'Balansis']

export function MagicBrainPage() {
  const [activeDemo, setActiveDemo] = useState<DemoId>('textbrain')
  const demo = useMemo(() => demos.find((item) => item.id === activeDemo) || demos[0], [activeDemo])

  return (
    <section className="page magicBrainPage">
      <div className="magicHero glass">
        <div>
          <p className="kicker">MagicBrain Platform</p>
          <h1>MetaBrain-платформа для живой AGI-памяти</h1>
          <p>Отдельная лаборатория MagicBrain: SNN-память, genome-кодирование, NeuroGenesis, цифровые двойники, гибридная оркестрация, диагностика и Balansis ACT-арифметика.</p>
        </div>
        <div className="magicStack">
          {roadmap.map((item, index) => <span key={item} style={{ '--i': index } as React.CSSProperties}>{item}</span>)}
        </div>
      </div>

      <div className="magicModuleGrid">
        {modules.map(([title, text]) => <article key={title} className="magicModuleCard glass"><h3>{title}</h3><p>{text}</p></article>)}
      </div>

      <MagicBrainSimulation />

      <section className="magicDemoLab glass">
        <div className="sectionHeader compact">
          <p className="kicker">Исполнимые демонстрации</p>
          <h2>Возможности платформы MagicBrain</h2>
          <p>Каждая демонстрация запускается прямо в браузере. Некоторые модули могут требовать расширенные зависимости — в таких случаях код показывает безопасный fallback и смысл API.</p>
        </div>

        <div className="taskTabs magicDemoTabs">
          {demos.map((item) => <button key={item.id} className={activeDemo === item.id ? 'taskTab active' : 'taskTab'} onClick={() => setActiveDemo(item.id)}>{item.title}</button>)}
        </div>

        <article className="taskWorkspace">
          <div className="taskBrief">
            <h3>{demo.title}</h3>
            <p>{demo.caption}</p>
          </div>
          <pre className="codeBlock"><code>{demo.code}</code></pre>
          <BrowserPythonRunner code={demo.code} needsMagicBrain={demo.needsMagicBrain} needsBalansis={demo.needsBalansis} />
        </article>
      </section>
    </section>
  )
}
