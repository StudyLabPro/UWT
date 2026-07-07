type Tab = 'home' | 'examples' | 'act' | 'bridge' | 'magicbrain'

const tabs: { id: Tab; label: string; caption: string }[] = [
  { id: 'home', label: 'Главная', caption: '17 слайдов' },
  { id: 'examples', label: 'Мини-вселенные', caption: 'задачи и модели' },
  { id: 'act', label: 'АКТ / Balansis', caption: 'компенсация' },
  { id: 'bridge', label: 'АКТ + UWT', caption: 'связь теорий' },
  { id: 'magicbrain', label: 'MagicBrain', caption: 'MetaBrain' },
]

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
        {tabs.map((tab) => (
          <button key={tab.id} className={active === tab.id ? 'tab active' : 'tab'} onClick={() => onChange(tab.id)}>
            <span>{tab.label}</span>
            <small>{tab.caption}</small>
          </button>
        ))}
      </nav>
    </header>
  )
}
