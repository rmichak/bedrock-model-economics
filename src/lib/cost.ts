import type { CostInputs, Group, LocalModel, LocalResult, Model, Row, Task } from './types'

/** Cached input tokens bill at 10% of the input rate. */
export const CACHE_RATE = 0.1
/** Always-on hours per box per month, used for idle power. */
export const HOURS_PER_MONTH = 720

/** Team tasks per month for each task: Σ groups headcount × active share × per-day count × workdays. */
export function monthlyTaskCounts(tasks: Task[], groups: Group[], s: CostInputs): Record<string, number> {
  const out: Record<string, number> = {}
  for (const t of tasks) {
    let n = 0
    for (const g of groups) n += (s.heads[g.id] ?? 0) * s.adopt * (s.counts[g.id]?.[t.id] ?? 0) * s.days
    out[t.id] = n
  }
  return out
}

/** Effective per-1M rates for a model, including GovCloud pricing, the long-prompt tier and the service tier. */
export function rates(m: Model, s: Pick<CostInputs, 'gov' | 'tier'>, inPer: number) {
  let pi = m.pi
  let po = m.po
  let est = false
  if (s.gov && m.govPi != null && m.govPo != null) {
    pi = m.govPi
    po = m.govPo
    est = !!m.govEst
  } else if (s.gov) {
    est = true
  }
  if (m.over && inPer > m.over.tokens) {
    pi = m.over.pi
    po = m.over.po
  }
  return { pi: pi * s.tier, po: po * s.tier, est }
}

/** USD cost of one task on one model. */
export function taskCost(m: Model, t: Task, s: Pick<CostInputs, 'gov' | 'tier' | 'think' | 'cache'>): number {
  const r = rates(m, s, t.inPer)
  const inTok = t.calls * t.inPer
  const outTok = t.calls * t.outPer * s.think
  const cachedShare = s.cache ? t.cache : 0
  const inCost = inTok * ((1 - cachedShare) * r.pi + cachedShare * r.pi * CACHE_RATE)
  return (inCost + outTok * r.po) / 1e6
}

/** Model monthly cost = Σ tasks (team tasks per month × cost of one task). */
export function monthlyModelCost(m: Model, tasks: Task[], s: CostInputs, tc: Record<string, number>): number {
  let cost = 0
  for (const t of tasks) cost += (tc[t.id] ?? 0) * taskCost(m, t, s)
  return cost
}

export function monthlyTokens(tasks: Task[], s: Pick<CostInputs, 'think' | 'cache'>, tc: Record<string, number>) {
  let inTok = 0
  let outTok = 0
  let freshIn = 0
  for (const t of tasks) {
    const n = tc[t.id] ?? 0
    inTok += n * t.calls * t.inPer
    outTok += n * t.calls * t.outPer * s.think
    freshIn += n * t.calls * t.inPer * (1 - (s.cache ? t.cache : 0))
  }
  return { inTok, outTok, freshIn }
}

/** Monthly cost of self-hosting, sized so the team's daily work fits inside business hours. */
export function localCost(s: CostInputs, tokens: { outTok: number; freshIn: number }): LocalResult {
  const gpuHoursMonth = (tokens.outTok / s.tput + tokens.freshIn / s.pre) / 3600
  const gpuHoursDay = gpuHoursMonth / s.days
  const boxes = Math.max(1, Math.ceil(gpuHoursDay / s.hours))
  const totalH = boxes * HOURS_PER_MONTH
  const energy = ((gpuHoursMonth * s.wact + Math.max(0, totalH - gpuHoursMonth) * s.widle) / 1000) * s.kwh
  return {
    cost: (boxes * s.hw) / s.life + energy + s.ops,
    boxes,
    gpuHoursDay,
    util: gpuHoursDay / (boxes * s.hours),
  }
}

export function isVisible(m: Pick<Model, 'origin' | 'gov' | 'il'>, s: Pick<CostInputs, 'noCN' | 'gov' | 'il'>): boolean {
  if (s.noCN && m.origin === 'China') return false
  if (s.gov && !m.gov) return false
  if (s.gov && s.il && !m.il) return false
  return true
}

/** Marks rows on the Pareto frontier: sorted by cost, a point is on it when it beats every cheaper point's index. */
export function markFrontier<T extends { cost: number; idx: number; frontier: boolean }>(rows: T[]): T[] {
  const byCost = [...rows].sort((a, b) => a.cost - b.cost || b.idx - a.idx)
  let best = -1
  for (const r of byCost) {
    r.frontier = r.idx > best
    if (r.frontier) best = r.idx
  }
  return byCost.filter((r) => r.frontier)
}

export interface Computed {
  tc: Record<string, number>
  rows: Row[]
  hidden: Row[]
  frontier: Row[]
  lc: LocalResult
  local: LocalModel
  people: number
  active: number
  tasksPerMonth: number
  tokens: { inTok: number; outTok: number; freshIn: number }
}

export function compute(
  data: { models: Model[]; groups: Group[]; tasks: Task[] },
  local: LocalModel,
  s: CostInputs,
): Computed {
  const tc = monthlyTaskCounts(data.tasks, data.groups, s)
  const people = data.groups.reduce((a, g) => a + (s.heads[g.id] ?? 0), 0)
  const active = people * s.adopt
  const toRow = (m: Model): Row => ({
    id: m.id,
    name: m.name,
    maker: m.maker,
    origin: m.origin,
    kind: m.kind,
    idx: m.idx,
    tps: m.tps,
    pi: m.pi,
    po: m.po,
    gov: m.gov,
    il: m.il,
    cost: monthlyModelCost(m, data.tasks, s, tc),
    perUser: 0,
    est: rates(m, s, 1).est,
    frontier: false,
    model: m,
  })
  const rows = data.models.filter((m) => isVisible(m, s)).map(toRow)
  const hidden = data.models.filter((m) => !isVisible(m, s)).map(toRow)
  const tokens = monthlyTokens(data.tasks, s, tc)
  const lc = localCost(s, tokens)
  if (!(s.noCN && local.origin === 'China')) {
    rows.push({
      id: 'local',
      name: 'Local · ' + local.name,
      maker: 'Self-hosted',
      origin: local.origin,
      kind: 'local',
      idx: local.idx,
      tps: null,
      gov: null,
      il: null,
      cost: lc.cost,
      perUser: 0,
      est: false,
      frontier: false,
      local: lc,
    })
  }
  for (const r of [...rows, ...hidden]) r.perUser = active > 0 ? r.cost / active : 0
  const frontier = markFrontier(rows)
  const tasksPerMonth = Object.values(tc).reduce((a, b) => a + b, 0)
  return { tc, rows, hidden, frontier, lc, local, people, active, tasksPerMonth, tokens }
}

export interface Verdicts {
  top: Row
  value: Row
  local?: Row
  /** Cheapest visible Bedrock model scoring at least the local model's index */
  match?: Row
}

/** The four headline answers. Returns null when there is nothing to compare. */
export function verdicts(c: Computed): Verdicts | null {
  const api = c.rows.filter((r) => r.kind === 'closed' || r.kind === 'open')
  if (!api.length || c.active <= 0) return null
  const top = [...api].sort((a, b) => b.idx - a.idx)[0]
  const value = api.filter((r) => r.idx >= top.idx - 3).sort((a, b) => a.cost - b.cost)[0]
  const local = c.rows.find((r) => r.kind === 'local')
  const match = local ? api.filter((r) => r.idx >= local.idx).sort((a, b) => a.cost - b.cost)[0] : undefined
  return { top, value, local, match }
}
