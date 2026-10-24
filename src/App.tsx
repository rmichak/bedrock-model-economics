import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import css from './App.module.css'
import { Chart } from './components/Chart'
import { Controls } from './components/Controls'
import { Ledger } from './components/Ledger'
import { Masthead } from './components/Masthead'
import { Notes } from './components/Notes'
import { OnPrem } from './components/OnPrem'
import { StickyBar } from './components/StickyBar'
import { Summary } from './components/Summary'
import { Worksheet } from './components/Worksheet'
import { useScenario } from './hooks/useScenario'
import { useTheme } from './hooks/useTheme'
import { compute, verdicts } from './lib/cost'
import { download, ledgerCsv } from './lib/csv'
import { GROUPS, META, MODELS } from './lib/data'
import { longDate, plural } from './lib/format'
import { allTasks, encodeScenario, findLocal, toCostInputs } from './lib/scenario'
import type { Row } from './lib/types'

const REPO = 'https://github.com/rmichak/bedrock-model-economics'

function hiddenNote(hidden: Row[], il: boolean): string | null {
  const cn = hidden.filter((m) => m.origin === 'China').length
  const notGov = hidden.length - cn
  const parts: string[] = []
  if (cn) parts.push(`${cn} China-developed ${plural(cn, 'model')}`)
  if (notGov) parts.push(`${notGov} ${plural(notGov, 'model')} not cleared for ${il ? 'GovCloud IL4/IL5' : 'GovCloud'}`)
  return parts.length ? `Hidden by your filters: ${parts.join(' and ')}. They still appear, greyed out, at the bottom of the ledger.` : null
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

export default function App() {
  const [s, dispatch] = useScenario()
  const { theme, toggle } = useTheme()

  const tasks = useMemo(() => allTasks(s), [s])
  const ci = useMemo(() => toCostInputs(s), [s])
  const c = useMemo(() => compute({ models: MODELS, groups: GROUPS, tasks }, findLocal(s.localId), ci), [tasks, ci, s.localId])
  const v = useMemo(() => verdicts(c), [c])
  const key = encodeScenario(s)

  const options = c.rows.filter((r) => r.kind !== 'local')
  const pickRow = options.find((r) => r.id === s.pick) ?? options.find((r) => r.frontier) ?? options[0]

  const [copied, setCopied] = useState(false)
  const onCopy = useCallback(async () => {
    const url = window.location.origin + window.location.pathname + (key ? '?' + key : '')
    window.history.replaceState(null, '', url)
    if (await copyText(url)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    }
  }, [key])

  const onCsv = () => download(`bedrock-model-economics-${META.asOf}.csv`, ledgerCsv(c.rows, c.hidden, ci, META.asOf))

  // Show the slim statement bar once the stub scrolls away.
  const stubRef = useRef<HTMLDivElement>(null)
  const [stubVisible, setStubVisible] = useState(true)
  useEffect(() => {
    const el = stubRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setStubVisible(e.isIntersecting || e.boundingClientRect.top > 0), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const localExcluded = s.noCN && findLocal(s.localId).origin === 'China'

  return (
    <>
      <a className={css.skip} href="#main">
        Skip to the calculator
      </a>
      <Masthead
        scenarioKey={key}
        onReset={() => dispatch({ type: 'reset' })}
        isDefault={key === ''}
        theme={theme}
        onTheme={toggle}
        copied={copied}
        onCopy={onCopy}
      />
      <StickyBar visible={!stubVisible} v={v} copied={copied} onCopy={onCopy} />

      <main id="main" className={css.sheet}>
        <div ref={stubRef}>
          <Summary c={c} v={v} s={s} copied={copied} onCopy={onCopy} />
        </div>

        <div className={css.perf} aria-hidden="true" />

        <section className={css.compare} aria-labelledby="compare-h">
          <div className={css.compareHead}>
            <h2 id="compare-h">Cost against quality</h2>
            <p>
              Every model's monthly bill for your team, plotted against its intelligence score. The dashed line is the Pareto frontier: models no cheaper
              option beats on quality.
            </p>
          </div>
          <div className={css.compareGrid}>
            <Controls s={s} dispatch={dispatch} people={c.people} active={c.active} />
            <Chart
              rows={c.rows}
              frontier={c.frontier}
              logX={s.logX}
              onScale={(logX) => dispatch({ type: 'patch', patch: { logX } })}
              valueId={v?.value.id}
              hiddenNote={hiddenNote(c.hidden, ci.il)}
            />
          </div>
        </section>

        <div className={css.perf} aria-hidden="true" />

        <Worksheet s={s} ci={ci} tasks={tasks} tc={c.tc} options={options} model={pickRow?.model} dispatch={dispatch} />
        <div className={css.perf} aria-hidden="true" />
        <Ledger rows={c.rows} hidden={c.hidden} ci={ci} onCsv={onCsv} />
        <div className={css.perf} aria-hidden="true" />
        <OnPrem s={s} lc={c.lc} excluded={localExcluded} dispatch={dispatch} />
        <Notes />
      </main>

      <footer className={css.footer}>
        <p>
          Prices and scores are as of {longDate(META.asOf)} and change often. Check the{' '}
          <a href="#notes">sources</a> before you budget or buy.
        </p>
        <p>
          A planning tool, not a quote. <a href={REPO}>Source on GitHub</a> · data in <code>src/data</code>, refreshable without touching code.
        </p>
      </footer>
    </>
  )
}
