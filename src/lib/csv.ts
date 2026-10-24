import { rates } from './cost'
import type { CostInputs, Row } from './types'

const KIND: Record<string, string> = { closed: 'Closed (Bedrock)', open: 'Open-weight (Bedrock)', ref: 'Not on Bedrock', local: 'Self-hosted on-prem' }

function cell(v: string | number | null | undefined): string {
  if (v == null) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

/** The model ledger at the current scenario, visible rows first, then rows hidden by filters. */
export function ledgerCsv(rows: Row[], hidden: Row[], ci: CostInputs, asOf: string): string {
  const head = [
    'Model', 'Maker', 'Where', 'Origin', 'GovCloud', 'IL4/IL5', 'AA Intelligence Index',
    'USD in per 1M (effective)', 'USD out per 1M (effective)', 'GovCloud price estimated',
    'Team USD per month', 'USD per active user per month', 'Output tok/s', 'Pareto frontier', 'Shown with current filters', 'Data as of',
  ]
  const line = (r: Row, shown: boolean) => {
    const rt = r.model ? rates(r.model, ci, 1) : null
    return [
      r.name, r.maker, KIND[r.kind], r.origin,
      r.gov == null ? '' : r.gov ? 'yes' : 'no',
      r.il == null ? '' : r.il ? 'yes' : 'no',
      r.idx,
      rt ? rt.pi.toFixed(4) : '', rt ? rt.po.toFixed(4) : '', rt ? (rt.est ? 'yes' : 'no') : '',
      shown ? r.cost.toFixed(2) : '', shown ? r.perUser.toFixed(2) : '',
      r.tps ?? '', shown && r.frontier ? 'yes' : 'no', shown ? 'yes' : 'no', asOf,
    ].map(cell).join(',')
  }
  return [head.map(cell).join(','), ...rows.map((r) => line(r, true)), ...hidden.map((r) => line(r, false))].join('\n') + '\n'
}

export function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
