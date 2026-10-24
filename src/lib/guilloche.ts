/** FNV-1a string hash, used to give every scenario its own security weave. */
export function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * Guilloché ribbon, the interlaced line band printed along cheques and statement envelopes.
 * Two mirrored families of envelope-modulated sine lines cross to form the lattice.
 * Point counts are fixed so a CSS `d` transition can morph one scenario's weave into the next.
 */
export function ribbon(seed: number, w: number, h: number, lines = 22): { a: string[]; b: string[] } {
  const u = (shift: number) => ((seed >>> shift) & 0xff) / 255
  // Wave count scales with the drawing width so narrow ribbons keep open, fine-line lattices.
  const waves = Math.max(3, Math.round((9 + u(0) * 5) * (w / 1440)))
  const f1 = (Math.PI * 2 * waves) / w
  const f2 = (Math.PI * 2 * (1.5 + u(8) * 1.5)) / w
  const ph0 = u(16) * Math.PI * 2
  const cy = h / 2
  const amp = h * 0.44
  const steps = 260
  const family = (dir: 1 | -1) => {
    const out: string[] = []
    for (let k = 0; k < lines; k++) {
      const ph = (k / lines) * Math.PI
      let d = ''
      for (let i = 0; i <= steps; i++) {
        const x = (w * i) / steps
        const env = 0.55 + 0.45 * Math.cos(f2 * x + ph0)
        const y = cy + dir * amp * env * Math.sin(f1 * x + ph)
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(2)
      }
      out.push(d)
    }
    return out
  }
  return { a: family(1), b: family(-1) }
}
