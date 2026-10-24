import { Moon, RotateCcw, Sun } from 'lucide-react'
import { useMemo } from 'react'
import { META } from '../lib/data'
import { longDate } from '../lib/format'
import { hash, ribbon } from '../lib/guilloche'
import css from './Masthead.module.css'

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path d="M6 9.5h20" stroke="var(--mark-ink)" strokeWidth="1.6" strokeDasharray="2 2.2" />
      <path d="M7 25l6.5-5.5 4 1.8L25 13" fill="none" stroke="var(--mark-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25" cy="13" r="2.6" fill="var(--hl)" />
    </svg>
  )
}

interface Props {
  scenarioKey: string
  onReset: () => void
  isDefault: boolean
  theme: 'light' | 'dark'
  onTheme: () => void
}

export function Masthead({ scenarioKey, onReset, isDefault, theme, onTheme }: Props) {
  // Each scenario weaves its own security ribbon, like a numbered cheque.
  const weave = useMemo(() => ribbon(hash(scenarioKey || 'default'), 1440, 64), [scenarioKey])
  return (
    <header className={css.band}>
      <div className={css.inner}>
        <div className={css.bar}>
          <p className={css.brand}>
            <Mark className={css.mark} />
            <span>Bedrock Model Economics</span>
          </p>
          <p className={css.asof}>
            Prices and scores as of <time dateTime={META.asOf}>{longDate(META.asOf)}</time>
          </p>
          <div className={css.actions}>
            <button type="button" className={css.ghost} onClick={onTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
              {theme === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <button type="button" className={css.ghost + ' ' + css.withText} onClick={onReset} disabled={isDefault}>
              <RotateCcw aria-hidden="true" />
              <span>Reset to defaults</span>
            </button>
          </div>
        </div>
      </div>

      <svg className={css.ribbon} viewBox="0 0 1440 64" preserveAspectRatio="none" aria-hidden="true">
        <g className={css.strandA}>
          {weave.a.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g className={css.strandB}>
          {weave.b.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <line x1="0" x2="1440" y1="32" y2="32" className={css.rule} />
      </svg>

      <div className={css.inner}>
        <div className={css.lead}>
          <h1>What will AI cost your team each month?</h1>
          <p>
            Describe your team and the everyday work it does. Every Amazon Bedrock model gets a monthly bill, plotted against its
            Artificial Analysis Intelligence Index, with a self-hosted on-prem box priced on the same workload.
          </p>
        </div>
      </div>
    </header>
  )
}
