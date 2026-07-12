import { navigationTabs, tabPaths, type Tab } from '../data/navigation'

export function TopNavigation({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const handleTabClick = (event: React.MouseEvent<HTMLAnchorElement>, tab: Tab) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }

    event.preventDefault()
    onChange(tab)
  }

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
          <a
            key={tab.id}
            href={tabPaths[tab.id]}
            className={active === tab.id ? 'tab active' : 'tab'}
            onClick={(event) => handleTabClick(event, tab.id)}
            aria-current={active === tab.id ? 'page' : undefined}
          >
            <span>{tab.label}</span>
            <small>{tab.caption}</small>
          </a>
        ))}
        <a
          className="tab"
          href="/ecosystem.html"
          title="Живая карта экосистемы MAGIC и стека как реляционной вселенной ТЕЦ"
        >
          <span>Экосистема</span>
          <small>стек · живой граф</small>
        </a>
      </nav>
    </header>
  )
}
