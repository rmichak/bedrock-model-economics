const trim0 = (s: string) => s.replace(/\.0$/, '')

/** Compact dollars for axis ticks and chart labels: $930, $1.9k, $27k, $1.2M. */
export function fmtShort(v: number): string {
  if (v >= 1e6) return '$' + trim0((v / 1e6).toFixed(1)) + 'M'
  if (v >= 10000) return '$' + Math.round(v / 1000) + 'k'
  if (v >= 1000) return '$' + trim0((v / 1000).toFixed(1)) + 'k'
  if (v >= 100) return '$' + Math.round(v)
  if (v >= 10) return '$' + v.toFixed(0)
  if (v >= 1) return '$' + trim0(v.toFixed(1))
  return '$' + v.toFixed(2)
}

/** Full dollars with precision that scales down for small amounts. */
export function money(v: number): string {
  if (v === 0) return '$0'
  if (v >= 100) return '$' + Math.round(v).toLocaleString('en-US')
  if (v >= 1) return '$' + v.toFixed(2)
  if (v >= 0.01) return '$' + v.toFixed(3)
  return '$' + v.toFixed(4)
}

/** Per-1M token price: $0.50, $2, $16.20. */
export function price(v: number): string {
  return '$' + (v < 1 ? v.toFixed(2) : v.toFixed(2).replace(/\.00$/, ''))
}

/** Token counts: 800, 1.5k, 16k, 2.4M, 1.1B. */
export function tok(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B'
  if (v >= 1e6) return trim0((v / 1e6).toFixed(1)) + 'M'
  if (v >= 1000) return trim0((v / 1000).toFixed(v >= 1e4 ? 0 : 1)) + 'k'
  return String(Math.round(v))
}

export function int(v: number): string {
  return Math.round(v).toLocaleString('en-US')
}

export function plural(n: number, one: string, many = one + 's'): string {
  return n === 1 ? one : many
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-10-23" → "Oct 23, 2026" without timezone drift. */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}
