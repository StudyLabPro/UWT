export type Tab = 'home' | 'examples' | 'act' | 'bridge' | 'magicbrain' | 'donate' | 'monograph'

export const tabPaths: Record<Tab, string> = {
  home: '/',
  examples: '/examples',
  act: '/act',
  bridge: '/bridge',
  magicbrain: '/magicbrain',
  donate: '/donate',
  monograph: '/monograph',
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
