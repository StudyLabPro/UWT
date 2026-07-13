#!/usr/bin/env node
/**
 * Пост-билд пререндер для SEO: для каждого SPA-маршрута создаёт
 * dist/<route>/index.html — копию собранного index.html с правильными
 * title/description/canonical/OG и видимым <noscript>-описанием раздела.
 *
 * ВНИМАНИЕ: таблица маршрутов дублирует src/data/navigation.ts (RU-вариант,
 * канонический для краулеров). При изменении навигации обновить и здесь.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const siteUrl = 'https://uwt.xteam.pro'

const routes = [
  {
    path: '/examples',
    title: 'UWT Мини-вселенные',
    description:
      'Набор интерактивных визуализаторов в UWT: реляционные модели материи, электрона, ДНК и волновой функции с управлением параметров и демонстрацией вычислительных эффектов.',
  },
  {
    path: '/act',
    title: 'UWT · АКТ / Balansis',
    description:
      'Практика компенсационной точной арифметики и теории АКТ в связке с Unified Whole Theory: связь теории, устойчивости и вычислительных моделей.',
  },
  {
    path: '/bridge',
    title: 'UWT · Связь АКТ и UWT',
    description:
      'Мост между АКТ / Balansis и Unified Whole Theory: единый взгляд на компенсацию, отношения и реляционные модели для единой теоретической рамки.',
  },
  {
    path: '/magicbrain',
    title: 'MagicBrain в контексте UWT',
    description:
      'Как MetaBrain и архитектура MAGIC интегрируются с Unified Whole Theory: визуализация связей, идеи когнитивного слоя и взаимосвязи с реляционными моделями.',
  },
  {
    path: '/donate',
    title: 'Поддержать проект UWT',
    description:
      'Поддержите развитие атласа Unified Whole Theory: развитие визуализаторов, монографии и научно-исследовательской инфраструктуры проекта.',
  },
  {
    path: '/monograph',
    title: 'Монография Unified Whole Theory',
    description:
      'Полный текст и структура монографии Теории Единого Целого на сайте UWT: формулы, определения и связки с визуальными моделями.',
  },
]

const escapeHtml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const setMetaContent = (html, pattern, replacement) => {
  if (!pattern.test(html)) {
    throw new Error(`prerender: pattern not found: ${pattern}`)
  }
  return html.replace(pattern, replacement)
}

const template = readFileSync(join(distDir, 'index.html'), 'utf8')

for (const route of routes) {
  const canonical = `${siteUrl}${route.path}`
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)
  let html = template

  html = setMetaContent(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`)
  html = setMetaContent(
    html,
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${description}$2`,
  )
  html = setMetaContent(html, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`)
  html = setMetaContent(html, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${description}$2`)
  html = setMetaContent(html, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${canonical}$2`)
  html = setMetaContent(html, /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`)
  html = setMetaContent(html, /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${description}$2`)
  html = setMetaContent(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
  html = setMetaContent(html, /(<link rel="alternate" hreflang="ru" href=")[^"]*(")/, `$1${canonical}$2`)

  const noscript = `<noscript><section style="max-width:70ch;margin:3rem auto;padding:0 1rem;font-family:sans-serif"><h1>${title}</h1><p>${description}</p><p><a href="/">Unified Whole Theory — главная</a></p></section></noscript>`
  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`)

  const outDir = join(distDir, route.path.slice(1))
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  console.log(`prerendered ${route.path} -> dist${route.path}/index.html`)
}

console.log(`prerender: ${routes.length} routes done`)
