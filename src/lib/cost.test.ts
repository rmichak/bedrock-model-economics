import { describe, expect, it } from 'vitest'
import { compute, isVisible, markFrontier, monthlyModelCost, rates, taskCost, verdicts } from './cost'
import { GROUPS, MODELS, TASKS } from './data'
import { allTasks, decodeScenario, defaultScenario, encodeScenario, findLocal, reducer, toCostInputs } from './scenario'
import type { CostInputs, Model, Task } from './types'

const model = (id: string): Model => {
  const m = MODELS.find((x) => x.id === id)
  if (!m) throw new Error('missing model ' + id)
  return m
}

const base: CostInputs = toCostInputs(defaultScenario())

describe('taskCost', () => {
  it('prices one long-document summary on Claude Sonnet 5.5 at $0.048 with Standard thinking', () => {
    const doc = TASKS.find((t) => t.id === 'doc')!
    expect(doc).toMatchObject({ calls: 1, inPer: 16000, outPer: 800, cache: 0 })
    expect(model('claude-sonnet-5-5')).toMatchObject({ pi: 2, po: 10 })
    expect(taskCost(model('claude-sonnet-5-5'), doc, { gov: false, tier: 1, think: 2, cache: false })).toBeCloseTo(0.048, 10)
  })

  it('bills cached input at 10% of the input rate', () => {
    const t: Task = { id: 'x', name: 'x', size: '', calls: 1, inPer: 1_000_000, outPer: 0, cache: 0.5 }
    const sonnet = model('claude-sonnet-5-5')
    // half fresh at $2, half cached at $0.20
    expect(taskCost(sonnet, t, { gov: false, tier: 1, think: 1, cache: true })).toBeCloseTo(1.1, 10)
    expect(taskCost(sonnet, t, { gov: false, tier: 1, think: 1, cache: false })).toBeCloseTo(2, 10)
  })
})

describe('flat workload: 30,000 requests a month at 4,000 in / 1,000 out, Light thinking, no cache', () => {
  const flat: Task = { id: 'flat', name: 'Flat', size: '', calls: 1, inPer: 4000, outPer: 1000, cache: 0 }
  const s: CostInputs = { ...base, think: 1, cache: false }
  const cases: [string, number][] = [
    ['claude-sonnet-5-5', 540],
    ['claude-opus-5-5', 1080],
    ['claude-haiku-5-5', 27],
    ['gpt-6-astra', 2700],
  ]
  for (const [id, expected] of cases) {
    it(`${id} costs $${expected}`, () => {
      expect(monthlyModelCost(model(id), [flat], s, { flat: 30000 })).toBeCloseTo(expected, 6)
    })
  }
})

describe('rates', () => {
  it('moves Claude Haiku 5.5 to $0.50 / $2.50 above 100K input tokens', () => {
    const haiku = model('claude-haiku-5-5')
    expect(rates(haiku, { gov: false, tier: 1 }, 120000)).toEqual({ pi: 0.5, po: 2.5, est: false })
    expect(rates(haiku, { gov: false, tier: 1 }, 100000)).toEqual({ pi: 0.1, po: 0.5, est: false })
  })

  it('uses GovCloud rates where published and flags estimates otherwise', () => {
    expect(rates(model('gpt-5-6-terra'), { gov: true, tier: 1 }, 1)).toEqual({ pi: 2.7, po: 16.2, est: false })
    expect(rates(model('grok-4-7'), { gov: true, tier: 1 }, 1)).toMatchObject({ pi: 2.2, est: true })
    expect(rates(model('claude-sonnet-5-5'), { gov: true, tier: 1 }, 1)).toEqual({ pi: 2, po: 10, est: true })
  })

  it('applies the service tier multiplier', () => {
    expect(rates(model('claude-sonnet-5-5'), { gov: false, tier: 0.5 }, 1)).toMatchObject({ pi: 1, po: 5 })
    expect(rates(model('claude-sonnet-5-5'), { gov: false, tier: 1.75 }, 1)).toMatchObject({ pi: 3.5, po: 17.5 })
  })
})

describe('default scenario', () => {
  const s = defaultScenario()
  const c = compute({ models: MODELS, groups: GROUPS, tasks: allTasks(s) }, findLocal(s.localId), toCostInputs(s))
  const cost = (id: string) => c.rows.find((r) => r.id === id)!.cost

  it('matches the prototype inputs', () => {
    expect(s.heads).toEqual({ staff: 40, analysts: 10, devs: 10, ops: 0 })
    expect([s.adopt, s.days, s.think, s.cache, s.noCN]).toEqual([60, 21, 2, true, true])
  })

  it('puts Claude Sonnet 5.5 at about $930 a month', () => {
    expect(Math.round(cost('claude-sonnet-5-5'))).toBe(930)
  })

  it('puts Claude Opus 5.5 at about $1,861 a month', () => {
    expect(Math.round(cost('claude-opus-5-5'))).toBe(1861)
  })

  it('counts 36 active users', () => {
    expect(c.active).toBe(36)
  })

  it('hides China-developed models by default', () => {
    expect(c.rows.some((r) => r.origin === 'China')).toBe(false)
    expect(c.hidden.map((r) => r.id)).toContain('deepseek-v3-2')
  })

  it('includes the local box on the chart', () => {
    expect(c.rows.find((r) => r.kind === 'local')?.name).toBe('Local · Gemma 4 31B')
  })

  it('produces verdicts', () => {
    const v = verdicts(c)!
    expect(v.top.id).toBe('claude-opus-5-5')
    expect(v.value.idx).toBeGreaterThanOrEqual(v.top.idx - 3)
  })
})

describe('on-prem sizing', () => {
  it('adds a box when the daily GPU-hours exceed business hours', () => {
    let s = defaultScenario()
    s = reducer(s, { type: 'head', group: 'staff', value: 4000 })
    const c = compute({ models: MODELS, groups: GROUPS, tasks: allTasks(s) }, findLocal(s.localId), toCostInputs(s))
    expect(c.lc.boxes).toBeGreaterThan(1)
    expect(c.lc.boxes).toBe(Math.ceil(c.lc.gpuHoursDay / 10))
  })
})

describe('visibility and frontier', () => {
  it('in GovCloud mode hides non-GovCloud and reference models; IL4/IL5 narrows further', () => {
    const gov = { noCN: true, gov: true, il: false }
    expect(isVisible(model('gemini-4-argon'), gov)).toBe(false)
    expect(isVisible(model('claude-fable-5-1'), gov)).toBe(false)
    expect(isVisible(model('claude-sonnet-5-5'), gov)).toBe(true)
    expect(isVisible(model('claude-sonnet-5-5'), { ...gov, il: true })).toBe(false)
    expect(isVisible(model('gpt-5-6-terra'), { ...gov, il: true })).toBe(true)
  })

  it('marks a point frontier only when it beats every cheaper point', () => {
    const pts = [
      { cost: 10, idx: 20, frontier: false },
      { cost: 20, idx: 15, frontier: false },
      { cost: 30, idx: 40, frontier: false },
      { cost: 30, idx: 35, frontier: false },
    ]
    const f = markFrontier(pts)
    expect(f.map((p) => p.idx)).toEqual([20, 40])
  })
})

describe('scenario URL', () => {
  it('encodes the default scenario as an empty query', () => {
    expect(encodeScenario(defaultScenario())).toBe('')
  })

  it('round-trips a changed scenario including a custom task', () => {
    let s = defaultScenario()
    s = reducer(s, { type: 'head', group: 'ops', value: 25 })
    s = reducer(s, { type: 'patch', patch: { adopt: 80, think: 4, gov: true, il: true, tier: 0.5, logX: false, pick: 'gpt-5-6-terra' } })
    s = reducer(s, { type: 'count', group: 'devs', task: 'agent', value: 3.5 })
    s = reducer(s, { type: 'addTask', name: 'Board brief, v2', inPer: 9000, outPer: 1200 })
    s = reducer(s, { type: 'count', group: 'analysts', task: 'u0', value: 2 })
    s = reducer(s, { type: 'local', id: 'local-gpt-oss-120b' })
    s = reducer(s, { type: 'patch', patch: { hw: 12500, kwh: 0.14 } })
    expect(decodeScenario(encodeScenario(s))).toEqual(s)
  })

  it('never writes a crafted __proto__ entry onto Object.prototype', () => {
    decodeScenario('k=__proto__-chat-7~constructor-chat-7')
    expect(({} as Record<string, unknown>).chat).toBeUndefined()
  })

  it('clamps huge link values so every cost stays finite', () => {
    const s = decodeScenario('h=1e300_1e300_1e300_1e300&k=staff-agent-1e300&hw=1e300&op=1e300&u=99999999999.99999999999.Huge')
    const c = compute({ models: MODELS, groups: GROUPS, tasks: allTasks(s) }, findLocal(s.localId), toCostInputs(s))
    expect([...c.rows, ...c.hidden].every((r) => Number.isFinite(r.cost))).toBe(true)
    expect(Number.isFinite(c.lc.cost)).toBe(true)
  })

  it('ignores junk values', () => {
    const s = decodeScenario('a=abc&t=3&tr=9&l=nope&m=nope&k=staff-chat-x~zz-chat-1')
    expect(s).toEqual(defaultScenario())
  })
})
