export type Tab = 'home' | 'examples' | 'act' | 'bridge' | 'magicbrain'

export const navigationTabs: { id: Tab; label: string; caption: string }[] = [
  { id: 'home', label: 'Главная', caption: '17 слайдов' },
  { id: 'examples', label: 'Мини-вселенные', caption: 'задачи и модели' },
  { id: 'act', label: 'АКТ / Balansis', caption: 'компенсация' },
  { id: 'bridge', label: 'АКТ + UWT', caption: 'связь теорий' },
  { id: 'magicbrain', label: 'MagicBrain', caption: 'MetaBrain' },
]
