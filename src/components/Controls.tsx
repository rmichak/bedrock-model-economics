import type { CSSProperties, Dispatch } from 'react'
import { GROUPS } from '../lib/data'
import { int } from '../lib/format'
import type { Action } from '../lib/scenario'
import type { Scenario, Think, Tier } from '../lib/types'
import css from './Controls.module.css'
import { Check, Field, NumberInput, Segmented, Stepper } from './ui'

interface Props {
  s: Scenario
  dispatch: Dispatch<Action>
  people: number
  active: number
}

export function Controls({ s, dispatch, people, active }: Props) {
  const patch = (p: Partial<Scenario>) => dispatch({ type: 'patch', patch: p })
  return (
    <form className={css.panel} onSubmit={(e) => e.preventDefault()} aria-label="Scenario inputs">
      <fieldset className={css.group}>
        <legend className={css.legend}>Your team</legend>
        <ul className={css.heads}>
          {GROUPS.map((g) => (
            <li key={g.id} className={css.headRow}>
              <span>
                <span className={css.headName}>{g.name}</span>
                <span className={css.headHint}>{g.hint}</span>
              </span>
              <Stepper label={`${g.name} headcount`} value={s.heads[g.id] ?? 0} onChange={(v) => dispatch({ type: 'head', group: g.id, value: v })} />
            </li>
          ))}
        </ul>

        <div className={css.slider}>
          <label htmlFor="adopt" className={css.sliderLabel}>
            <span>Active users</span>
            <output htmlFor="adopt" className={css.sliderOut}>
              {s.adopt}% <span>· {int(active)} of {int(people)}</span>
            </output>
          </label>
          <input
            id="adopt"
            type="range"
            min={10}
            max={100}
            step={5}
            value={s.adopt}
            style={{ '--fill': `${((s.adopt - 10) / 90) * 100}%` } as CSSProperties}
            onChange={(e) => patch({ adopt: +e.target.value })}
          />
        </div>

        <Field label="Workdays per month">
          {(id) => <NumberInput id={id} value={s.days} min={1} max={31} onChange={(v) => patch({ days: v })} />}
        </Field>

        <Segmented<Think>
          legend="Model thinking"
          value={s.think}
          onChange={(v) => patch({ think: v })}
          options={[
            { value: 1, label: 'Light', sub: '×1 out' },
            { value: 2, label: 'Standard', sub: '×2 out' },
            { value: 4, label: 'Deep', sub: '×4 out' },
          ]}
          hint="Reasoning overhead, applied as a multiplier on output tokens."
        />

        <Check
          checked={s.cache}
          onChange={(v) => patch({ cache: v })}
          label="Prompt caching"
          description="Repeated context in multi-step tasks billed at 10% of the input rate."
        />
        <p className={css.note}>
          Task counts per person are set in the <a href="#worksheet">task worksheet</a> below the chart.
        </p>
      </fieldset>

      <fieldset className={css.group}>
        <legend className={css.legend}>Policy filters</legend>
        <Check
          checked={s.noCN}
          onChange={(v) => dispatch({ type: 'noCN', value: v })}
          label="Exclude models developed in China"
          description="Removes DeepSeek, Qwen, Kimi, GLM and MiniMax, including as the local model."
        />
        <Check
          checked={s.gov}
          onChange={(v) => patch({ gov: v })}
          label="AWS GovCloud (US) only"
          description="Keeps models Bedrock lists for GovCloud at FedRAMP High, and uses GovCloud prices where published."
        />
        <Check
          checked={s.il}
          disabled={!s.gov}
          onChange={(v) => patch({ il: v })}
          label="Require DoD IL4/IL5"
          description={s.gov ? 'Keeps only models cleared at IL4/IL5 in GovCloud.' : 'Applies with GovCloud only. Turn on GovCloud first.'}
        />
        <Segmented<Tier>
          legend="Bedrock service tier"
          value={s.tier}
          onChange={(v) => patch({ tier: v })}
          options={[
            { value: 1, label: 'Standard', sub: 'on-demand' },
            { value: 0.5, label: 'Flex', sub: '−50%' },
            { value: 1.75, label: 'Priority', sub: '+75%' },
          ]}
        />
      </fieldset>
    </form>
  )
}
