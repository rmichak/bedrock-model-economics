import { Check, Link2 } from 'lucide-react'
import type { Verdicts } from '../lib/cost'
import { money } from '../lib/format'
import { Mark } from './Masthead'
import css from './StickyBar.module.css'
import { Rolling } from './ui'

interface Props {
  visible: boolean
  v: Verdicts | null
  copied: boolean
  onCopy: () => void
}

/** Keeps the amount due in view while people edit the worksheet far below the statement stub. */
export function StickyBar({ visible, v, copied, onCopy }: Props) {
  return (
    <div className={css.bar} data-visible={visible || undefined} aria-hidden={!visible} inert={!visible}>
      <div className={css.inner}>
        <Mark className={css.mark} />
        {v ? (
          <p className={css.fig}>
            <span className={css.label}>Best value</span>
            <span className={css.name}>{v.value.name}</span>
            <span className={css.amount}>
              <span className="hl">
                <Rolling text={money(v.value.cost)} />
              </span>
              <span className={css.unit}>/mo</span>
            </span>
          </p>
        ) : (
          <p className={css.fig}>
            <span className={css.name}>No result: add people or loosen the filters</span>
          </p>
        )}
        {v && (
          <p className={css.fig + ' ' + css.secondary}>
            <span className={css.label}>Highest quality</span>
            <span className={css.name}>{v.top.name}</span>
            <span className={css.amount}>
              <Rolling text={money(v.top.cost)} />
              <span className={css.unit}>/mo</span>
            </span>
          </p>
        )}
        <button type="button" className="btn btn-primary" onClick={onCopy}>
          {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
          <span className={css.copyText}>{copied ? 'Link copied' : 'Copy link'}</span>
        </button>
      </div>
    </div>
  )
}
