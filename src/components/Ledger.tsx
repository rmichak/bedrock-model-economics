import { ArrowDown, ArrowUp, ChevronsUpDown, Download } from 'lucide-react'
import { useState } from 'react'
import { rates } from '../lib/cost'
import { money, price } from '../lib/format'
import { COLOR, KIND_LABEL } from '../lib/series'
import type { CostInputs, Row } from '../lib/types'
import css from './Ledger.module.css'

type Key = 'name' | 'kind' | 'origin' | 'gov' | 'idx' | 'pi' | 'po' | 'cost' | 'perUser' | 'tps'

const COLS: { k: Key; t: string; num?: boolean }[] = [
  { k: 'name', t: 'Model' },
  { k: 'kind', t: 'Where' },
  { k: 'origin', t: 'Origin' },
  { k: 'gov', t: 'GovCloud' },
  { k: 'idx', t: 'Index', num: true },
  { k: 'pi', t: '$ in / 1M', num: true },
  { k: 'po', t: '$ out / 1M', num: true },
  { k: 'cost', t: 'Team $ / mo', num: true },
  { k: 'perUser', t: '$ / user / mo', num: true },
  { k: 'tps', t: 'tok/s', num: true },
]

interface Props {
  rows: Row[]
  hidden: Row[]
  ci: CostInputs
  onCsv: () => void
}

function GovChip({ r }: { r: Row }) {
  if (r.kind === 'local') return <span className="chip chip-no">On-prem</span>
  if (!r.gov) return <span className="chip chip-no">No</span>
  return <span className="chip chip-gov">{r.il ? 'IL4/IL5' : 'FedRAMP High'}</span>
}

export function Ledger({ rows, hidden, ci, onCsv }: Props) {
  const [sortKey, setSortKey] = useState<Key>('cost')
  const [sortDir, setSortDir] = useState(1)

  const sortBy = (k: Key) => {
    if (k === sortKey) setSortDir((d) => -d)
    else {
      setSortKey(k)
      setSortDir(k === 'idx' || k === 'tps' || k === 'gov' ? -1 : 1)
    }
  }

  const cmp = (a: Row, b: Row) => {
    let A: unknown = a[sortKey]
    let B: unknown = b[sortKey]
    if (typeof A === 'boolean' || typeof B === 'boolean') {
      A = A ? 1 : 0
      B = B ? 1 : 0
    }
    if (A == null) return 1
    if (B == null) return -1
    return (typeof A === 'string' ? A.localeCompare(B as string) : (A as number) - (B as number)) * sortDir
  }

  const line = (r: Row, dim: boolean) => {
    const rt = r.model ? rates(r.model, ci, 1) : null
    const front = r.frontier && !dim
    return (
      <tr key={r.id} className={(front ? css.frontier : '') + (dim ? ' ' + css.dim : '')}>
        <th scope="row" className={css.model}>
          <i className="dot" style={r.kind === 'ref' ? { border: '2px solid var(--s-ref)' } : { background: COLOR[r.kind] }} />
          <span>{r.name}</span>
          {front && <span className="chip chip-f">frontier</span>}
        </th>
        <td>{KIND_LABEL[r.kind]}</td>
        <td>{r.origin === 'China' ? <span className="chip chip-cn">China</span> : r.origin}</td>
        <td>
          <GovChip r={r} />
        </td>
        <td className={css.num}>
          <span className={css.bar} style={{ width: `${(r.idx / 60) * 56}px` }} aria-hidden="true" />
          {r.idx}
        </td>
        <td className={css.num}>{rt ? price(rt.pi) + (rt.est ? '*' : '') : '—'}</td>
        <td className={css.num}>{rt ? price(rt.po) + (rt.est ? '*' : '') : '—'}</td>
        <td className={css.num + ' ' + css.strong}>{dim ? '—' : money(r.cost)}</td>
        <td className={css.num}>{dim ? '—' : money(r.perUser)}</td>
        <td className={css.num}>{r.tps || '—'}</td>
      </tr>
    )
  }

  return (
    <section className={css.section} id="ledger" aria-labelledby="ledger-h">
      <div className={css.head}>
        <div>
          <h2 id="ledger-h">Rate schedule</h2>
          <p>
            The model ledger: every model's rates and your team's monthly cost. Select a column to sort. Bold rows are on the Pareto frontier: no other
            model in view is both cheaper and smarter.
          </p>
        </div>
        <button type="button" className="btn" onClick={onCsv}>
          <Download aria-hidden="true" />
          Download CSV
        </button>
      </div>

      <p className="swipe-hint">Swipe the table sideways for prices, team cost and speed.</p>
      <div className={css.scroll + ' scroll-x'} tabIndex={0} role="region" aria-labelledby="ledger-h">
        <table className={css.table}>
          <thead>
            <tr>
              {COLS.map((c) => {
                const on = sortKey === c.k
                const Icon = on ? (sortDir > 0 ? ArrowUp : ArrowDown) : ChevronsUpDown
                return (
                  <th key={c.k} scope="col" className={c.num ? css.num : undefined} aria-sort={on ? (sortDir > 0 ? 'ascending' : 'descending') : undefined}>
                    <button type="button" className={css.sort + (on ? ' ' + css.sortOn : '')} onClick={() => sortBy(c.k)}>
                      {c.t}
                      <Icon aria-hidden="true" />
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {[...rows].sort(cmp).map((r) => line(r, false))}
            {hidden.length > 0 && (
              <tr className={css.divider}>
                <td colSpan={COLS.length}>Hidden by your filters · {hidden.length}</td>
              </tr>
            )}
            {[...hidden].sort(cmp).map((r) => line(r, true))}
          </tbody>
        </table>
      </div>
      {ci.gov && <p className={css.foot}>* GovCloud price not published on the pages checked; commercial rate shown. Prices include the selected service tier.</p>}
      {!ci.gov && <p className={css.foot}>Prices per 1M tokens include the selected service tier.</p>}
    </section>
  )
}
