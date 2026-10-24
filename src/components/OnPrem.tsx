import { TriangleAlert } from 'lucide-react'
import type { Dispatch } from 'react'
import { money, plural } from '../lib/format'
import { allowedLocals, type Action } from '../lib/scenario'
import type { LocalResult, Scenario } from '../lib/types'
import css from './OnPrem.module.css'
import { Field, NumberInput, Rolling } from './ui'

interface Props {
  s: Scenario
  lc: LocalResult
  excluded: boolean
  dispatch: Dispatch<Action>
}

const FIELDS: { k: keyof Scenario; label: string; step: number; min: number; max?: number }[] = [
  { k: 'hw', label: 'Hardware $ per box', step: 500, min: 0 },
  { k: 'life', label: 'Life (months)', step: 6, min: 1 },
  { k: 'tput', label: 'Output tok/s per box', step: 10, min: 1 },
  { k: 'pre', label: 'Prompt tok/s per box', step: 500, min: 1 },
  { k: 'wact', label: 'Active watts', step: 10, min: 0 },
  { k: 'widle', label: 'Idle watts', step: 10, min: 0 },
  { k: 'kwh', label: '$ per kWh', step: 0.01, min: 0 },
  { k: 'hours', label: 'Business hours / day', step: 1, min: 1, max: 24 },
  { k: 'ops', label: 'Ops $ / month', step: 100, min: 0 },
]

export function OnPrem({ s, lc, excluded, dispatch }: Props) {
  const locals = allowedLocals(s.noCN)
  const local = locals.find((l) => l.id === s.localId) ?? locals[0]
  const life = Math.max(1, s.life)
  const hardware = (lc.boxes * s.hw) / life
  const energy = Math.max(0, lc.cost - hardware - s.ops)
  const warn = lc.boxes > 1 || lc.util >= 0.85
  const pct = (lc.util * 100).toFixed(0)

  return (
    <section className={css.section} id="onprem" aria-labelledby="onprem-h">
      <div className={css.head}>
        <h2 id="onprem-h">On-prem meter</h2>
        <p>
          The on-prem box, priced on the same workload. Choosing a local model loads a typical hardware setup for it; every field can be edited.
          Throughput is combined output across all users with request batching. The box is sized so the team's daily work fits inside business hours.
        </p>
      </div>

      <div className={css.grid}>
        <div className={css.inputs}>
          <Field label="Local model" className={css.wide}>
            {(id) => (
              <select id={id} className="field" value={local.id} onChange={(e) => dispatch({ type: 'local', id: e.target.value })}>
                {locals.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} · index {l.idx} · {l.setup}
                  </option>
                ))}
              </select>
            )}
          </Field>
          {FIELDS.map((f) => (
            <Field key={f.k} label={f.label}>
              {(id) => (
                <NumberInput
                  id={id}
                  value={s[f.k] as number}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  onChange={(v) => dispatch({ type: 'patch', patch: { [f.k]: v } as Partial<Scenario> })}
                />
              )}
            </Field>
          ))}
        </div>

        <div className={css.meter}>
          <dl className={css.readings}>
            <div>
              <dt>Hardware</dt>
              <dd>
                <span>
                  {lc.boxes} {plural(lc.boxes, 'box', 'boxes')} over {life} months
                </span>
                <b>{money(hardware)}</b>
              </dd>
            </div>
            <div>
              <dt>Energy</dt>
              <dd>
                <span>At ${s.kwh}/kWh, idle hours included</span>
                <b>{money(energy)}</b>
              </dd>
            </div>
            <div>
              <dt>Ops</dt>
              <dd>
                <span>Staff, networking, ATO if entered</span>
                <b>{money(s.ops)}</b>
              </dd>
            </div>
            <div className={css.total}>
              <dt>Monthly cost</dt>
              <dd>
                <Rolling text={money(lc.cost)} register />
                <span className={css.per}>/mo</span>
              </dd>
            </div>
            <div className={css.util}>
              <dt>Utilization</dt>
              <dd>
                <span
                  className={css.track}
                  role="meter"
                  aria-label="Busy during business hours"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(lc.util * 100)}
                >
                  <span className={css.fill} data-warn={warn || undefined} style={{ transform: `scaleX(${Math.min(1, lc.util)})` }} />
                  <span className={css.limit} />
                </span>
                <b>{pct}%</b>
              </dd>
            </div>
          </dl>

          <p className={warn ? css.capWarn : css.cap} role="status">
            {warn && <TriangleAlert aria-hidden="true" />}
            <span>
              {excluded ? 'The local model' : local.name} needs about {lc.gpuHoursDay.toFixed(1)} GPU-hours per workday. Sized at {lc.boxes}{' '}
              {plural(lc.boxes, 'box', 'boxes')}, {pct}% busy during business hours.
              {warn && ' Above 85% the box has little headroom for peaks.'}
            </span>
          </p>
          {excluded && <p className={css.cap}>The selected local model is excluded by your filters, so it isn't on the chart.</p>}
        </div>
      </div>
    </section>
  )
}
