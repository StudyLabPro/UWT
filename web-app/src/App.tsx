import { lazy, Suspense, useEffect, useState } from 'react'
import { AppFooter } from './components/AppFooter'
import { TopNavigation } from './components/TopNavigation'
import { tabFromPath, tabPaths, type Tab } from './data/navigation'

const HomeSlides = lazy(() => import('./components/HomeSlides').then((module) => ({ default: module.HomeSlides })))
const ExamplesLab = lazy(() => import('./components/ExamplesLab').then((module) => ({ default: module.ExamplesLab })))
const ActBalansisPage = lazy(() => import('./components/ActBalansisPage').then((module) => ({ default: module.ActBalansisPage })))
const ActUwtBridgePage = lazy(() => import('./components/ActUwtBridgePage').then((module) => ({ default: module.ActUwtBridgePage })))
const MagicBrainPage = lazy(() => import('./components/MagicBrainPage').then((module) => ({ default: module.MagicBrainPage })))
const DonationPage = lazy(() => import('./components/DonationPage').then((module) => ({ default: module.DonationPage })))
const MonographPage = lazy(() => import('./components/MonographPage').then((module) => ({ default: module.MonographPage })))

function getCurrentTab() {
  return tabFromPath(window.location.pathname)
}

export default function App() {
  const [active, setActive] = useState<Tab>(() => getCurrentTab())

  useEffect(() => {
    const handlePopState = () => setActive(getCurrentTab())

    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleTabChange = (tab: Tab) => {
    setActive(tab)

    const nextPath = tabPaths[tab]
    if (window.location.pathname !== nextPath || window.location.search) {
      window.history.pushState({}, '', nextPath)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="appShell">
      <div className="cosmicNoise" />
      <TopNavigation active={active} onChange={handleTabChange} />
      <main>
        <Suspense fallback={<div className="page pageLoader glass">Загрузка раздела…</div>}>
          {active === 'home' && <HomeSlides />}
          {active === 'examples' && <ExamplesLab />}
          {active === 'act' && <ActBalansisPage />}
          {active === 'bridge' && <ActUwtBridgePage />}
          {active === 'magicbrain' && <MagicBrainPage />}
          {active === 'donate' && <DonationPage />}
          {active === 'monograph' && <MonographPage />}
        </Suspense>
      </main>
      <AppFooter />
    </div>
  )
}
