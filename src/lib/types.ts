export type Kind = 'closed' | 'open' | 'ref'

export interface Model {
  id: string
  name: string
  maker: string
  origin: string
  kind: Kind
  /** USD per 1M input tokens, commercial region */
  pi: number
  /** USD per 1M output tokens, commercial region */
  po: number
  /** Artificial Analysis Intelligence Index */
  idx: number
  /** Output tokens per second, null when not reported */
  tps: number | null
  /** Listed for AWS GovCloud (US) at FedRAMP High */
  gov: boolean
  /** Cleared for DoD IL4/IL5 */
  il: boolean
  govPi?: number
  govPo?: number
  /** GovCloud price is an estimate */
  govEst?: boolean
  /** Long-prompt tier: above `tokens` input tokens per call, bill at these rates */
  over?: { tokens: number; pi: number; po: number }
}

export interface LocalModel {
  id: string
  name: string
  origin: string
  idx: number
  hw: number
  tput: number
  pre: number
  wact: number
  widle: number
  setup: string
}

export interface Task {
  id: string
  name: string
  size: string
  calls: number
  inPer: number
  outPer: number
  /** Share of input that is cached on repeat calls (0–1) */
  cache: number
  custom?: boolean
}

export interface Group {
  id: string
  name: string
  hint: string
  headcount: number
  perDay: Record<string, number>
}

export type Think = 1 | 2 | 4
export type Tier = 1 | 0.5 | 1.75

/** Everything the user can change. Serialized to the URL. */
export interface Scenario {
  heads: Record<string, number>
  /** Active-user share as a percentage, 10–100 */
  adopt: number
  days: number
  think: Think
  cache: boolean
  noCN: boolean
  gov: boolean
  il: boolean
  tier: Tier
  /** counts[groupId][taskId] = tasks per active person per workday */
  counts: Record<string, Record<string, number>>
  customTasks: Task[]
  localId: string
  hw: number
  life: number
  tput: number
  pre: number
  wact: number
  widle: number
  kwh: number
  hours: number
  ops: number
  logX: boolean
  pick: string
}

/** The numeric inputs the cost model reads, already clamped. */
export interface CostInputs {
  heads: Record<string, number>
  /** Active share, 0–1 */
  adopt: number
  days: number
  think: number
  cache: boolean
  noCN: boolean
  gov: boolean
  il: boolean
  tier: number
  counts: Record<string, Record<string, number>>
  hw: number
  life: number
  tput: number
  pre: number
  wact: number
  widle: number
  kwh: number
  hours: number
  ops: number
}

export interface LocalResult {
  cost: number
  boxes: number
  gpuHoursDay: number
  util: number
}

export type RowKind = Kind | 'local'

export interface Row {
  id: string
  name: string
  maker: string
  origin: string
  kind: RowKind
  idx: number
  tps: number | null
  pi?: number
  po?: number
  gov: boolean | null
  il: boolean | null
  cost: number
  perUser: number
  est: boolean
  frontier: boolean
  model?: Model
  local?: LocalResult
}
