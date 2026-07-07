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

let pyodidePromise: Promise<PyodideRuntime> | null = null
let balansisPromise: Promise<void> | null = null
let magicBrainPromise: Promise<void> | null = null

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
`).then(() => undefined)
  }
  return balansisPromise
}

async function ensureMagicBrain(pyodide: PyodideRuntime) {
  if (!magicBrainPromise) {
    magicBrainPromise = pyodide.runPythonAsync(`
import micropip
await micropip.install('magicbrain[balansis]')
`).then(() => undefined)
  }
  return magicBrainPromise
}

function wrapCode(code: string) {
  return `
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

_stdout.getvalue() + _stderr.getvalue()
`
}

export function BrowserPythonRunner({ code, needsBalansis = false, needsMagicBrain = false }: { code: string; needsBalansis?: boolean; needsMagicBrain?: boolean }) {
  const [state, setState] = useState<RunnerState>('idle')
  const [output, setOutput] = useState('')

  async function runCode() {
    setOutput('')
    setState(pyodidePromise ? 'running' : 'loading')
    try {
      const pyodide = await getPyodide()
      if (needsMagicBrain) {
        setState('installing')
        await ensureMagicBrain(pyodide)
      } else if (needsBalansis) {
        setState('installing')
        await ensureBalansis(pyodide)
      }
      setState('running')
      const result = await pyodide.runPythonAsync(wrapCode(code))
      setOutput(String(result || 'Код выполнен без вывода.'))
      setState('ready')
    } catch (error) {
      setOutput(error instanceof Error ? error.message : String(error))
      setState('error')
    }
  }

  return (
    <div className="browserRunner">
      <button type="button" onClick={runCode} disabled={state === 'loading' || state === 'installing' || state === 'running'}>
        {state === 'loading' ? 'Загрузка Python…' : state === 'installing' ? `Установка ${needsMagicBrain ? 'MagicBrain' : 'Balansis'}…` : state === 'running' ? 'Выполнение…' : 'Запустить в браузере'}
      </button>
      <small>{needsMagicBrain ? 'Код выполняется локально через Pyodide и пакет magicbrain[balansis].' : needsBalansis ? 'Код выполняется локально через Pyodide и пакет balansis==1.0.0.' : 'Код выполняется локально в браузере через Pyodide.'}</small>
      <pre className={state === 'error' ? 'runnerOutput error' : 'runnerOutput'}><code>{output || 'Вывод появится здесь после запуска.'}</code></pre>
    </div>
  )
}
