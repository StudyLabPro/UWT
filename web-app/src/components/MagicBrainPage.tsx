import { useMemo, useState } from 'react'
import { magicBrainDemos, magicBrainModules, magicBrainRoadmap, type MagicBrainDemoId } from '../data/magicbrainDemos'
import { useLang } from '../i18n/language'
import { BrowserPythonRunner } from './BrowserPythonRunner'
import { MagicBrainSimulation } from './MagicBrainSimulation'

export function MagicBrainPage() {
  const { t } = useLang()
  const [activeDemo, setActiveDemo] = useState<MagicBrainDemoId>('textbrain')
  const demo = useMemo(() => magicBrainDemos.find((item) => item.id === activeDemo) || magicBrainDemos[0], [activeDemo])

  return (
    <section className="page magicBrainPage">
      <div className="magicHero glass">
        <div>
          <p className="kicker">MagicBrain Platform</p>
          <h1>MetaBrain-платформа для живой AGI-памяти</h1>
          <p>Отдельная лаборатория MagicBrain: SNN-память, genome-кодирование, NeuroGenesis, цифровые двойники, гибридная оркестрация, диагностика и Balansis ACT-арифметика.</p>
        </div>
        <div className="magicStack">
          {magicBrainRoadmap.map((item, index) => <span key={item} style={{ '--i': index } as React.CSSProperties}>{item}</span>)}
        </div>
      </div>

      <div className="magicModuleGrid">
        {magicBrainModules.map(([title, text]) => <article key={title} className="magicModuleCard glass"><h3>{title}</h3><p>{t(text)}</p></article>)}
      </div>

      <MagicBrainSimulation />

      <section className="magicDemoLab glass">
        <div className="sectionHeader compact">
          <p className="kicker">Исполнимые демонстрации</p>
          <h2>Возможности платформы MagicBrain</h2>
          <p>Каждая демонстрация запускается прямо в браузере. Некоторые модули могут требовать расширенные зависимости — в таких случаях код показывает безопасный fallback и смысл API.</p>
        </div>

        <div className="taskTabs magicDemoTabs">
          {magicBrainDemos.map((item) => <button key={item.id} className={activeDemo === item.id ? 'taskTab active' : 'taskTab'} onClick={() => setActiveDemo(item.id)}>{item.title}</button>)}
        </div>

        <article className="taskWorkspace">
          <div className="taskBrief">
            <h3>{demo.title}</h3>
            <p>{t(demo.caption)}</p>
          </div>
          <pre className="codeBlock"><code>{demo.code}</code></pre>
          <BrowserPythonRunner code={demo.code} needsMagicBrain={demo.needsMagicBrain} needsBalansis={demo.needsBalansis} />
        </article>
      </section>
    </section>
  )
}
