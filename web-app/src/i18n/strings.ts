import { loc, type Localized } from './language'

/**
 * Static UI chrome strings (navigation, footer, loaders, common labels) that are not
 * tied to a specific content data file. Page-specific long-form content lives next to
 * its data (see src/data/*.ts) as Localized fields.
 */
export const ui = {
  brand: {
    name: loc('Unified Whole Theory', 'Unified Whole Theory'),
    tagline: loc('ТЕЦ · цифровой атлас', 'UWT · digital atlas'),
  },
  nav: {
    ariaLabel: loc('Основные вкладки', 'Main sections'),
    ecosystemLabel: loc('Экосистема', 'Ecosystem'),
    ecosystemCaption: loc('стек · живой граф', 'stack · live graph'),
    ecosystemTitle: loc(
      'Живая карта экосистемы MAGIC и стека как реляционной вселенной ТЕЦ',
      'Live map of the MAGIC ecosystem and stack as a UWT relational universe',
    ),
    langToggleLabel: loc('Переключить язык на английский', 'Switch language to Russian'),
  },
  loader: loc('Загрузка раздела…', 'Loading section…'),
  footer: {
    kicker: loc('Open research · GitHub', 'Open research · GitHub'),
    title: loc('UWT открыт для чтения, проверки и форков', 'UWT is open to read, verify, and fork'),
    intro: loc(
      'Вся публичная часть проекта собрана в GitHub: фронтенд, модельные эксперименты, теория и лицензирование. Ссылки открываются в новой вкладке, чтобы не сбивать текущую навигацию по атласу.',
      'The entire public side of the project lives on GitHub: the frontend, modeling experiments, theory, and licensing. Links open in a new tab so they do not disrupt navigation through the atlas.',
    ),
    linksAriaLabel: loc('Ссылки UWT на GitHub', 'UWT links on GitHub'),
    contactsKicker: loc('Контакты и цитирование', 'Contact & citation'),
    contactsTitle: loc('Написать или сослаться на проект', 'Get in touch or cite the project'),
    contactEmailLabel: loc('Почта проекта', 'Project email'),
    citationTitle: loc('Как цитировать', 'How to cite'),
    citationIntro: loc(
      'Библиографическая запись сформирована из CITATION.cff в корне репозитория.',
      'The bibliographic record is generated from CITATION.cff at the repository root.',
    ),
    citationCopy: loc('Скопировать цитату', 'Copy citation'),
    citationCopied: loc('Скопировано ✓', 'Copied ✓'),
    licensingKicker: loc('Лицензии', 'Licensing'),
    licenseLabel: loc('LICENSE (AGPL-3.0)', 'LICENSE (AGPL-3.0)'),
    licenseDescription: loc(
      'Открытая копилефт-лицензия для некоммерческого и открытого использования.',
      'Open copyleft license for non-commercial and open-source use.',
    ),
    licensingLabel: loc('LICENSING.md', 'LICENSING.md'),
    licensingDescription: loc(
      'Правила выбора лицензии и условия коммерческого использования.',
      'License-selection guide and terms for commercial use.',
    ),
    backToTop: loc('Наверх ↑', 'Back to top ↑'),
  },
  monograph: {
    enNotice: loc(
      'Монография пока доступна только на русском языке; перевод на английский планируется.',
      'The monograph is currently available in Russian; an English translation is planned.',
    ),
  },
} as const

export type UiStrings = typeof ui

/** Convenience: pull the citation links block (GitHub repo, web-app, modeling, theory). */
export const footerGithubLinks: { label: Localized; description: Localized; href: string }[] = [
  {
    label: loc('Репозиторий', 'Repository'),
    description: loc('Исходный код UWT, лицензии и история изменений.', 'UWT source code, licenses, and change history.'),
    href: 'https://github.com/AndrewHakmi/UWT',
  },
  {
    label: loc('Web app', 'Web app'),
    description: loc('React/Vite фронтенд этого цифрового атласа.', 'The React/Vite frontend behind this digital atlas.'),
    href: 'https://github.com/AndrewHakmi/UWT/tree/main/web-app',
  },
  {
    label: loc('Modeling', 'Modeling'),
    description: loc('Вычислительные модели, тесты и эксперименты.', 'Computational models, tests, and experiments.'),
    href: 'https://github.com/AndrewHakmi/UWT/tree/main/modeling',
  },
  {
    label: loc('Theory', 'Theory'),
    description: loc('Монография, LaTeX-источники и PDF-сборки.', 'The monograph, LaTeX sources, and PDF builds.'),
    href: 'https://github.com/AndrewHakmi/UWT/tree/main/theory',
  },
]
