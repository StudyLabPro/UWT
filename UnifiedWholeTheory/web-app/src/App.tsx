import { lazy, Suspense, useState } from 'react'
import { TopNavigation } from './components/TopNavigation'
import type { Tab } from './data/navigation'

const HomeSlides = lazy(() => import('./components/HomeSlides').then((module) => ({ default: module.HomeSlides })))
const ExamplesLab = lazy(() => import('./components/ExamplesLab').then((module) => ({ default: module.ExamplesLab })))
const ActBalansisPage = lazy(() => import('./components/ActBalansisPage').then((module) => ({ default: module.ActBalansisPage })))
const ActUwtBridgePage = lazy(() => import('./components/ActUwtBridgePage').then((module) => ({ default: module.ActUwtBridgePage })))
const MagicBrainPage = lazy(() => import('./components/MagicBrainPage').then((module) => ({ default: module.MagicBrainPage })))

export default function App() {
  const [active, setActive] = useState<Tab>('home')

  return (
    <div className="appShell">
      <div className="cosmicNoise" />
      <TopNavigation active={active} onChange={setActive} />
      <main>
        <Suspense fallback={<div className="page pageLoader glass">Загрузка раздела…</div>}>
          {active === 'home' && <HomeSlides />}
          {active === 'examples' && <ExamplesLab />}
          {active === 'act' && <ActBalansisPage />}
          {active === 'bridge' && <ActUwtBridgePage />}
          {active === 'magicbrain' && <MagicBrainPage />}
        </Suspense>
      </main>
    </div>
  )
}
