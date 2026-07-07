import { useState } from 'react'
import { TopNavigation } from './components/TopNavigation'
import { HomeSlides } from './components/HomeSlides'
import { ExamplesLab } from './components/ExamplesLab'
import { ActBalansisPage } from './components/ActBalansisPage'
import { ActUwtBridgePage } from './components/ActUwtBridgePage'
import { MagicBrainPage } from './components/MagicBrainPage'

type Tab = 'home' | 'examples' | 'act' | 'bridge' | 'magicbrain'

export default function App() {
  const [active, setActive] = useState<Tab>('home')

  return (
    <div className="appShell">
      <div className="cosmicNoise" />
      <TopNavigation active={active} onChange={setActive} />
      <main>
        {active === 'home' && <HomeSlides />}
        {active === 'examples' && <ExamplesLab />}
        {active === 'act' && <ActBalansisPage />}
        {active === 'bridge' && <ActUwtBridgePage />}
        {active === 'magicbrain' && <MagicBrainPage />}
      </main>
    </div>
  )
}
