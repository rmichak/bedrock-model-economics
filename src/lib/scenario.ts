import { GROUPS, LOCAL_MODELS, MODELS, TASKS } from './data'
import type { CostInputs, LocalModel, Scenario, Task, Think, Tier } from './types'

const THINKS: Think[] = [1, 2, 4]
const TIERS: Tier[] = [1, 0.5, 1.75]
const LOCAL_FIELDS = ['hw', 'tput', 'pre', 'wact', 'widle'] as const

export const DEFAULT_LOCAL_ID = 'local-gemma-4-31b'
export const DEFAULT_PICK = 'claude-sonnet-5-5'

export function findLocal(id: string): LocalModel {
  return LOCAL_MODELS.find((l) => l.id === id) ?? LOCAL_MODELS[0]
}

export function defaultScenario(): Scenario {
  const local = findLocal(DEFAULT_LOCAL_ID)
  return {
    heads: Object.fromEntries(GROUPS.map((g) => [g.id, g.headcount])),
    adopt: 60,
    days: 21,
    think: 2,
    cache: true,
    noCN: true,
    gov: false,
    il: false,
    tier: 1,
    counts: Object.fromEntries(GROUPS.map((g) => [g.id, { ...g.perDay }])),
    customTasks: [],
    localId: local.id,
    hw: local.hw,
    tput: local.tput,
    pre: local.pre,
    wact: local.wact,
    widle: local.widle,
    life: 36,
    kwh: 0.2,
    hours: 10,
    ops: 0,
    logX: true,
    pick: DEFAULT_PICK,
  }
}

export function allTasks(s: Scenario): Task[] {
  return [...TASKS, ...s.customTasks]
}

/** Clamp user inputs the same way the prototype's readState did. */
export function toCostInputs(s: Scenario): CostInputs {
  return {
    heads: Object.fromEntries(GROUPS.map((g) => [g.id, Math.max(0, s.heads[g.id] ?? 0)])),
    adopt: s.adopt / 100,
    days: Math.max(1, s.days),
    think: s.think,
    cache: s.cache,
    noCN: s.noCN,
    gov: s.gov,
    il: s.il && s.gov,
    tier: s.tier,
    counts: s.counts,
    hw: s.hw,
    life: Math.max(1, s.life),
    tput: Math.max(1, s.tput),
    pre: Math.max(1, s.pre),
    wact: s.wact,
    widle: s.widle,
    kwh: s.kwh,
    hours: Math.min(24, Math.max(1, s.hours)),
    ops: s.ops,
  }
}

/** Local models allowed under the China filter. */
export function allowedLocals(noCN: boolean): LocalModel[] {
  return LOCAL_MODELS.filter((l) => !(noCN && l.origin === 'China'))
}

function withLocal(s: Scenario, id: string): Scenario {
  const l = findLocal(id)
  return { ...s, localId: l.id, hw: l.hw, tput: l.tput, pre: l.pre, wact: l.wact, widle: l.widle }
}

/** Give custom tasks ids that match their position (u0, u1…) so URLs stay stable. */
function reindexCustom(s: Scenario): Scenario {
  const rename: Record<string, string> = {}
  const customTasks = s.customTasks.map((t, i) => {
    rename[t.id] = 'u' + i
    return { ...t, id: 'u' + i }
  })
  const counts: Scenario['counts'] = {}
  for (const [gid, row] of Object.entries(s.counts)) {
    counts[gid] = {}
    for (const [tid, v] of Object.entries(row)) {
      if (tid.startsWith('u') && !TASKS.some((t) => t.id === tid)) {
        if (rename[tid]) counts[gid][rename[tid]] = v
      } else counts[gid][tid] = v
    }
  }
  return { ...s, customTasks, counts }
}

export type Action =
  | { type: 'patch'; patch: Partial<Scenario> }
  | { type: 'head'; group: string; value: number }
  | { type: 'count'; group: string; task: string; value: number }
  | { type: 'noCN'; value: boolean }
  | { type: 'local'; id: string }
  | { type: 'addTask'; name: string; inPer: number; outPer: number }
  | { type: 'removeTask'; id: string }
  | { type: 'reset' }
  | { type: 'load'; scenario: Scenario }

export function reducer(s: Scenario, a: Action): Scenario {
  switch (a.type) {
    case 'patch':
      return { ...s, ...a.patch }
    case 'head':
      return { ...s, heads: { ...s.heads, [a.group]: Math.max(0, a.value) } }
    case 'count':
      return { ...s, counts: { ...s.counts, [a.group]: { ...s.counts[a.group], [a.task]: Math.max(0, a.value) } } }
    case 'noCN': {
      const next = { ...s, noCN: a.value }
      const ok = allowedLocals(a.value)
      return ok.some((l) => l.id === s.localId) ? next : withLocal(next, ok[0].id)
    }
    case 'local':
      return withLocal(s, a.id)
    case 'addTask': {
      const id = 'u' + s.customTasks.length
      const task: Task = {
        id,
        name: a.name,
        size: 'Your task',
        calls: 1,
        inPer: Math.max(0, Math.round(a.inPer)),
        outPer: Math.max(0, Math.round(a.outPer)),
        cache: 0,
        custom: true,
      }
      const counts = Object.fromEntries(GROUPS.map((g) => [g.id, { ...s.counts[g.id], [id]: 1 }]))
      return { ...s, customTasks: [...s.customTasks, task], counts }
    }
    case 'removeTask': {
      const counts = Object.fromEntries(
        Object.entries(s.counts).map(([gid, row]) => {
          const { [a.id]: _gone, ...rest } = row
          void _gone
          return [gid, rest]
        }),
      )
      return reindexCustom({ ...s, customTasks: s.customTasks.filter((t) => t.id !== a.id), counts })
    }
    case 'reset':
      return defaultScenario()
    case 'load':
      return a.scenario
  }
}

// ---------- URL encoding: only what differs from the defaults ----------

const num = (v: string | null): number | null => {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function encodeScenario(s: Scenario): string {
  const d = defaultScenario()
  const p = new URLSearchParams()
  const heads = GROUPS.map((g) => s.heads[g.id] ?? 0)
  if (heads.some((v, i) => v !== GROUPS[i].headcount)) p.set('h', heads.join('_'))
  if (s.adopt !== d.adopt) p.set('a', String(s.adopt))
  if (s.days !== d.days) p.set('d', String(s.days))
  if (s.think !== d.think) p.set('t', String(s.think))
  if (s.cache !== d.cache) p.set('c', s.cache ? '1' : '0')
  if (s.noCN !== d.noCN) p.set('cn', s.noCN ? '1' : '0')
  if (s.gov) p.set('g', '1')
  if (s.il) p.set('il', '1')
  if (s.tier !== d.tier) p.set('tr', String(s.tier))
  const counts: string[] = []
  for (const g of GROUPS) {
    for (const t of allTasks(s)) {
      const v = s.counts[g.id]?.[t.id] ?? 0
      const base = t.custom ? undefined : g.perDay[t.id] ?? 0
      if (v !== base) counts.push(`${g.id}-${t.id}-${v}`)
    }
  }
  if (counts.length) p.set('k', counts.join('~'))
  for (const t of s.customTasks) p.append('u', `${t.inPer}.${t.outPer}.${t.name}`)
  if (s.localId !== d.localId) p.set('l', s.localId)
  const local = findLocal(s.localId)
  const short: Record<(typeof LOCAL_FIELDS)[number], string> = { hw: 'hw', tput: 'tp', pre: 'pr', wact: 'wa', widle: 'wi' }
  for (const f of LOCAL_FIELDS) if (s[f] !== local[f]) p.set(short[f], String(s[f]))
  if (s.life !== d.life) p.set('lf', String(s.life))
  if (s.kwh !== d.kwh) p.set('kw', String(s.kwh))
  if (s.hours !== d.hours) p.set('hr', String(s.hours))
  if (s.ops !== d.ops) p.set('op', String(s.ops))
  if (!s.logX) p.set('x', 'lin')
  if (s.pick !== d.pick) p.set('m', s.pick)
  return p.toString()
}

export function decodeScenario(query: string): Scenario {
  const p = new URLSearchParams(query)
  let s = defaultScenario()

  const h = p.get('h')
  if (h) {
    const parts = h.split('_').map((v) => num(v))
    GROUPS.forEach((g, i) => {
      const v = parts[i]
      if (v != null && v >= 0) s.heads[g.id] = v
    })
  }
  const a = num(p.get('a'))
  if (a != null) s.adopt = Math.min(100, Math.max(10, a))
  const d = num(p.get('d'))
  if (d != null) s.days = Math.min(31, Math.max(1, d))
  const t = num(p.get('t'))
  if (t != null && THINKS.includes(t as Think)) s.think = t as Think
  if (p.get('c') === '0') s.cache = false
  if (p.get('cn') === '0') s.noCN = false
  if (p.get('g') === '1') s.gov = true
  if (p.get('il') === '1') s.il = true
  const tr = num(p.get('tr'))
  if (tr != null && TIERS.includes(tr as Tier)) s.tier = tr as Tier

  p.getAll('u').forEach((raw, i) => {
    const m = raw.match(/^(\d+)\.(\d+)\.(.+)$/)
    if (!m) return
    const id = 'u' + i
    s.customTasks.push({ id, name: m[3].slice(0, 80), size: 'Your task', calls: 1, inPer: +m[1], outPer: +m[2], cache: 0, custom: true })
    for (const g of GROUPS) s.counts[g.id][id] = 0
  })
  const k = p.get('k')
  if (k) {
    const taskIds = new Set(allTasks(s).map((x) => x.id))
    for (const entry of k.split('~')) {
      const [gid, tid, raw] = entry.split('-')
      const v = num(raw ?? null)
      if (s.counts[gid] && taskIds.has(tid) && v != null && v >= 0) s.counts[gid][tid] = v
    }
  }

  const l = p.get('l')
  if (l && LOCAL_MODELS.some((x) => x.id === l)) s = { ...s, ...pickLocal(l) }
  if (s.noCN && findLocal(s.localId).origin === 'China') s = { ...s, ...pickLocal(allowedLocals(true)[0].id) }
  const pairs: [keyof Scenario, string][] = [
    ['hw', 'hw'], ['tput', 'tp'], ['pre', 'pr'], ['wact', 'wa'], ['widle', 'wi'],
    ['life', 'lf'], ['kwh', 'kw'], ['hours', 'hr'], ['ops', 'op'],
  ]
  for (const [key, q] of pairs) {
    const v = num(p.get(q))
    if (v != null && v >= 0) (s as unknown as Record<string, number>)[key] = v
  }
  if (p.get('x') === 'lin') s.logX = false
  const m = p.get('m')
  if (m && MODELS.some((x) => x.id === m)) s.pick = m
  return s
}

function pickLocal(id: string): Partial<Scenario> {
  const l = findLocal(id)
  return { localId: l.id, hw: l.hw, tput: l.tput, pre: l.pre, wact: l.wact, widle: l.widle }
}
