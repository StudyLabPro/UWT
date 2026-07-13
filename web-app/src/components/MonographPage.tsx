import { useMemo, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import monographSource from '../../../theory/unified_whole_theory_full.tex?raw'

type MonographNode =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'formula'; latex: string }
  | { type: 'listItem'; text: string }
  | { type: 'blockTitle'; label: string; title: string }
  | { type: 'table'; rows: string[][] }

type SymbolInfo = {
  latex: string
  plain: string
  meaning: string
  aliases?: string[]
}

type MonographChapter = {
  title: string
  nodes: MonographNode[]
  formulaCount: number
}

const symbolGlossary: SymbolInfo[] = [
  { latex: 'U', plain: 'U', aliases: ['\\Whole'], meaning: 'Единое Целое, абсолютная целостность системы.' },
  { latex: '\\mathcal A', plain: 'A', aliases: ['\\Parts'], meaning: 'множество или семейство различимых частей Единого Целого.' },
  { latex: '\\mathcal B', plain: 'B', aliases: ['\\SubParts'], meaning: 'выбранная подсистема частей, для которой описывается состояние.' },
  { latex: 'A_i,A_j,A_k', plain: 'A_i', meaning: 'отдельные части системы; индексы различают элементы.' },
  { latex: 'R', plain: 'R', aliases: ['\\Rel'], meaning: 'отношение между частями, принимающее значение в структуре V.' },
  { latex: 'V', plain: 'V', aliases: ['\\Values'], meaning: 'множество значений отношений.' },
  { latex: '\\mathbf V', plain: 'mathbf V', aliases: ['\\Vstruct'], meaning: 'структура значений отношений: группа, порядок и норма.' },
  { latex: 'S', plain: 'S', aliases: ['\\State'], meaning: 'состояние подсистемы как совокупность отношений между ее частями.' },
  { latex: '\\mathcal S', plain: 'mathcal S', aliases: ['\\States'], meaning: 'пространство возможных состояний.' },
  { latex: '\\sqsubseteq', plain: 'sqsubseteq', aliases: ['\\PartOf'], meaning: 'отношение "быть частью или совпадать с целым".' },
  { latex: '\\sqsubset', plain: 'sqsubset', aliases: ['\\PropPart'], meaning: 'строгое отношение части к целому.' },
  { latex: '\\circ', plain: 'circ', aliases: ['\\comp'], meaning: 'композиция значений отношений.' },
  { latex: 'e', plain: 'e', aliases: ['\\ide'], meaning: 'нейтральный элемент композиции.' },
  { latex: '\\preceq', plain: 'preceq', aliases: ['\\Vord'], meaning: 'порядок на значениях отношений.' },
  { latex: '\\rho', plain: 'rho', aliases: ['\\norm'], meaning: 'норма значения отношения, переводящая его в неотрицательную числовую меру.' },
  { latex: '\\mathsf{Disc}', plain: 'Disc', aliases: ['\\Disc'], meaning: 'различимость частей.' },
  { latex: '\\mathsf{Space}', plain: 'Space', aliases: ['\\Space'], meaning: 'пространство как производная структура отношений.' },
  { latex: '\\mathsf{Time}', plain: 'Time', aliases: ['\\Time'], meaning: 'время как структура изменения состояний.' },
  { latex: '\\mathsf{Physics}', plain: 'Physics', aliases: ['\\Physics'], meaning: 'физический слой, выводимый из отношений, состояний, пространства и времени.' },
  { latex: '\\mathsf{Motion}', plain: 'Motion', aliases: ['\\Motion'], meaning: 'движение как изменение отношения.' },
  { latex: '\\mathsf{Obs}', plain: 'Obs', aliases: ['\\Observer'], meaning: 'наблюдатель, описывающий систему относительно выбранной части.' },
  { latex: '\\operatorname{Center}', plain: 'Center', aliases: ['\\Center'], meaning: 'центр описания, не обязательно геометрическая точка.' },
  { latex: '\\operatorname{Var}', plain: 'Var', aliases: ['\\Varr'], meaning: 'суммарная вариативность отношений выбранной части.' },
  { latex: '\\sigma', plain: 'sigma', aliases: ['\\Stab'], meaning: 'устойчивость части, обратная вариативности.' },
  { latex: '\\mathcal C', plain: 'C', aliases: ['\\Cost'], meaning: 'функционал стоимости изменения.' },
  { latex: 'd', plain: 'd', meaning: 'реляционное расстояние, полученное из нормы отношения.' },
  { latex: '\\tau', plain: 'tau', meaning: 'мера временного различия между состояниями.' },
  { latex: '\\Omega', plain: 'Omega', meaning: 'дополнительная структура временного порядка или потока состояний.' },
  { latex: 'v', plain: 'v', meaning: 'скорость изменения реляционного расстояния.' },
  { latex: 'a', plain: 'a', meaning: 'ускорение; также произвольный элемент группы значений в аксиомах.' },
  { latex: 'm', plain: 'm', meaning: 'масса как производная величина устойчивости или кривизны стоимости.' },
  { latex: 'p', plain: 'p', meaning: 'импульс.' },
  { latex: '\\mathfrak F', plain: 'F', meaning: 'сила в реляционной механике.' },
  { latex: 'E', plain: 'E', meaning: 'полная энергия.' },
  { latex: 'K', plain: 'K', meaning: 'кинетическая часть энергии.' },
  { latex: 'P', plain: 'P', meaning: 'потенциальная часть энергии.' },
  { latex: 'L', plain: 'L', meaning: 'лагранжиан.' },
  { latex: 'H', plain: 'H', meaning: 'гамильтониан.' },
  { latex: '\\Phi', plain: 'Phi', meaning: 'потенциал, зависящий от отношения между частями.' },
  { latex: 'c', plain: 'c', meaning: 'предельная скорость изменения, заданная максимальной нормой и минимальным шагом времени.' },
]

// Макросы преамбулы .tex-файла. Разворачиваются одним проходом:
// \b не срабатывает перед "_"/цифрами (это словесные символы), а последовательные
// замены склеивали бы соседние команды (\comp\Rel -> \compR), поэтому один общий
// regex с (?![A-Za-z]) и пробел после подстановки (в math-режиме он игнорируется).
const macroDefinitions: Record<string, string> = {
  Whole: 'U',
  SubParts: '\\mathcal B',
  Parts: '\\mathcal A',
  Rel: 'R',
  Values: 'V',
  Vstruct: '\\mathbf V',
  States: '\\mathcal S',
  State: 'S',
  PartOf: '\\sqsubseteq',
  PropPart: '\\sqsubset',
  comp: '\\circ',
  Vord: '\\preceq',
  norm: '\\rho',
  ide: 'e',
  Disc: '\\mathsf{Disc}',
  Space: '\\mathsf{Space}',
  Time: '\\mathsf{Time}',
  Physics: '\\mathsf{Physics}',
  Motion: '\\mathsf{Motion}',
  Observer: '\\mathsf{Obs}',
  Struct: '\\operatorname{Struct}',
  Inv: '\\operatorname{Inv}',
  Center: '\\operatorname{Center}',
  Varr: '\\operatorname{Var}',
  Stab: '\\sigma',
  Cost: '\\mathcal C',
}

const macroPattern = new RegExp(`\\\\(${Object.keys(macroDefinitions).join('|')})(?![A-Za-z])`, 'g')

const blockLabels: Record<string, string> = {
  axiom: 'Аксиома',
  definition: 'Определение',
  postulate: 'Постулат',
  theorem: 'Теорема',
  lemma: 'Лемма',
  corollary: 'Следствие',
  proposition: 'Предложение',
  remark: 'Замечание',
  example: 'Пример',
  proof: 'Доказательство',
}

function expandMacros(value: string) {
  // Пробелы вокруг подстановки не дают ей склеиться с соседними командами
  // (например, \neq\Whole без пробела превратился бы в \neqU).
  return value.replace(macroPattern, (_, name: string) => ` ${macroDefinitions[name]} `)
}

function stripLatexCommands(value: string) {
  const inlineMath: string[] = []
  const protectedValue = value.replace(/\$([^$]+)\$/g, (_, formula: string) => {
    inlineMath.push(`$${normalizeFormula(formula)}$`)
    return `@@MATH_${inlineMath.length - 1}@@`
  })

  return expandMacros(protectedValue)
    .replace(/\\textbf\{([^{}]*)\}/g, '$1')
    .replace(/\\emph\{([^{}]*)\}/g, '$1')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\href\{([^{}]*)\}\{([^{}]*)\}/g, '$2')
    .replace(/\\label\{[^{}]*\}/g, '')
    .replace(/~?\\(?:eq)?ref\{[^{}]*\}/g, '')
    .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^{}]*\})?/g, '')
    .replace(/[{}]/g, '')
    .replace(/~+/g, ' ')
    .replace(/---/g, '—')
    .replace(/--/g, '–')
    .replace(/``|''/g, '"')
    .replace(/\\[!;:,]/g, ' ')
    .replace(/\\ /g, ' ')
    .replace(/\\,/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/@@MATH_(\d+)@@/g, (_, index: string) => inlineMath[Number(index)] ?? '')
    .trim()
}

function normalizeFormula(value: string) {
  return expandMacros(value)
    .replace(/\\notag/g, '')
    .replace(/\\label\{[^{}]*\}/g, '')
    .replace(/~?\\(?:eq)?ref\{[^{}]*\}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const subscriptMap: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  '(': '₍',
  ')': '₎',
  a: 'ₐ',
  e: 'ₑ',
  h: 'ₕ',
  i: 'ᵢ',
  j: 'ⱼ',
  k: 'ₖ',
  l: 'ₗ',
  m: 'ₘ',
  n: 'ₙ',
  o: 'ₒ',
  p: 'ₚ',
  r: 'ᵣ',
  s: 'ₛ',
  t: 'ₜ',
  u: 'ᵤ',
  v: 'ᵥ',
  x: 'ₓ',
}

const superscriptMap: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
  i: 'ⁱ',
  n: 'ⁿ',
}

function toScript(value: string, map: Record<string, string>) {
  return value
    .replace(/\\/g, '')
    .split('')
    .map((char) => map[char] ?? char)
    .join('')
}

function formatLatexForDisplay(value: string) {
  return normalizeFormula(value)
    .replace(/\\mathcal\s*\{?A\}?/g, '𝒜')
    .replace(/\\mathcal\s*\{?B\}?/g, 'ℬ')
    .replace(/\\mathcal\s*\{?C\}?/g, '𝒞')
    .replace(/\\mathcal\s*\{?S\}?/g, '𝒮')
    .replace(/\\mathbf\s*\{?V\}?/g, '𝐕')
    .replace(/\\mathbb\s*\{?R\}?/g, 'ℝ')
    .replace(/\\mathfrak\s*\{?U\}?/g, '𝔘')
    .replace(/\\mathfrak\s*\{?F\}?/g, '𝔉')
    .replace(/\\mathsf\s*\{?Disc\}?/g, 'Disc')
    .replace(/\\mathsf\s*\{?Space\}?/g, 'Space')
    .replace(/\\mathsf\s*\{?Time\}?/g, 'Time')
    .replace(/\\mathsf\s*\{?Physics\}?/g, 'Physics')
    .replace(/\\mathsf\s*\{?Motion\}?/g, 'Motion')
    .replace(/\\mathsf\s*\{?Obs\}?/g, 'Obs')
    .replace(/\\operatorname\s*\{?Struct\}?/g, 'Struct')
    .replace(/\\operatorname\s*\{?Inv\}?/g, 'Inv')
    .replace(/\\operatorname\s*\{?Center\}?/g, 'Center')
    .replace(/\\operatorname\s*\{?Var\}?/g, 'Var')
    .replace(/\\operatorname\s*\{([^{}]+)\}/g, '$1')
    .replace(/\\mathsf\s*\{([^{}]+)\}/g, '$1')
    .replace(/\\mathcal\s*\{?([A-Za-z])\}?/g, '$1')
    .replace(/\\mathbb\s*\{?([A-Za-z])\}?/g, '$1')
    .replace(/\\mathbf\s*\{?([A-Za-z])\}?/g, '$1')
    .replace(/\\mathfrak\s*\{?([A-Za-z])\}?/g, '$1')
    .replace(/\\boxed\{\\text\{([^{}]*)\}\}/g, '□ $1')
    .replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\\tfrac\{([^{}]+)\}\{([^{}]+)\}/g, '($1/$2)')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1/$2)')
    .replace(/\\bigl|\\bigr|\\left|\\right|\\,/g, '')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\tau/g, 'τ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\Phi/g, 'Φ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\ell/g, 'ℓ')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists!/g, '∃!')
    .replace(/\\exists/g, '∃')
    .replace(/\\infty/g, '∞')
    .replace(/\\mathbb/g, '')
    .replace(/\\geq?|\\ge/g, '≥')
    .replace(/\\leq?|\\le/g, '≤')
    .replace(/\\neq/g, '≠')
    .replace(/\\iff/g, '⇔')
    .replace(/\\Longleftrightarrow/g, '⟺')
    .replace(/\\Longrightarrow/g, '⟹')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftarrow/g, '⇐')
    .replace(/\\to/g, '→')
    .replace(/\\longmapsto/g, '⟼')
    .replace(/\\mapsto/g, '↦')
    .replace(/\\times/g, '×')
    .replace(/\\wedge/g, '∧')
    .replace(/\\circ/g, '∘')
    .replace(/\\preceq/g, '≼')
    .replace(/\\sqsubseteq/g, '⊑')
    .replace(/\\sqsubset/g, '⊏')
    .replace(/\\prec/g, '≺')
    .replace(/\\notin/g, '∉')
    .replace(/\\in/g, '∈')
    .replace(/\\subseteq/g, '⊆')
    .replace(/\\subset/g, '⊂')
    .replace(/\\emptyset/g, '∅')
    .replace(/\\mid/g, '|')
    .replace(/\\[!;:,]/g, ' ')
    .replace(/\\ /g, ' ')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\min/g, 'min')
    .replace(/\\max/g, 'max')
    .replace(/\\cdots/g, '⋯')
    .replace(/\\cdot/g, '·')
    .replace(/\\qquad/g, '    ')
    .replace(/\\quad/g, '  ')
    .replace(/\\\|/g, '‖')
    .replace(/\\\[/g, '')
    .replace(/\\\]/g, '')
    .replace(/\\begin\{[^{}]*\}|\\end\{[^{}]*\}/g, '')
    .replace(/\\notag/g, '')
    .replace(/&/g, '')
    .replace(/\\\\/g, '\n')
    .replace(/_\{([^{}]+)\}/g, (_, sub: string) => toScript(sub, subscriptMap))
    .replace(/\^\{([^{}]+)\}/g, (_, sup: string) => toScript(sup, superscriptMap))
    .replace(/_([A-Za-z0-9+\-=()])/g, (_, sub: string) => toScript(sub, subscriptMap))
    .replace(/\^([A-Za-z0-9+\-=()])/g, (_, sup: string) => toScript(sup, superscriptMap))
    .replace(/[{}]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function stripTextCommands(value: string) {
  return normalizeFormula(value)
    .replace(/\\boxed\{\\text\{[^{}]*\}\}/g, '')
    .replace(/\\text\{[^{}]*\}/g, '')
}

function isTextThesisFormula(value: string) {
  const normalized = normalizeFormula(value)
  const withoutText = stripTextCommands(normalized)
    .replace(/\\boxed/g, '')
    .replace(/[{}\s.,;:!?()[\]«»"'-]/g, '')

  return normalized.includes('\\text{') && withoutText.length === 0
}

function addMathToken(tokens: Set<string>, token: string) {
  const normalized = token.replace(/\s+/g, ' ').trim()
  if (normalized) tokens.add(normalized)
}

function extractMathTokens(value: string): Set<string> {
  const tokens = new Set<string>()
  let rest = stripTextCommands(value)
    .replace(/\\boxed/g, ' ')
    .replace(/\\(?:begin|end)\{[^{}]*\}/g, ' ')

  rest = rest.replace(
    /\\(mathsf|mathcal|mathbb|mathbf|mathfrak|operatorname)\s*(?:\{([^{}]+)\}|([A-Za-z]))/g,
    (_, command: string, bracedName: string | undefined, bareName: string | undefined) => {
      const name = bracedName ?? bareName ?? ''
      addMathToken(tokens, `\\${command}{${name}}`)
      addMathToken(tokens, `\\${command} ${name}`)

      if (command === 'mathsf' || command === 'operatorname') {
        addMathToken(tokens, name)
      }

      return ' '
    },
  )

  rest = rest.replace(/\\[A-Za-z]+/g, (command) => {
    addMathToken(tokens, command)
    return ' '
  })
  rest = rest.replace(/\\./g, ' ')

  rest.replace(
    /(^|[^A-Za-z\\])([A-Za-z])(?:_\{?([A-Za-z0-9]+)\}?|_([A-Za-z0-9]))?/g,
    (_, _prefix: string, name: string, bracedSubscript: string | undefined, bareSubscript: string | undefined) => {
      const subscript = bracedSubscript ?? bareSubscript
      addMathToken(tokens, name)
      if (subscript) addMathToken(tokens, `${name}_${subscript}`)
      return ''
    },
  )

  return tokens
}

function extractProbeTokens(probe: string): string[] {
  if (probe.includes(',')) {
    return probe.split(',').flatMap((part) => extractProbeTokens(part.trim()))
  }

  const tokens = Array.from(extractMathTokens(probe))
  if (probe.includes('_')) {
    const subscripted = tokens.filter((token) => token.includes('_'))
    if (subscripted.length > 0) return subscripted
  }

  return tokens
}

function containsMathToken(formulaTokens: Set<string>, symbol: SymbolInfo) {
  const probes = [symbol.latex, ...(symbol.aliases ?? [])].filter(Boolean)
  return probes.some((probe) => extractProbeTokens(probe).some((token) => formulaTokens.has(token)))
}

function parseTabular(lines: string[]): string[][] {
  const body = lines
    .join('\n')
    .replace(/\\(?:top|mid|bottom)rule/g, '')
    .replace(/\\hline/g, '')

  return body
    .split(/\\\\/)
    .map((row) => row.split('&').map((cell) => stripLatexCommands(cell)))
    .filter((row) => row.some((cell) => cell.length > 0))
}

function parseMonograph(source: string): MonographNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const nodes: MonographNode[] = []
  const paragraph: string[] = []
  let inDocument = false
  let formulaBuffer: string[] | null = null
  let formulaEnd = ''
  let tableBuffer: string[] | null = null
  let listItemBuffer: string[] | null = null

  const flushListItem = () => {
    if (!listItemBuffer) return
    const text = stripLatexCommands(listItemBuffer.join(' '))
    listItemBuffer = null
    if (text) nodes.push({ type: 'listItem', text })
  }

  const flushParagraph = () => {
    flushListItem()
    const text = stripLatexCommands(paragraph.join(' '))
    paragraph.length = 0
    if (text) nodes.push({ type: 'paragraph', text })
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/(?<!\\)%.*/, '').trim()
    if (!inDocument) {
      if (line === '\\begin{document}') inDocument = true
      continue
    }

    if (tableBuffer) {
      if (line.startsWith('\\end{tabular}')) {
        const rows = parseTabular(tableBuffer)
        if (rows.length > 0) nodes.push({ type: 'table', rows })
        tableBuffer = null
      } else {
        tableBuffer.push(line)
      }
      continue
    }

    if (line.startsWith('\\begin{tabular}')) {
      flushParagraph()
      // Спецификация колонок стоит на той же строке и в таблицу не попадает.
      tableBuffer = []
      continue
    }

    if (/^\\(begin|end)\{center\}/.test(line) || line.startsWith('\\renewcommand')) {
      flushParagraph()
      continue
    }

    if (formulaBuffer) {
      if (line.includes(formulaEnd)) {
        formulaBuffer.push(line.slice(0, line.indexOf(formulaEnd)))
        nodes.push({ type: 'formula', latex: normalizeFormula(formulaBuffer.join('\n')) })
        formulaBuffer = null
        formulaEnd = ''
      } else {
        formulaBuffer.push(line)
      }
      continue
    }

    if (!line) {
      flushParagraph()
      continue
    }

    if (line === '\\end{document}' || /^\\(frontmatter|mainmatter|backmatter|maketitle|tableofcontents)\b/.test(line)) {
      flushParagraph()
      continue
    }

    if (/^\\(addcontentsline|setcounter|geometry|hypersetup)\b/.test(line)) continue

    const heading = line.match(/^\\(chapter|section|subsection)\*?\{(.+)\}$/)
    if (heading) {
      flushParagraph()
      nodes.push({
        type: 'heading',
        level: heading[1] === 'chapter' ? 1 : heading[1] === 'section' ? 2 : 3,
        text: stripLatexCommands(heading[2]),
      })
      continue
    }

    const block = line.match(/^\\begin\{(axiom|definition|postulate|theorem|lemma|corollary|proposition|remark|example|proof)\}(?:\[(.+)\])?/)
    if (block) {
      flushParagraph()
      nodes.push({ type: 'blockTitle', label: blockLabels[block[1]], title: block[2] ? stripLatexCommands(block[2]) : '' })
      continue
    }

    if (/^\\end\{(axiom|definition|postulate|theorem|lemma|corollary|proposition|remark|example|proof)\}/.test(line)) {
      flushParagraph()
      continue
    }

    if (line === '\\begin{itemize}' || line === '\\begin{enumerate}' || line === '\\end{itemize}' || line === '\\end{enumerate}') {
      flushParagraph()
      continue
    }

    if (line.startsWith('\\item')) {
      flushParagraph()
      // Пункт может продолжаться на следующих строках — копим до пустой строки,
      // следующего \item или конца окружения.
      listItemBuffer = [line.replace(/^\\item\s*/, '')]
      continue
    }

    if (line.includes('\\[')) {
      flushParagraph()
      const afterStart = line.slice(line.indexOf('\\[') + 2)
      if (afterStart.includes('\\]')) {
        nodes.push({ type: 'formula', latex: normalizeFormula(afterStart.slice(0, afterStart.indexOf('\\]'))) })
      } else {
        formulaBuffer = [afterStart]
        formulaEnd = '\\]'
      }
      continue
    }

    if (line.startsWith('\\begin{align}')) {
      flushParagraph()
      formulaBuffer = []
      formulaEnd = '\\end{align}'
      continue
    }

    if (/^\\end\{/.test(line)) {
      flushParagraph()
      continue
    }

    if (listItemBuffer) {
      listItemBuffer.push(line)
    } else {
      paragraph.push(line)
    }
  }

  flushParagraph()
  return nodes
}

const monographNodes = parseMonograph(monographSource)
const chapterSections = buildChapterSections(monographNodes)

function buildChapterSections(nodes: MonographNode[]): MonographChapter[] {
  const sections: MonographChapter[] = []

  for (const node of nodes) {
    if (node.type === 'heading' && node.level === 1) {
      sections.push({ title: node.text, nodes: [node], formulaCount: 0 })
      continue
    }

    if (sections.length === 0) {
      sections.push({ title: 'Вводная часть', nodes: [], formulaCount: 0 })
    }

    const current = sections[sections.length - 1]
    current.nodes.push(node)
    if (node.type === 'formula') current.formulaCount += 1
  }

  return sections
}

function explainFormula(latex: string) {
  const formulaTokens = extractMathTokens(expandMacros(latex))
  const hits = symbolGlossary.filter((symbol) => {
    return containsMathToken(formulaTokens, symbol)
  })

  return hits.slice(0, 9).map((symbol) => `${formatLatexForDisplay(symbol.latex)} — ${symbol.meaning}`)
}

function renderKatexHtml(latex: string, displayMode: boolean): string | null {
  let value = normalizeFormula(latex)
  if (displayMode && (/\\\\/.test(value) || value.includes('&'))) {
    value = `\\begin{aligned}${value}\\end{aligned}`
  }

  try {
    return katex.renderToString(value, {
      displayMode,
      throwOnError: true,
      strict: false,
      trust: false,
      output: 'html',
    })
  } catch {
    return null
  }
}

function FormulaMath({ latex, displayMode }: { latex: string; displayMode: boolean }) {
  const html = useMemo(() => renderKatexHtml(latex, displayMode), [latex, displayMode])

  if (html === null) {
    return (
      <pre>
        <code>{formatLatexForDisplay(latex)}</code>
      </pre>
    )
  }

  return <div className={displayMode ? 'katexBlock' : 'katexInline'} dangerouslySetInnerHTML={{ __html: html }} />
}

function MonographTable({ rows }: { rows: string[][] }) {
  const [head, ...body] = rows
  return (
    <div className="monoTableWrap">
      <table className="monoTable">
        <thead>
          <tr>
            {head.map((cell, index) => (
              <th key={index}>{renderInlineLatex(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{renderInlineLatex(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MonographBodyNode({ node }: { node: MonographNode }) {
  if (node.type === 'heading') {
    const Tag = node.level === 1 ? 'h2' : node.level === 2 ? 'h3' : 'h4'
    return <Tag className={`monoHeading monoHeading${node.level}`}>{node.text}</Tag>
  }

  if (node.type === 'paragraph') {
    return <p className="monoParagraph">{renderInlineLatex(node.text)}</p>
  }

  if (node.type === 'listItem') {
    return <li className="monoListItem">{renderInlineLatex(node.text)}</li>
  }

  if (node.type === 'blockTitle') {
    return (
      <div className="monoBlockTitle">
        <span>{node.label}</span>
        {node.title && <strong>{node.title}</strong>}
      </div>
    )
  }

  if (node.type === 'table') {
    return <MonographTable rows={node.rows} />
  }

  const explanation = isTextThesisFormula(node.latex) ? [] : explainFormula(node.latex)
  const formulaClassName = isTextThesisFormula(node.latex) ? 'monoFormula monoThesisFormula' : 'monoFormula'

  return (
    <figure className={formulaClassName}>
      <FormulaMath latex={node.latex} displayMode />
      {explanation.length > 0 && (
        <figcaption>
          <strong>Расшифровка</strong>
          <ul>
            {explanation.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </figcaption>
      )}
    </figure>
  )
}

function renderInlineLatex(text: string) {
  return text.split(/(\$[^$]+\$)/g).map((part, index) => {
    if (!part.startsWith('$') || !part.endsWith('$')) return part
    const latex = part.slice(1, -1)
    const explanation = explainFormula(latex)
    const html = renderKatexHtml(latex, false)
    if (html === null) {
      return (
        <code className="monoInlineFormula" title={explanation.join('\n')} key={`${part}-${index}`}>
          {formatLatexForDisplay(latex)}
        </code>
      )
    }
    return (
      <span
        className="monoInlineFormula"
        title={explanation.join('\n')}
        key={`${part}-${index}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  })
}

export function MonographPage() {
  const [activeChapter, setActiveChapter] = useState(0)
  const formulaCount = monographNodes.filter((node) => node.type === 'formula').length
  const active = chapterSections[activeChapter] ?? chapterSections[0]
  const chapterProgress = `${activeChapter + 1} / ${chapterSections.length}`
  const chapterSubsections = useMemo(
    () =>
      active.nodes.filter(
        (node): node is Extract<MonographNode, { type: 'heading' }> => node.type === 'heading' && node.level === 2,
      ),
    [active],
  )
  const selectChapter = (index: number) => {
    setActiveChapter(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goToPrevious = () => selectChapter(Math.max(0, activeChapter - 1))
  const goToNext = () => selectChapter(Math.min(chapterSections.length - 1, activeChapter + 1))

  return (
    <section className="page monographPage">
      <header className="monographHero glass">
        <div>
          <p className="kicker">Полная монография</p>
          <h1>Теория Единого Целого</h1>
          <p>
            Текст собран из исходного LaTeX-файла. Главы переключаются через оглавление, формулы отрисованы
            KaTeX с расшифровкой обозначений.
          </p>
        </div>
        <div className="monographStats" aria-label="Сводка монографии">
          <div>
            <strong>{chapterSections.length}</strong>
            <span>переключаемых глав</span>
          </div>
          <div>
            <strong>{formulaCount}</strong>
            <span>LaTeX-формул с расшифровкой</span>
          </div>
          <div>
            <strong>{symbolGlossary.length}</strong>
            <span>описанных символов</span>
          </div>
        </div>
      </header>

      <section className="monographLayout">
        <aside className="monographAside glass">
          <h2>Оглавление</h2>
          <nav className="chapterTabs" aria-label="Переключение глав">
            {chapterSections.map((chapter, index) => (
              <button
                type="button"
                key={`${chapter.title}-${index}`}
                className={activeChapter === index ? 'chapterTab active' : 'chapterTab'}
                onClick={() => selectChapter(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{chapter.title}</strong>
                <small>{chapter.formulaCount} формул</small>
              </button>
            ))}
          </nav>

          {chapterSubsections.length > 0 && (
            <>
              <h2>В этой главе</h2>
              <div className="chapterSubsections">
                {chapterSubsections.map((section, index) => (
                  <span key={`${section.text}-${index}`}>{section.text}</span>
                ))}
              </div>
            </>
          )}

          <h2>Символы</h2>
          <div className="symbolGrid">
            {symbolGlossary.slice(0, 18).map((symbol) => (
              <div key={symbol.latex}>
                <code>{formatLatexForDisplay(symbol.latex)}</code>
                <span>{symbol.meaning}</span>
              </div>
            ))}
          </div>
        </aside>

        <article className="monographPaper glass">
          <div className="chapterSwitcher">
            <button type="button" onClick={goToPrevious} disabled={activeChapter === 0}>
              Назад
            </button>
            <div>
              <span>Глава {chapterProgress}</span>
              <strong>{active.title}</strong>
              <select
                className="chapterSelect"
                value={activeChapter}
                onChange={(event) => selectChapter(Number(event.target.value))}
                aria-label="Быстрый переход к главе"
              >
                {chapterSections.map((chapter, index) => (
                  <option key={`${chapter.title}-${index}`} value={index}>
                    {`${index + 1}. ${chapter.title}`}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={goToNext} disabled={activeChapter === chapterSections.length - 1}>
              Вперед
            </button>
          </div>

          <div className="chapterBody" key={active.title}>
            {active.nodes.map((node, index) => (
              <div key={`${node.type}-${index}`}>
                <MonographBodyNode node={node} />
              </div>
            ))}
          </div>

          <div className="chapterSwitcher bottom">
            <button type="button" onClick={goToPrevious} disabled={activeChapter === 0}>
              Назад
            </button>
            <div>
              <span>Следующее переключение</span>
              <strong>{activeChapter === chapterSections.length - 1 ? 'Конец монографии' : chapterSections[activeChapter + 1].title}</strong>
            </div>
            <button type="button" onClick={goToNext} disabled={activeChapter === chapterSections.length - 1}>
              Вперед
            </button>
          </div>
        </article>
      </section>
    </section>
  )
}
