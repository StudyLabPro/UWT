import { lazy, Suspense, useEffect, useState } from 'react'
import { AppFooter } from './components/AppFooter'
import { TopNavigation } from './components/TopNavigation'
import { tabFromPath, tabMetadata, tabPaths, type Tab } from './data/navigation'

const HomeSlides = lazy(() => import('./components/HomeSlides').then((module) => ({ default: module.HomeSlides })))
const ExamplesLab = lazy(() => import('./components/ExamplesLab').then((module) => ({ default: module.ExamplesLab })))
const ActBalansisPage = lazy(() => import('./components/ActBalansisPage').then((module) => ({ default: module.ActBalansisPage })))
const ActUwtBridgePage = lazy(() => import('./components/ActUwtBridgePage').then((module) => ({ default: module.ActUwtBridgePage })))
const MagicBrainPage = lazy(() => import('./components/MagicBrainPage').then((module) => ({ default: module.MagicBrainPage })))
const DonationPage = lazy(() => import('./components/DonationPage').then((module) => ({ default: module.DonationPage })))
const MonographPage = lazy(() => import('./components/MonographPage').then((module) => ({ default: module.MonographPage })))

const siteUrl = 'https://uwt.xteam.pro'

function getCurrentTab() {
  return tabFromPath(window.location.pathname)
}

function setMetaName(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function setMetaProperty(property: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('property', property)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function setLinkHref(selector: string, href: string) {
  let link = document.querySelector<HTMLLinkElement>(selector)
  if (!link) {
    link = document.createElement('link')
    if (selector.includes('alternate')) {
      link.setAttribute('rel', 'alternate')
      link.setAttribute('hreflang', 'ru')
    } else {
      link.setAttribute('rel', 'canonical')
    }
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function setJsonLd(tab: Tab) {
  const meta = tabMetadata[tab]
  const canonical = `${siteUrl}${tabPaths[tab]}`
  let script = document.getElementById('seo-jsonld') as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = 'seo-jsonld'
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: 'UWT Project',
          url: siteUrl,
          sameAs: ['https://github.com/AndrewHakmi/UWT'],
        },
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          name: 'Unified Whole Theory',
          alternateName: ['UWT', 'Теория Единого Целого', 'ТЕЦ'],
          url: siteUrl,
          inLanguage: 'ru-RU',
          publisher: {
            '@id': `${siteUrl}/#organization`,
          },
        },
        {
          '@type': 'WebPage',
          '@id': `${canonical}#webpage`,
          name: meta.title,
          description: meta.description,
          url: canonical,
          inLanguage: 'ru-RU',
          isPartOf: {
            '@id': `${siteUrl}/#website`,
          },
          publisher: {
            '@id': `${siteUrl}/#organization`,
          },
          about: {
            '@type': 'Thing',
            name: 'Unified Whole Theory',
          },
        },
      ],
    },
    null,
    2,
  )
}

export default function App() {
  const [active, setActive] = useState<Tab>(() => getCurrentTab())

  useEffect(() => {
    const applySeo = () => {
      const tab = getCurrentTab()
      setActive(tab)

      const meta = tabMetadata[tab]
      const canonical = `${siteUrl}${tabPaths[tab]}`

      document.title = meta.title
      setMetaName('description', meta.description)
      setMetaProperty('og:title', meta.title)
      setMetaProperty('og:description', meta.description)
      setMetaProperty('og:url', canonical)
      setMetaName('twitter:title', meta.title)
      setMetaName('twitter:description', meta.description)
      setLinkHref('link[rel="canonical"]', canonical)
      setLinkHref('link[rel="alternate"][hreflang="ru"]', canonical)
      setJsonLd(tab)
    }

    applySeo()
    window.addEventListener('popstate', applySeo)

    return () => window.removeEventListener('popstate', applySeo)
  }, [])

  const handleTabChange = (tab: Tab) => {
    setActive(tab)

    const nextPath = tabPaths[tab]
    if (window.location.pathname !== nextPath || window.location.search) {
      window.history.pushState({}, '', nextPath)
      const event = new PopStateEvent('popstate')
      window.dispatchEvent(event)
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
