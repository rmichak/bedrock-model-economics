import { Info } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { fmtShort, money, price } from '../lib/format'
import { COLOR, KIND_LABEL } from '../lib/series'
import type { Row } from '../lib/types'
import css from './Chart.module.css'

interface Props {
  rows: Row[]
  frontier: Row[]
  logX: boolean
  onScale: (log: boolean) => void
  valueId?: string
  hiddenNote: string | null
}

interface Tip {
  row: Row
  x: number
  y: number
}

const radius = (r: Row) => (r.kind === 'local' ? 9 : r.tps ? 3.5 + Math.sqrt(r.tps) * 0.75 : 5)

export function Chart({ rows, frontier, logX, onScale, valueId, hiddenNote }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)
  const [tip, setTip] = useState<Tip | null>(null)
  const hasData = rows.some((r) => r.cost > 0)

  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    setWidth(Math.round(el.clientWidth))
    return () => ro.disconnect()
  }, [hasData])

  const W = Math.max(300, width)
  const narrow = W < 560
  const H = narrow ? 420 : 520
  const M = { l: narrow ? 38 : 48, r: narrow ? 12 : 24, t: 16, b: 44 }
  const costs = rows.map((r) => r.cost).filter((c) => c > 0 && Number.isFinite(c))

  const header = (
    <div className={css.head}>
      <div className={css.legend} aria-label="Legend">
        <span>
          <i className="dot" style={{ background: 'var(--s-closed)' }} />
          Closed, on Bedrock
        </span>
        <span>
          <i className="dot" style={{ background: 'var(--s-open)' }} />
          Open-weight, on Bedrock
        </span>
        <span>
          <i className="dot" style={{ background: 'var(--s-local)' }} />
          Self-hosted on-prem
        </span>
        <span>
          <i className="dot" style={{ border: '2px solid var(--s-ref)' }} />
          Not on Bedrock
        </span>
        <span>
          <i className={css.dash} />
          Pareto frontier
        </span>
        <span>
          <i className={css.hlSwatch} />
          Best value
        </span>
      </div>
      <div className={css.toggle} role="group" aria-label="Cost axis scale">
        <button type="button" aria-pressed={logX} onClick={() => onScale(true)}>
          Log $
        </button>
        <button type="button" aria-pressed={!logX} onClick={() => onScale(false)}>
          Linear $
        </button>
      </div>
    </div>
  )

  const note = hiddenNote && (
    <p className={css.hidden}>
      <Info aria-hidden="true" />
      <span>{hiddenNote}</span>
    </p>
  )

  if (!costs.length) {
    return (
      <div className={css.card}>
        {header}
        {note}
        <div ref={boxRef} className={css.empty}>
          <p>Nothing to plot yet. Add people to your team, or loosen the policy filters, and every model's monthly bill will appear here.</p>
        </div>
      </div>
    )
  }

  let xmin: number
  let xmax: number
  if (logX) {
    xmin = 10 ** Math.floor(Math.log10(Math.min(...costs)))
    xmax = 10 ** Math.ceil(Math.log10(Math.max(...costs)))
    if (xmax === xmin) xmax = xmin * 10
  } else {
    xmin = 0
    const mx = Math.max(...costs)
    const step = 10 ** Math.floor(Math.log10(mx))
    xmax = Math.ceil(mx / step) * step
    if (xmax / step < 4) xmax = Math.ceil(mx / (step / 2)) * (step / 2)
  }
  const plotW = W - M.l - M.r
  const X = (v: number) =>
    logX
      ? M.l + ((Math.log10(Math.max(v, xmin)) - Math.log10(xmin)) / (Math.log10(xmax) - Math.log10(xmin))) * plotW
      : M.l + ((v - xmin) / (xmax - xmin)) * plotW
  const Y = (v: number) => M.t + (1 - v / 60) * (H - M.t - M.b)

  const yTicks = [0, 10, 20, 30, 40, 50, 60]
  const xTicks: number[] = []
  if (logX) {
    // Bounded: a decade per step, never more than 24 decades.
    for (let v = xmin, i = 0; v <= xmax * 1.0001 && i < 24; v *= 10, i++) {
      xTicks.push(v)
      if (!narrow && v * 3 < xmax) xTicks.push(v * 3)
    }
    xTicks.sort((a, b) => a - b)
  } else {
    const n = narrow ? 4 : 6
    for (let i = 0; i <= n; i++) xTicks.push(xmin + ((xmax - xmin) * i) / n)
  }

  const pts = rows.map((r) => ({ r, x: X(r.cost), y: Y(r.idx), rad: radius(r) }))
  const byId = new Map(pts.map((p) => [p.r.id, p]))
  const frontierD = frontier
    .map((r, i) => {
      const p = byId.get(r.id)!
      return (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)
    })
    .join(' ')

  // "Up and to the left" note sits in the plot's top-left corner; labels steer around it.
  const compact = W < 480
  const ann = { x: M.l + 10, y: M.t + 8, w: narrow ? 128 : 196, h: narrow ? 18 : 34 }
  type Box = { x: number; y: number; w: number; h: number }
  const hits = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  const dots = pts.map((p) => {
    const pad = p.r.id === valueId ? 9 : 2
    return { id: p.r.id, x: p.x - p.rad - pad, y: p.y - p.rad - pad, w: (p.rad + pad) * 2, h: (p.rad + pad) * 2 }
  })
  // The frontier line, sampled into small boxes, so labels avoid being struck through.
  const line: Box[] = []
  frontier.forEach((r, i) => {
    if (!i) return
    const a = byId.get(frontier[i - 1].id)!
    const b = byId.get(r.id)!
    const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 6))
    for (let k = 0; k <= n; k++) line.push({ x: a.x + ((b.x - a.x) * k) / n - 2, y: a.y + ((b.y - a.y) * k) / n - 2, w: 4, h: 4 })
  })
  // Pick the corner note that fits: the full sentence, a short one, or just "Better".
  const annText = [
    { t: 'Up and left: smarter, cheaper', sub: true, w: 196, h: 34 },
    { t: 'Smarter, cheaper', sub: false, w: 128, h: 18 },
    { t: 'Better', sub: false, w: 74, h: 18 },
  ]
    .filter((o) => !narrow || !o.sub)
    .find((o) => !dots.some((d) => hits({ x: M.l + 10, y: M.t + 8, w: o.w, h: o.h }, d)))
  if (annText) Object.assign(ann, { w: annText.w, h: annText.h })
  else Object.assign(ann, { w: 0, h: 0 })
  const placed: Box[] = [ann]
  const labels = pts
    .filter((p) => p.r.frontier || p.r.kind === 'local')
    .sort((a, b) => a.y - b.y)
    .map((p) => {
      const sub = fmtShort(p.r.cost) + ' · ' + p.r.idx
      const w = (compact ? p.r.name.length : Math.max(p.r.name.length, sub.length)) * 6.6 + 6
      const h = compact ? 16 : 28
      const g = p.rad + 6
      // Try each side of the point; keep the spot that hits the fewest labels, then the fewest bubbles.
      const spots: [number, number][] = [
        [p.x + g, p.y - h / 2],
        [p.x - g - w, p.y - h / 2],
        [p.x + g, p.y - h - 2],
        [p.x + g, p.y + 2],
        [p.x - g - w, p.y - h - 2],
        [p.x - g - w, p.y + 2],
        [p.x - w / 2, p.y - p.rad - 4 - h],
        [p.x - w / 2, p.y + p.rad + 4],
      ]
      let best: Box | null = null
      let bestScore = Infinity
      spots.forEach(([x, y], i) => {
        const b = { x, y, w, h }
        if (x < M.l - 4 || x + w > W - M.r + 8 || y < M.t - 6 || y + h > H - M.b) return
        const score =
          placed.filter((q) => hits(b, q)).length * 10 +
          dots.filter((q) => q.id !== p.r.id && hits(b, q)).length * 2 +
          (line.some((q) => hits(b, q)) ? 1.5 : 0) +
          i * 0.01
        if (score < bestScore) {
          best = b
          bestScore = score
        }
      })
      if (!best || bestScore >= 10) {
        // The prototype's rule: beside the point, nudged down past any label it would cover.
        const left = p.x + g + w > W - M.r
        const x = left ? p.x - g - w : p.x + g
        let y = p.y - 12
        for (let i = 0; i < 12; i++) {
          const hb = placed.find((q) => hits({ x, y, w, h }, q))
          if (!hb) break
          y = hb.y + hb.h + 2
        }
        best = { x, y: Math.min(Math.max(y, M.t), H - M.b - h), w, h }
      }
      const b: Box = best
      placed.push(b)
      // A leader line when the label had to move away from its point.
      const nx = Math.min(Math.max(p.x, b.x), b.x + b.w)
      const ny = Math.min(Math.max(p.y, b.y + 2), b.y + b.h - 2)
      const dist = Math.hypot(nx - p.x, ny - p.y)
      const leader =
        dist > p.rad + 12
          ? `M${(p.x + ((nx - p.x) * (p.rad + 2)) / dist).toFixed(1)} ${(p.y + ((ny - p.y) * (p.rad + 2)) / dist).toFixed(1)} L${nx.toFixed(1)} ${ny.toFixed(1)}`
          : null
      return { r: p.r, x: b.x, y: b.y, sub, leader }
    })

  const show = (p: (typeof pts)[number]) => setTip({ row: p.r, x: p.x, y: p.y })
  const hide = (id: string) => setTip((t) => (t && t.row.id === id ? null : t))

  const tipLeft = tip ? (tip.x + 14 + 260 > W ? Math.max(0, tip.x - 274) : tip.x + 14) : 0
  const tipTop = tip ? Math.max(0, tip.y - 10) : 0

  const frontierNames = frontier.map((r) => r.name).join(', ')

  return (
    <div className={css.card}>
      {header}
      {note}
      <div ref={boxRef} className={css.box} onKeyDown={(e) => e.key === 'Escape' && setTip(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className={css.svg} role="group" aria-labelledby="chart-title" aria-describedby="chart-desc">
          <title id="chart-title">Team monthly cost against Artificial Analysis Intelligence Index</title>
          <desc id="chart-desc">
            {`${rows.length} models plotted. Pareto frontier, cheapest first: ${frontierNames}. Use Tab to move through points; the model ledger below lists the same data as a table.`}
          </desc>

          <defs>
            <radialGradient id="land" gradientUnits="userSpaceOnUse" cx={M.l} cy={M.t} r={Math.min(plotW, H - M.t - M.b) * 0.75}>
              <stop offset="0" stopColor="var(--hl)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--hl)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g aria-hidden="true">
            <rect x={M.l} y={M.t} width={plotW} height={H - M.t - M.b} fill="url(#land)" className={css.land} />
            {yTicks.map((v) => (
              <g key={'y' + v}>
                <line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} className={css.grid} />
                <text x={M.l - 8} y={Y(v) + 4} textAnchor="end" className={css.tick}>
                  {v}
                </text>
              </g>
            ))}
            {xTicks.map((v) => (
              <g key={'x' + v}>
                <line x1={X(v)} x2={X(v)} y1={M.t} y2={H - M.b} className={css.grid} />
                <text x={X(v)} y={H - M.b + 18} textAnchor="middle" className={css.tick}>
                  {fmtShort(v)}
                </text>
              </g>
            ))}
            <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} className={css.axis} />
            <text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" className={css.axisTitle}>
              {'Team cost per month (USD)' + (logX ? ', log scale' : '')}
            </text>
            <text x={12} y={(M.t + H - M.b) / 2} textAnchor="middle" className={css.axisTitle} transform={`rotate(-90 12 ${(M.t + H - M.b) / 2})`}>
              AA Intelligence Index
            </text>

            {annText && (
              <g className={css.ann}>
                <path d={`M${ann.x + 18} ${ann.y + 18} L${ann.x + 4} ${ann.y + 4} M${ann.x + 4} ${ann.y + 12} L${ann.x + 4} ${ann.y + 4} L${ann.x + 12} ${ann.y + 4}`} />
                <text x={ann.x + 24} y={ann.y + 14}>
                  {annText.t}
                </text>
                {annText.sub && (
                  <text x={ann.x + 24} y={ann.y + 28} className={css.annSub}>
                    where you want to land
                  </text>
                )}
              </g>
            )}

            <path d={frontierD} className={css.frontier} />
          </g>

          {[...pts]
            .sort((a, b) => b.rad - a.rad)
            .map((p) => {
              const r = p.r
              const hollow = r.kind === 'ref'
              const dashed = !r.tps && r.kind !== 'local'
              const active = tip?.row.id === r.id
              const color = COLOR[r.kind]
              return (
                <g key={r.id} className={css.pt} style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
                  {r.id === valueId && <circle r={p.rad + 7} className={css.halo} />}
                  <circle
                    r={p.rad}
                    className={css.dot}
                    style={{
                      fill: hollow ? 'var(--paper)' : color,
                      fillOpacity: dashed ? 0.45 : hollow ? 1 : 0.9,
                      stroke: active ? 'var(--ink)' : hollow || dashed ? color : 'var(--paper)',
                      strokeDasharray: dashed ? '2 2' : undefined,
                    }}
                  />
                  <circle
                    r={Math.max(p.rad + 5, 12)}
                    className={css.hit}
                    tabIndex={0}
                    role="img"
                    aria-label={`${r.name}, ${KIND_LABEL[r.kind]}, index ${r.idx}, ${money(r.cost)} per month${r.frontier ? ', on the frontier' : ''}`}
                    onMouseEnter={() => show(p)}
                    onMouseLeave={() => hide(r.id)}
                    onFocus={() => show(p)}
                    onBlur={() => hide(r.id)}
                    onClick={() => show(p)}
                  />
                </g>
              )
            })}

          <g aria-hidden="true">
            {labels.map((l) => l.leader && <path key={'lead-' + l.r.id} d={l.leader} className={css.leader} />)}
            {labels.map((l) => (
              <g key={l.r.id} className={css.label} style={{ transform: `translate(${l.x}px, ${l.y}px)` }}>
                <text x={3} y={11} className={css.labelName}>
                  {l.r.name}
                </text>
                {!compact && (
                  <text x={3} y={24} className={css.labelSub}>
                    {l.sub}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>

        {tip && (
          <div className={css.tip} style={{ left: tipLeft, top: tipTop }} aria-hidden="true">
            <TipBody r={tip.row} />
          </div>
        )}
      </div>
      <p className={css.foot}>
        Team cost per month. Bubble area shows output speed; a dashed outline means speed isn't reported. Labels mark frontier models and the local box.
        Hover, tap or Tab to any point for details.
      </p>
    </div>
  )
}

function TipBody({ r }: { r: Row }) {
  const flags = [r.origin === 'China' ? 'Developed in China' : null, r.gov === true ? 'GovCloud' + (r.il ? ' · IL4/IL5' : '') : null]
    .filter(Boolean)
    .join(' · ')
  return (
    <>
      <p className={css.tipName}>{r.name}</p>
      <p>
        {KIND_LABEL[r.kind]} · {r.maker}
      </p>
      {flags && <p>{flags}</p>}
      <p className={css.tipNums}>
        Index <b>{r.idx}</b> · <b>{money(r.cost)}</b>/mo · <b>{money(r.perUser)}</b>/user
      </p>
      <p className={css.tipMuted}>
        {r.kind === 'local' && r.local
          ? `${r.local.boxes} box${r.local.boxes > 1 ? 'es' : ''} · ${(r.local.util * 100).toFixed(0)}% busy in business hours`
          : `${price(r.pi ?? 0)} in / ${price(r.po ?? 0)} out per 1M (commercial)`}
      </p>
    </>
  )
}
