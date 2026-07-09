import { useState } from 'react'

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideRuntime>
  }
}

type PyodideRuntime = {
  loadPackage: (name: string) => Promise<void>
  runPythonAsync: (code: string) => Promise<unknown>
}

type RunnerState = 'idle' | 'loading' | 'installing' | 'running' | 'ready' | 'error'
type PackageStatus = 'missing' | 'ready'
type PythonRunResult = { stdout: string; stderr: string }

let pyodidePromise: Promise<PyodideRuntime> | null = null
let balansisPromise: Promise<void> | null = null
let magicBrainPromise: Promise<void> | null = null
let pythonStatus: PackageStatus = 'missing'
let balansisStatus: PackageStatus = 'missing'
let magicBrainStatus: PackageStatus = 'missing'

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Не удалось загрузить Pyodide'))
    document.head.appendChild(script)
  })
}

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const indexURL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
      await loadScript(`${indexURL}pyodide.js`)
      if (!window.loadPyodide) throw new Error('Pyodide не доступен')
      const pyodide = await window.loadPyodide({ indexURL })
      await pyodide.loadPackage('micropip')
      pythonStatus = 'ready'
      return pyodide
    })()
  }
  return pyodidePromise
}

async function ensureBalansis(pyodide: PyodideRuntime) {
  if (!balansisPromise) {
    balansisPromise = pyodide.runPythonAsync(`
import micropip
await micropip.install('balansis==1.0.0')
`).then(() => { balansisStatus = 'ready' })
  }
  return balansisPromise
}

async function ensureMagicBrain(pyodide: PyodideRuntime) {
  if (!magicBrainPromise) {
    magicBrainPromise = pyodide.runPythonAsync(`
import micropip
await micropip.install('magicbrain[balansis]')
`).then(() => {
      magicBrainStatus = 'ready'
      balansisStatus = 'ready'
    })
  }
  return magicBrainPromise
}

function resetBrowserPythonRuntime() {
  pyodidePromise = null
  balansisPromise = null
  magicBrainPromise = null
  pythonStatus = 'missing'
  balansisStatus = 'missing'
  magicBrainStatus = 'missing'
}

function wrapCode(code: string) {
  return `
import json
import sys
import traceback
from io import StringIO

_stdout = StringIO()
_stderr = StringIO()
_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = _stdout
sys.stderr = _stderr
try:
${code.split('\n').map((line) => `    ${line}`).join('\n')}
except Exception:
    traceback.print_exc(file=_stderr)
finally:
    sys.stdout = _old_stdout
    sys.stderr = _old_stderr

json.dumps({"stdout": _stdout.getvalue(), "stderr": _stderr.getvalue()})
`
}

function statusLabel(status: PackageStatus) {
  return status === 'ready' ? 'ready' : 'missing'
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => window.setTimeout(() => reject(new Error(`Выполнение остановлено по timeout ${timeoutMs} ms`)), timeoutMs)),
  ])
}

function parsePythonResult(result: unknown): PythonRunResult {
  try {
    const parsed = JSON.parse(String(result || '{}')) as PythonRunResult
    return { stdout: parsed.stdout || '', stderr: parsed.stderr || '' }
  } catch {
    return { stdout: String(result || ''), stderr: '' }
  }
}

function fallbackHint(message: string, needsBalansis: boolean, needsMagicBrain: boolean) {
  const lower = message.toLowerCase()
  if (lower.includes('pyodide') || lower.includes('cdn') || lower.includes('failed to fetch') || lower.includes('не удалось загрузить')) {
    return 'Fallback: проверьте интернет/CDN Pyodide или запустите пример позже. Базовые визуализаторы работают без Python runtime.'
  }
  if (needsMagicBrain && (lower.includes('magicbrain') || lower.includes('micropip') || lower.includes('install'))) {
    return 'Fallback: MagicBrain может требовать wheel/зависимости, недоступные в Pyodide. Используйте визуальную SNN-демонстрацию или облегчённые Balansis/Python-примеры.'
  }
  if (needsBalansis && (lower.includes('balansis') || lower.includes('micropip') || lower.includes('install'))) {
    return 'Fallback: Balansis не установился в браузере. Проверьте сеть или запустите код локально через pip install balansis==1.0.0.'
  }
  return ''
}

export function BrowserPythonRunner({ code, needsBalansis = false, needsMagicBrain = false }: { code: string; needsBalansis?: boolean; needsMagicBrain?: boolean }) {
  const [state, setState] = useState<RunnerState>('idle')
  const [stdout, setStdout] = useState('')
  const [stderr, setStderr] = useState('')
  const [durationMs, setDurationMs] = useState<number | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'code' | 'output'>('idle')
  const [statuses, setStatuses] = useState({ python: pythonStatus, balansis: balansisStatus, magicbrain: magicBrainStatus })

  function syncStatuses() {
    setStatuses({ python: pythonStatus, balansis: balansisStatus, magicbrain: magicBrainStatus })
  }

  async function copyText(value: string, kind: 'code' | 'output') {
    await navigator.clipboard.writeText(value)
    setCopyState(kind)
    window.setTimeout(() => setCopyState('idle'), 1200)
  }

  function downloadOutput() {
    const payload = JSON.stringify({ stdout, stderr, durationMs, statuses, createdAt: new Date().toISOString() }, null, 2)
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'browser-python-result.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function resetRuntime() {
    resetBrowserPythonRuntime()
    setState('idle')
    setStdout('')
    setStderr('')
    setDurationMs(null)
    syncStatuses()
  }

  async function runCode() {
    setStdout('')
    setStderr('')
    setDurationMs(null)
    setState(pyodidePromise ? 'running' : 'loading')
    const startedAt = performance.now()
    try {
      const pyodide = await getPyodide()
      syncStatuses()
      if (needsMagicBrain) {
        setState('installing')
        await ensureMagicBrain(pyodide)
        syncStatuses()
      } else if (needsBalansis) {
        setState('installing')
        await ensureBalansis(pyodide)
        syncStatuses()
      }
      setState('running')
      const result = parsePythonResult(await withTimeout(pyodide.runPythonAsync(wrapCode(code)), 15000))
      setStdout(result.stdout || 'Код выполнен без stdout.')
      setStderr(result.stderr)
      setDurationMs(Math.round(performance.now() - startedAt))
      setState(result.stderr ? 'error' : 'ready')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const hint = fallbackHint(message, needsBalansis, needsMagicBrain)
      setStdout(hint)
      setStderr(message)
      setDurationMs(Math.round(performance.now() - startedAt))
      setState('error')
      syncStatuses()
    }
  }

  const busy = state === 'loading' || state === 'installing' || state === 'running'
  const combinedOutput = [stdout, stderr].filter(Boolean).join('\n')

  return (
    <div className="browserRunner">
      <div className="runnerActions">
        <button type="button" onClick={runCode} disabled={busy}>
          {state === 'loading' ? 'Загрузка Python…' : state === 'installing' ? `Установка ${needsMagicBrain ? 'MagicBrain' : 'Balansis'}…` : state === 'running' ? 'Выполнение…' : 'Запустить в браузере'}
        </button>
        <button type="button" className="runnerGhostButton" onClick={() => copyText(code, 'code')} disabled={busy}>Копировать код</button>
        <button type="button" className="runnerGhostButton" onClick={() => copyText(combinedOutput, 'output')} disabled={!combinedOutput}>Копировать вывод</button>
        <button type="button" className="runnerGhostButton" onClick={downloadOutput} disabled={!combinedOutput}>Скачать JSON</button>
        <button type="button" className="runnerGhostButton" onClick={resetRuntime} disabled={busy}>Reset runtime</button>
      </div>
      <small>{needsMagicBrain ? 'Код выполняется локально через Pyodide и пакет magicbrain[balansis].' : needsBalansis ? 'Код выполняется локально через Pyodide и пакет balansis==1.0.0.' : 'Код выполняется локально в браузере через Pyodide.'}</small>
      <div className="runnerStatusBar" aria-label="Статусы браузерного Python runtime">
        <span>Python: {statusLabel(statuses.python)}</span>
        <span>Balansis: {statusLabel(statuses.balansis)}</span>
        <span>MagicBrain: {statusLabel(statuses.magicbrain)}</span>
        <span>Timeout: 15000 ms</span>
        <span>Last run: {durationMs === null ? '—' : `${durationMs} ms`}</span>
        {copyState !== 'idle' && <span>Copied: {copyState}</span>}
      </div>
      <div className="runnerOutputGrid" aria-live="polite">
        <pre className="runnerOutput"><strong>stdout</strong><code>{stdout || 'Stdout появится здесь после запуска.'}</code></pre>
        <pre className={stderr ? 'runnerOutput error' : 'runnerOutput'}><strong>stderr</strong><code>{stderr || 'Ошибки и traceback появятся здесь.'}</code></pre>
      </div>
    </div>
  )
}
