import { loc, type Localized } from '../i18n/language'

export type Tab = 'home' | 'examples' | 'act' | 'bridge' | 'magicbrain' | 'donate' | 'monograph'

export type TabMeta = {
  id: Tab
  title: Localized
  description: Localized
  keywords: Localized<string[]>
}

export const tabPaths: Record<Tab, string> = {
  home: '/',
  examples: '/examples',
  act: '/act',
  bridge: '/bridge',
  magicbrain: '/magicbrain',
  donate: '/donate',
  monograph: '/monograph',
}

export const tabMetadata: Record<Tab, TabMeta> = {
  home: {
    id: 'home',
    title: loc(
      'Unified Whole Theory · Пролог к реляционной физике',
      'Unified Whole Theory · A prologue to relational physics',
    ),
    description: loc(
      'Атлас Unified Whole Theory (UWT): реляционная физика, вывод пространства и времени, отношения и устойчивость, визуальные демонстрации и базовые тезисы Теории Единого Целого.',
      'The Unified Whole Theory (UWT) atlas: relational physics, the derivation of space and time, relations and stability, visual demonstrations, and the core theses of the Unified Whole Theory.',
    ),
    keywords: loc(
      ['Unified Whole Theory', 'реляционная физика', 'пространство и время', 'теория единого целого', 'интерактивный атлас'],
      ['Unified Whole Theory', 'relational physics', 'space and time', 'unified whole theory', 'interactive atlas'],
    ),
  },
  examples: {
    id: 'examples',
    title: loc('UWT Мини-вселенные', 'UWT Mini-universes'),
    description: loc(
      'Набор интерактивных визуализаторов в UWT: реляционные модели материи, электрона, ДНК и волновой функции с управлением параметров и демонстрацией вычислительных эффектов.',
      'A set of interactive UWT visualizers: relational models of matter, the electron, DNA, and the wave function, with parameter controls and demonstrations of computational effects.',
    ),
    keywords: loc(
      ['интерактивные визуализаторы', 'мини-вселенные', 'миниатюрная модель материи', 'реляционные модели', 'интерактивная физика'],
      ['interactive visualizers', 'mini-universes', 'miniature matter model', 'relational models', 'interactive physics'],
    ),
  },
  act: {
    id: 'act',
    title: loc('UWT · АКТ / Balansis', 'UWT · ACT / Balansis'),
    description: loc(
      'Практика компенсационной точной арифметики и теории АКТ в связке с Unified Whole Theory: связь теории, устойчивости и вычислительных моделей.',
      'Absolute Compensation Theory (ACT) and compensated arithmetic in practice, paired with Unified Whole Theory: the link between theory, stability, and computational models.',
    ),
    keywords: loc(
      ['АКТ', 'Balansis', 'компенсационная арифметика', 'устойчивые вычисления', 'методы численной проверки', 'UWT'],
      ['ACT', 'Balansis', 'compensated arithmetic', 'stable computation', 'numerical verification methods', 'UWT'],
    ),
  },
  bridge: {
    id: 'bridge',
    title: loc('UWT · Связь АКТ и UWT', 'UWT · The ACT-UWT bridge'),
    description: loc(
      'Мост между АКТ / Balansis и Unified Whole Theory: единый взгляд на компенсацию, отношения и реляционные модели для единой теоретической рамки.',
      'A bridge between ACT / Balansis and Unified Whole Theory: a unified view of compensation, relations, and relational models within a single theoretical frame.',
    ),
    keywords: loc(
      ['связь ACT и UWT', 'методологии расчета', 'компенсация ошибок', 'реляционные модели', 'физическая теория'],
      ['ACT-UWT bridge', 'computation methodology', 'error compensation', 'relational models', 'physical theory'],
    ),
  },
  magicbrain: {
    id: 'magicbrain',
    title: loc('MagicBrain в контексте UWT', 'MagicBrain in the context of UWT'),
    description: loc(
      'Как MetaBrain и архитектура MAGIC интегрируются с Unified Whole Theory: визуализация связей, идеи когнитивного слоя и взаимосвязи с реляционными моделями.',
      'How MetaBrain and the MAGIC architecture integrate with Unified Whole Theory: visualizing the connections, the ideas behind the cognitive layer, and the ties to relational models.',
    ),
    keywords: loc(
      ['MagicBrain', 'нейросетевые модели', 'когнитивный слой', 'рефлексивный интеллект', 'связь с UWT'],
      ['MagicBrain', 'neural network models', 'cognitive layer', 'reflective intelligence', 'connection to UWT'],
    ),
  },
  donate: {
    id: 'donate',
    title: loc('Поддержать проект UWT', 'Support the UWT project'),
    description: loc(
      'Поддержите развитие атласа Unified Whole Theory: развитие визуализаторов, монографии и научно-исследовательской инфраструктуры проекта.',
      'Support the development of the Unified Whole Theory atlas: the visualizers, the monograph, and the project’s research infrastructure.',
    ),
    keywords: loc(
      ['поддержать UWT', 'донат', 'развитие проекта', 'научная визуализация', 'исследовательская инфраструктура'],
      ['support UWT', 'donate', 'project development', 'scientific visualization', 'research infrastructure'],
    ),
  },
  monograph: {
    id: 'monograph',
    title: loc('Монография Unified Whole Theory', 'The Unified Whole Theory monograph'),
    description: loc(
      'Полный текст и структура монографии Теории Единого Целого на сайте UWT: формулы, определения, определения и связки с визуальными моделями.',
      'The full text and structure of the Unified Whole Theory monograph on the UWT site: formulas, definitions, and links to the visual models.',
    ),
    keywords: loc(
      ['монография Unified Whole Theory', 'ТЕЦ', 'теория единого целого', 'научная публикация', 'формулы и определения'],
      ['Unified Whole Theory monograph', 'UWT', 'unified whole theory', 'scientific publication', 'formulas and definitions'],
    ),
  },
}

export function tabFromPath(pathname: string): Tab {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const matchedEntry = Object.entries(tabPaths).find(([, path]) => path === normalizedPath)

  return matchedEntry ? (matchedEntry[0] as Tab) : 'home'
}

export const navigationTabs: { id: Tab; label: Localized; caption: Localized }[] = [
  { id: 'home', label: loc('Главная', 'Home'), caption: loc('17 слайдов', '17 slides') },
  { id: 'examples', label: loc('Мини-вселенные', 'Mini-universes'), caption: loc('задачи и модели', 'tasks and models') },
  { id: 'act', label: loc('АКТ / Balansis', 'ACT / Balansis'), caption: loc('компенсация', 'compensation') },
  { id: 'bridge', label: loc('АКТ + UWT', 'ACT + UWT'), caption: loc('связь теорий', 'the bridge') },
  { id: 'magicbrain', label: loc('MagicBrain', 'MagicBrain'), caption: loc('MetaBrain', 'MetaBrain') },
  { id: 'donate', label: loc('Поддержать', 'Support'), caption: loc('донат UWT', 'donate to UWT') },
  { id: 'monograph', label: loc('Монография', 'Monograph'), caption: loc('полный LaTeX', 'full LaTeX text') },
]

/** Client-side SPA navigation: push a new path and let App's popstate listener re-render + re-apply SEO. */
export function navigateToTab(tab: Tab) {
  const nextPath = tabPaths[tab]
  if (window.location.pathname !== nextPath || window.location.search) {
    window.history.pushState({}, '', nextPath)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
