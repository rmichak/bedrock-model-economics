import { Plus, X } from 'lucide-react'
import { useState, type Dispatch, type FormEvent } from 'react'
import { rates, taskCost } from '../lib/cost'
import { GROUPS } from '../lib/data'
import { int, money, tok } from '../lib/format'
import type { Action } from '../lib/scenario'
import type { CostInputs, Model, Row, Scenario, Task } from '../lib/types'
import css from './Worksheet.module.css'
import { NumberInput } from './ui'

interface Props {
  s: Scenario
  ci: CostInputs
  tasks: Task[]
  tc: Record<string, number>
  options: Row[]
  model?: Model
  dispatch: Dispatch<Action>
}

export function Worksheet({ s, ci, tasks, tc, options, model, dispatch }: Props) {
  const lines = tasks.map((t) => {
    const unit = model ? taskCost(model, t, ci) : 0
    const n = tc[t.id] ?? 0
    return { t, unit, n, tot: unit * n }
  })
  const sum = lines.reduce((a, l) => a + l.tot, 0)
  const maxTot = Math.max(...lines.map((l) => l.tot), 0)
  const est = model ? rates(model, ci, 1).est : false

  return (
    <section className={css.section} id="worksheet" aria-labelledby="worksheet-h">
      <div className={css.head}>
        <div>
          <h2 id="worksheet-h">Usage detail by task</h2>
          <p>
            The task worksheet: tasks per active person per workday, for each group. Token sizes are typical estimates (about 0.75 words per token) and
            include system prompts and retrieved context.
          </p>
        </div>
        <label className={css.pick}>
          <span>Price tasks with</span>
          <select className="field" value={model?.id ?? ''} onChange={(e) => dispatch({ type: 'patch', patch: { pick: e.target.value } })} disabled={!options.length}>
            {options.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.idx}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="swipe-hint">Swipe the table sideways for each group's counts and the cost columns.</p>
      <div className={css.scroll + ' scroll-x'} tabIndex={0} role="region" aria-labelledby="worksheet-h">
        <table className={css.table}>
          <thead>
            <tr>
              <th scope="col" className={css.taskCol}>
                Task
              </th>
              <th scope="col" className={css.num}>
                Tokens in
              </th>
              <th scope="col" className={css.num}>
                Tokens out
              </th>
              {GROUPS.map((g) => (
                <th scope="col" key={g.id} className={css.num + ' ' + css.groupCol}>
                  {g.name}
                  <small>{int(s.heads[g.id] ?? 0)} people</small>
                </th>
              ))}
              <th scope="col" className={css.num}>
                Cost per task
              </th>
              <th scope="col" className={css.num}>
                Team tasks / mo
              </th>
              <th scope="col" className={css.num + ' ' + css.totCol}>
                Team $ / mo
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map(({ t, unit, n, tot }) => (
              <tr key={t.id} className={t.custom ? css.custom : undefined}>
                <th scope="row" className={css.taskCol}>
                  <span className={css.taskName}>
                    {t.name}
                    {t.custom && (
                      <button type="button" className={css.remove} onClick={() => dispatch({ type: 'removeTask', id: t.id })} aria-label={`Remove ${t.name}`}>
                        <X aria-hidden="true" />
                      </button>
                    )}
                  </span>
                  <small>{t.size}</small>
                </th>
                <td className={css.num}>
                  {tok(t.calls * t.inPer)}
                  {t.cache > 0 && s.cache && <small className={css.cached}>{Math.round(t.cache * 100)}% cached</small>}
                </td>
                <td className={css.num}>{tok(t.calls * t.outPer * s.think)}</td>
                {GROUPS.map((g) => (
                  <td key={g.id} className={css.num}>
                    <NumberInput
                      className={css.cnt}
                      value={s.counts[g.id]?.[t.id] ?? 0}
                      min={0}
                      step={0.5}
                      label={`${t.name}, ${g.name}, per person per day`}
                      onChange={(v) => dispatch({ type: 'count', group: g.id, task: t.id, value: v })}
                    />
                  </td>
                ))}
                <td className={css.num}>{money(unit)}</td>
                <td className={css.num}>{int(n)}</td>
                <td className={css.num + ' ' + css.totCol}>
                  <span className={css.share} aria-hidden="true">
                    <span style={{ transform: `scaleX(${maxTot > 0 ? tot / maxTot : 0})` }} />
                  </span>
                  {money(tot)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3 + GROUPS.length + 2} className={css.totalLabel}>
                Total with {model ? model.name : '—'}
                {est && <span className="chip chip-est">GovCloud price est.</span>}
              </th>
              <td className={css.num + ' ' + css.total}>{money(sum)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <AddTask onAdd={(name, inPer, outPer) => dispatch({ type: 'addTask', name, inPer, outPer })} />
    </section>
  )
}

function AddTask({ onAdd }: { onAdd: (name: string, inPer: number, outPer: number) => void }) {
  const [name, setName] = useState('')
  const [inPer, setIn] = useState('')
  const [outPer, setOut] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const i = Number(inPer)
    const o = Number(outPer)
    if (!name.trim()) return setError('Name the task so it shows up in the worksheet.')
    if (!Number.isFinite(i) || !Number.isFinite(o) || i < 0 || o < 0 || i + o === 0) {
      return setError('Enter tokens in and tokens out per task, for example 6000 and 800.')
    }
    onAdd(name.trim(), i, o)
    setName('')
    setIn('')
    setOut('')
    setError(null)
  }

  return (
    <form className={css.add} onSubmit={submit} noValidate aria-labelledby="add-task-h">
      <p className={css.addTitle} id="add-task-h">
        Add your own task
      </p>
      <div className={css.addRow}>
        <label className={css.addName}>
          <span>Task name</span>
          <input className="field" value={name} maxLength={80} placeholder="Draft a policy brief" onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          <span>Tokens in</span>
          <input className="field" type="number" inputMode="numeric" min={0} step={100} value={inPer} placeholder="6000" onChange={(e) => setIn(e.target.value)} />
        </label>
        <label>
          <span>Tokens out</span>
          <input className="field" type="number" inputMode="numeric" min={0} step={100} value={outPer} placeholder="800" onChange={(e) => setOut(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-primary">
          <Plus aria-hidden="true" />
          Add task
        </button>
      </div>
      <p className={(error ? css.addError : css.addHint) + ' ' + css.addNote} role={error ? 'alert' : undefined}>
        {error ?? 'New tasks start at one per active person per workday in every group; edit the counts in the table.'}
      </p>
    </form>
  )
}
