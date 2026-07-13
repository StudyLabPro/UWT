import { loc, type Localized } from '../i18n/language'

export type MagicBrainDemoId = 'textbrain' | 'genome' | 'neurogenesis' | 'twins' | 'hybrid' | 'diagnostics' | 'balansis'

export type MagicBrainDemo = {
  id: MagicBrainDemoId
  title: string
  caption: Localized
  code: string
  needsMagicBrain?: boolean
  needsBalansis?: boolean
}

export const magicBrainDemos: MagicBrainDemo[] = [
  {
    id: 'textbrain',
    title: 'TextBrain SNN',
    caption: loc(
      'Создание SNN-мозга из genome и короткий тренировочный цикл.',
      'Building an SNN brain from a genome, plus a short training loop.',
    ),
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
    caption: loc(
      'Геном как детерминированное описание архитектуры.',
      'The genome as a deterministic description of the architecture.',
    ),
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
    caption: loc(
      'Компиляция датасета в genome и запуск pipeline, если модуль доступен.',
      'Compiling a dataset into a genome and launching the pipeline when the module is available.',
    ),
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
    caption: loc(
      'Нейронный цифровой двойник студента и когнитивное состояние.',
      'A neural digital twin of a student and its cognitive state.',
    ),
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
    caption: loc(
      'Каркас гибридного SNN → DNN/Transformer pipeline.',
      'A skeleton of a hybrid SNN → DNN/Transformer pipeline.',
    ),
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
    caption: loc(
      'Диагностика активности, пластичности и устойчивости памяти.',
      'Diagnostics of activity, plasticity, and memory stability.',
    ),
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
    caption: loc(
      'Компенсированная сумма весов отношений как UWT-энергия.',
      'A compensated sum of relation weights as UWT energy.',
    ),
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

export const magicBrainModules: [string, Localized][] = [
  ['TextBrain', loc('SNN-ядро: sparse top-k, dopamine, Hebbian learning, delays.', 'The SNN core: sparse top-k, dopamine, Hebbian learning, delays.')],
  ['Genome System', loc('Base-4 DNA-код архитектуры, связности и гиперпараметров.', 'A base-4 DNA code of the architecture, connectivity, and hyperparameters.')],
  ['NeuroGenesis', loc('Dataset → genome → 3D morphogenesis → training → reconstruction.', 'Dataset → genome → 3D morphogenesis → training → reconstruction.')],
  ['Digital Twins', loc('Модель студента: mastery, attention, fatigue, confusion.', 'A student model: mastery, attention, fatigue, confusion.')],
  ['Hybrid Platform', loc('SNN/DNN/Transformer/CNN/RNN orchestration strategies.', 'SNN/DNN/Transformer/CNN/RNN orchestration strategies.')],
  ['Diagnostics', loc('LiveMonitor, plasticity, synaptic metrics, neuronal dynamics.', 'LiveMonitor, plasticity, synaptic metrics, neuronal dynamics.')],
  ['Balansis ACT', loc('Компенсированная арифметика для аудита весов и энергии.', 'Compensated arithmetic for auditing weights and energy.')],
]

export const magicBrainRoadmap = ['TextBrain', 'Genome', 'NeuroGenesis', 'Digital Twin', 'Hybrid', 'Diagnostics', 'Balansis']
