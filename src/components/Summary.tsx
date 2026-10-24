import { Check, Link2 } from 'lucide-react'
import type { Computed, Verdicts } from '../lib/cost'
import { int, money, plural, tok } from '../lib/format'
import type { Scenario } from '../lib/types'
import css from './Summary.module.css'
import { Rolling } from './ui'

interface Props {
  c: Computed
  v: Verdicts | null
  s: Scenario
  copied: boolean
  onCopy: () => void
}

const THINK_CODE: Record<number, string> = { 1: 'LGT', 2: 'STD', 4: 'DEEP' }

/** OCR-style scan line: the scenario in short codes, tokenised so it wraps cleanly. */
function scanTokens(s: Scenario, v: Verdicts | null): string[] {
  const heads = Object.values(s.heads).map((n) => int(n)).join('/')
  const policy = s.gov ? (s.il ? 'GOV-IL5' : 'GOV') : 'COM'
  const due = v ? String(Math.round(v.value.cost)).padStart(7, '0') : '0000000'
  return [`SCN ${heads}`, `ACT${s.adopt}`, `WD${s.days}`, THINK_CODE[s.think], `C${s.cache ? 1 : 0}`, s.noCN ? 'XCN' : 'ALL', policy, `T${s.tier.toFixed(2)}`, `› ${due}`]
}

function Item({ term, main, amount, unit, detail }: { term: string; main: string; amount: string; unit?: string; detail: string }) {
  return (
    <div className={css.item}>
      <dt>{term}</dt>
      <dd>
        <p className={css.line}>
          <span className={css.main}>{main}</span>
          <span className={css.leader} aria-hidden="true" />
          <span className={css.amount}>
            <Rolling text={amount} />
            {unit && <span className={css.unit}>{unit}</span>}
          </span>
        </p>
        <p className={css.detail}>{detail}</p>
      </dd>
    </div>
  )
}

export function Summary({ c, v, s, copied, onCopy }: Props) {
  let onprem: { main: string; amount: string; unit?: string; detail: string }
  if (!v) {
    onprem = { main: 'Nothing to compare', amount: '—', detail: 'Add people or loosen the filters to price the on-prem box against Bedrock.' }
  } else if (!v.local) {
    onprem = { main: 'Pick a local model', amount: '—', detail: 'The selected local model is excluded by your filters.' }
  } else if (!v.match) {
    onprem = { main: 'No Bedrock match', amount: money(v.local.cost), unit: '/mo', detail: 'No visible Bedrock model scores as high as the local model.' }
  } else {
    onprem = {
      main: v.local.cost < v.match.cost ? 'On-prem saves' : 'Bedrock saves',
      amount: money(Math.abs(v.match.cost - v.local.cost)),
      unit: '/mo',
      detail: `${c.local.name} on ${c.lc.boxes} ${plural(c.lc.boxes, 'box', 'boxes')} costs ${money(v.local.cost)}. ${v.match.name} scores ${v.match.idx} vs ${v.local.idx} for ${money(v.match.cost)}.`,
    }
  }

  return (
    <section className={css.stub} aria-labelledby="summary-h">
      <div className={css.head}>
        <h2 id="summary-h">Your team's monthly statement</h2>
        <p>
          {int(c.people)} {plural(c.people, 'person', 'people')} on staff, {s.adopt}% active, {s.days} workdays
        </p>
      </div>

      <div className={css.body}>
        <dl className={css.items}>
          <Item
            term="Team usage"
            main={`${int(c.active)} active ${plural(Math.round(c.active), 'user')}`}
            amount={int(c.tasksPerMonth)}
            unit=" tasks/mo"
            detail={`${tok(c.tokens.inTok)} input and ${tok(c.tokens.outTok)} output tokens a month across ${int(c.tasksPerMonth)} tasks.`}
          />
          {v ? (
            <Item
              term="Highest quality"
              main={`${v.top.name} · ${v.top.idx}`}
              amount={money(v.top.cost)}
              unit="/mo"
              detail={`The top-scoring model in view: ${money(v.top.perUser)} per active user a month.`}
            />
          ) : (
            <Item term="Highest quality" main="No model in view" amount="—" detail="Every Bedrock model is hidden by your filters, or no one is active." />
          )}
          <Item term="On-prem vs Bedrock" {...onprem} />
        </dl>

        <div className={css.remit}>
          <dl className={css.due} aria-live="polite" aria-atomic="true">
            <div className={css.dueRow}>
              <dt>Amount due</dt>
              <dd className={css.dueAmount}>
                {v ? (
                  <>
                    <span className="hl">
                      <Rolling text={money(v.value.cost)} />
                    </span>
                    <span className={css.dueUnit}>/mo</span>
                  </>
                ) : (
                  <span className={css.dueNone}>No result</span>
                )}
              </dd>
            </div>
            {v ? (
              <>
                <div>
                  <dt>Service</dt>
                  <dd className={css.service}>
                    {v.value.name} <span>· index {v.value.idx}</span>
                  </dd>
                </div>
                <div>
                  <dt>Basis</dt>
                  <dd>
                    Best value within 3 points of the top score ({v.top.idx}), for {money(v.value.cost)} a month.
                  </dd>
                </div>
                <div>
                  <dt>Per user</dt>
                  <dd>{money(v.value.perUser)} a month</dd>
                </div>
              </>
            ) : (
              <div>
                <dt>Why</dt>
                <dd>Add people or loosen the filters. At least one Bedrock model must be visible and someone must be active.</dd>
              </div>
            )}
          </dl>

          <div className={css.send}>
            <p className={css.scan} aria-label="Scenario code">
              {scanTokens(s, v).map((t, i) => (
                <span key={i}>{t}</span>
              ))}
            </p>
            <button type="button" className={css.copy} onClick={onCopy}>
              {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
              <span>{copied ? 'Link copied' : 'Copy link to this scenario'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
