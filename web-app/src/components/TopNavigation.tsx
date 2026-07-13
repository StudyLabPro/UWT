import { navigationTabs, tabPaths, type Tab } from '../data/navigation'
import { useLang } from '../i18n/language'
import { ui } from '../i18n/strings'

export function TopNavigation({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const { lang, t, toggleLang } = useLang()

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
          <strong>{t(ui.brand.name)}</strong>
          <small>{t(ui.brand.tagline)}</small>
        </div>
      </div>
      <nav className="tabs" aria-label={t(ui.nav.ariaLabel)}>
        {navigationTabs.map((tab) => (
          <a
            key={tab.id}
            href={tabPaths[tab.id]}
            className={active === tab.id ? 'tab active' : 'tab'}
            onClick={(event) => handleTabClick(event, tab.id)}
            aria-current={active === tab.id ? 'page' : undefined}
          >
            <span>{t(tab.label)}</span>
            <small>{t(tab.caption)}</small>
          </a>
        ))}
        <button
          type="button"
          className="tab langToggle"
          onClick={toggleLang}
          aria-label={t(ui.nav.langToggleLabel)}
        >
          <span>{lang === 'ru' ? 'EN' : 'RU'}</span>
          <small>{lang === 'ru' ? 'English' : 'Русский'}</small>
        </button>
      </nav>
    </header>
  )
}
