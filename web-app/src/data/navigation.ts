export type Tab = 'home' | 'examples' | 'act' | 'bridge' | 'magicbrain' | 'donate' | 'monograph'

export type TabMeta = {
  id: Tab
  title: string
  description: string
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
    title: 'Unified Whole Theory · Пролог к реляционной физике',
    description:
      'Атлас Unified Whole Theory (UWT): реляционная физика, вывод пространства и времени, отношения и устойчивость, визуальные демонстрации и базовые тезисы Теории Единого Целого.',
  },
  examples: {
    id: 'examples',
    title: 'UWT Мини-вселенные',
    description:
      'Набор интерактивных визуализаторов в UWT: реляционные модели материи, электрона, ДНК и волновой функции с управлением параметров и демонстрацией вычислительных эффектов.',
  },
  act: {
    id: 'act',
    title: 'UWT · АКТ / Balansis',
    description:
      'Практика компенсационной точной арифметики и теории АКТ в связке с Unified Whole Theory: связь теории, устойчивости и вычислительных моделей.',
  },
  bridge: {
    id: 'bridge',
    title: 'UWT · Связь АКТ и UWT',
    description:
      'Мост между АКТ / Balansis и Unified Whole Theory: единый взгляд на компенсацию, отношения и реляционные модели для единой теоретической рамки.',
  },
  magicbrain: {
    id: 'magicbrain',
    title: 'MagicBrain в контексте UWT',
    description:
      'Как MetaBrain и архитектура MAGIC интегрируются с Unified Whole Theory: визуализация связей, идеи когнитивного слоя и взаимосвязи с реляционными моделями.',
  },
  donate: {
    id: 'donate',
    title: 'Поддержать проект UWT',
    description:
      'Поддержите развитие атласа Unified Whole Theory: развитие визуализаторов, монографии и научно-исследовательской инфраструктуры проекта.',
  },
  monograph: {
    id: 'monograph',
    title: 'Монография Unified Whole Theory',
    description:
      'Полный текст и структура монографии Теории Единого Целого на сайте UWT: формулы, определения, определения и связки с визуальными моделями.',
  },
}

export function tabFromPath(pathname: string): Tab {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  const matchedEntry = Object.entries(tabPaths).find(([, path]) => path === normalizedPath)

  return matchedEntry ? (matchedEntry[0] as Tab) : 'home'
}

export const navigationTabs: { id: Tab; label: string; caption: string }[] = [
  { id: 'home', label: 'Главная', caption: '17 слайдов' },
  { id: 'examples', label: 'Мини-вселенные', caption: 'задачи и модели' },
  { id: 'act', label: 'АКТ / Balansis', caption: 'компенсация' },
  { id: 'bridge', label: 'АКТ + UWT', caption: 'связь теорий' },
  { id: 'magicbrain', label: 'MagicBrain', caption: 'MetaBrain' },
  { id: 'donate', label: 'Поддержать', caption: 'донат UWT' },
  { id: 'monograph', label: 'Монография', caption: 'полный LaTeX' },
]
