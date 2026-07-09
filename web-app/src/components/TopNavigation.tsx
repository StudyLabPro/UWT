import { navigationTabs, type Tab } from '../data/navigation'

export function TopNavigation({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brandMark">U</span>
        <div>
          <strong>Unified Whole Theory</strong>
          <small>ТЕЦ · цифровой атлас</small>
        </div>
      </div>
      <nav className="tabs" aria-label="Основные вкладки">
        {navigationTabs.map((tab) => (
          <button key={tab.id} className={active === tab.id ? 'tab active' : 'tab'} onClick={() => onChange(tab.id)}>
            <span>{tab.label}</span>
            <small>{tab.caption}</small>
          </button>
        ))}
      </nav>
    </header>
  )
}
