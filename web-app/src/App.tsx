import { lazy, Suspense, useEffect, useState } from 'react'
import { AppFooter } from './components/AppFooter'
import { TopNavigation } from './components/TopNavigation'
import { navigationTabs, tabFromPath, tabMetadata, tabPaths, type Tab } from './data/navigation'
import { loc, useLang, type Lang, type Localized } from './i18n/language'
import { ui } from './i18n/strings'

const HomeSlides = lazy(() => import('./components/HomeSlides').then((module) => ({ default: module.HomeSlides })))
const ExamplesLab = lazy(() => import('./components/ExamplesLab').then((module) => ({ default: module.ExamplesLab })))
const ActBalansisPage = lazy(() => import('./components/ActBalansisPage').then((module) => ({ default: module.ActBalansisPage })))
const ActUwtBridgePage = lazy(() => import('./components/ActUwtBridgePage').then((module) => ({ default: module.ActUwtBridgePage })))
const MagicBrainPage = lazy(() => import('./components/MagicBrainPage').then((module) => ({ default: module.MagicBrainPage })))
const DonationPage = lazy(() => import('./components/DonationPage').then((module) => ({ default: module.DonationPage })))
const MonographPage = lazy(() => import('./components/MonographPage').then((module) => ({ default: module.MonographPage })))

const siteUrl = 'https://uwt.xteam.pro'
const ogImage = `${siteUrl}/og-image.png`

const siteDescription: Localized = loc(
  'Интерактивный атлас Unified Whole Theory: реляционная физика, визуальные модели и монография Теории Единого Целого.',
  'The interactive Unified Whole Theory atlas: relational physics, visual models, and the Unified Whole Theory monograph.',
)

const webAppDescription: Localized = loc(
  'Интерактивная среда для изучения Unified Whole Theory: визуализаторы, реляционные модели, мосты к Balansis и монография Теории Единого Целого.',
  'An interactive environment for exploring Unified Whole Theory: visualizers, relational models, bridges to Balansis, and the monograph.',
)

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

function setLinkHref(selector: string, href: string, rel: string, hreflang?: string) {
  let link = document.querySelector<HTMLLinkElement>(selector)
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', rel)
    if (hreflang) {
      link.setAttribute('hreflang', hreflang)
    }
    document.head.appendChild(link)
  }
  link.setAttribute('rel', rel)
  if (hreflang) {
    link.setAttribute('hreflang', hreflang)
  } else {
    link.removeAttribute('hreflang')
  }
  link.setAttribute('href', href)
}

function setJsonLd(tab: Tab, lang: Lang) {
  const pickLang = <T,>(value: Localized<T>): T => value[lang]
  const meta = tabMetadata[tab]
  const title = pickLang(meta.title)
  const description = pickLang(meta.description)
  const inLanguage = lang === 'ru' ? 'ru-RU' : 'en-US'
  const canonical = `${siteUrl}${tabPaths[tab]}`
  const canonicalLink = tab === 'home' ? siteUrl : canonical
  const navTab = navigationTabs.find((item) => item.id === tab)
  const navLabel = navTab ? pickLang(navTab.label) : pickLang(loc('Главная', 'Home'))
  const isMonograph = tab === 'monograph'
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: pickLang(loc('Главная', 'Home')),
      item: siteUrl,
    },
  ]
  if (tab !== 'home') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: navLabel,
      item: canonical,
    })
  }

  const pageSchemaType = isMonograph ? 'ScholarlyArticle' : 'WebPage'
  const pageSchema: Record<string, unknown> = {
    '@type': pageSchemaType,
    '@id': `${canonicalLink}#webpage`,
    name: title,
    headline: title,
    description,
    url: canonical,
    inLanguage,
    isPartOf: {
      '@id': `${siteUrl}/#website`,
    },
    primaryImageOfPage: ogImage,
    breadcrumb: {
      '@id': `${canonical}#breadcrumb`,
    },
  }

  if (isMonograph) {
    pageSchema.articleBody = description
    pageSchema.genre = pickLang(loc('Научная статья', 'Scholarly article'))
  }

  const webSite = {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: 'Unified Whole Theory',
    alternateName: ['UWT', 'Теория Единого Целого', 'ТЕЦ'],
    url: siteUrl,
    inLanguage,
    description: pickLang(siteDescription),
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
  }

  const organization = {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'UWT Project',
    url: siteUrl,
    logo: `${siteUrl}/favicon.svg`,
    sameAs: ['https://github.com/AndrewHakmi/UWT'],
  }

  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: breadcrumbItems,
  }

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
        organization,
        webSite,
        pageSchema,
        {
          '@type': 'WebApplication',
          '@id': `${siteUrl}/#webapp`,
          name: 'Unified Whole Theory Explorer',
          url: siteUrl,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Any',
          inLanguage,
          isAccessibleForFree: true,
          description: pickLang(webAppDescription),
          image: ogImage,
          creator: {
            '@id': `${siteUrl}/#organization`,
          },
        },
        breadcrumbList,
        {
          '@type': 'ItemList',
          '@id': `${siteUrl}/#uwt-content-index`,
          name: pickLang(loc('Разделы UWT', 'UWT sections')),
          itemListElement: navigationTabs.map((navItem, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: pickLang(navItem.label),
            item: tabPaths[navItem.id] === '/' ? siteUrl : `${siteUrl}${tabPaths[navItem.id]}`,
          })),
        },
      ],
    },
    null,
    2,
  )
}

export default function App() {
  const { lang, t } = useLang()
  const [active, setActive] = useState<Tab>(() => getCurrentTab())

  useEffect(() => {
    const applySeo = () => {
      const tab = getCurrentTab()
      setActive(tab)

      const meta = tabMetadata[tab]
      const canonical = `${siteUrl}${tabPaths[tab]}`
      const title = t(meta.title)
      const description = t(meta.description)

      document.title = title
      setMetaName('description', description)
      setMetaName('keywords', t(meta.keywords).join(', '))
      setMetaProperty('og:title', title)
      setMetaProperty('og:description', description)
      setMetaProperty('og:url', canonical)
      setMetaProperty('og:image', ogImage)
      setMetaProperty('og:image:alt', title)
      setMetaProperty('og:locale', lang === 'ru' ? 'ru_RU' : 'en_US')
      setMetaName('twitter:title', title)
      setMetaName('twitter:description', description)
      setMetaName('twitter:image', ogImage)
      setMetaName('twitter:image:alt', title)
      setMetaName('twitter:card', 'summary_large_image')
      setLinkHref('link[rel="canonical"]', canonical, 'canonical')
      setLinkHref('link[rel="alternate"][hreflang="ru"]', canonical, 'alternate', 'ru')
      setLinkHref('link[rel="alternate"][hreflang="x-default"]', siteUrl, 'alternate', 'x-default')
      setJsonLd(tab, lang)
    }

    applySeo()
    window.addEventListener('popstate', applySeo)

    return () => window.removeEventListener('popstate', applySeo)
  }, [lang, t])

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
        <Suspense fallback={<div className="page pageLoader glass">{t(ui.loader)}</div>}>
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
