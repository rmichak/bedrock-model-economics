import { Minus, Plus } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import css from './ui.module.css'

interface NumberInputProps {
  id?: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
}

/** Number input that tolerates an empty or half-typed draft without pushing NaN into the scenario. */
export function NumberInput({ id, value, onChange, min, max, step = 1, label, className }: NumberInputProps) {
  // While focused the field shows the typed draft; otherwise it mirrors the scenario value.
  const [draft, setDraft] = useState<string | null>(null)
  const shown = draft ?? String(value)
  const n = parseFloat(shown)
  const invalid = shown !== '' && (!Number.isFinite(n) || (min != null && n < min) || (max != null && n > max))
  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      className={'field ' + (className ?? '')}
      value={shown}
      min={min}
      max={max}
      step={step}
      aria-label={label}
      aria-invalid={invalid || undefined}
      onFocus={() => setDraft(String(value))}
      onBlur={() => setDraft(null)}
      onChange={(e) => {
        setDraft(e.target.value)
        const v = parseFloat(e.target.value)
        if (Number.isFinite(v)) onChange(max != null ? Math.min(max, Math.max(min ?? -Infinity, v)) : Math.max(min ?? -Infinity, v))
      }}
    />
  )
}

interface FieldProps {
  label: ReactNode
  hint?: ReactNode
  children: (id: string) => ReactNode
  className?: string
}

export function Field({ label, hint, children, className }: FieldProps) {
  const id = useId()
  return (
    <div className={css.field + ' ' + (className ?? '')}>
      <label htmlFor={id} className={css.label}>
        {label}
      </label>
      {children(id)}
      {hint && <p className={css.hint}>{hint}</p>}
    </div>
  )
}

interface StepperProps {
  value: number
  onChange: (v: number) => void
  label: string
  min?: number
  step?: number
}

export function Stepper({ value, onChange, label, min = 0, step = 1 }: StepperProps) {
  return (
    <div className={css.stepper}>
      <button type="button" className={css.stepBtn} aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>
        <Minus aria-hidden="true" />
      </button>
      <NumberInput value={value} onChange={onChange} min={min} step={step} label={label} className={css.stepField} />
      <button type="button" className={css.stepBtn} aria-label={`More ${label}`} onClick={() => onChange(value + step)}>
        <Plus aria-hidden="true" />
      </button>
    </div>
  )
}

interface SegmentedProps<T extends string | number> {
  legend: string
  value: T
  options: { value: T; label: string; sub?: string }[]
  onChange: (v: T) => void
  hint?: ReactNode
}

export function Segmented<T extends string | number>({ legend, value, options, onChange, hint }: SegmentedProps<T>) {
  const name = useId()
  return (
    <fieldset className={css.segField}>
      <legend className={css.label}>{legend}</legend>
      <div className={css.seg}>
        {options.map((o) => (
          <label key={String(o.value)} className={css.segOpt}>
            <input type="radio" name={name} checked={o.value === value} onChange={() => onChange(o.value)} />
            <span>
              {o.label}
              {o.sub && <small>{o.sub}</small>}
            </span>
          </label>
        ))}
      </div>
      {hint && <p className={css.hint}>{hint}</p>}
    </fieldset>
  )
}

interface CheckProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export function Check({ checked, onChange, label, description, disabled }: CheckProps) {
  return (
    <label className={css.check} data-disabled={disabled || undefined}>
      <input type="checkbox" className="tick" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className={css.checkLabel}>{label}</span>
        {description && <span className={css.checkDesc}>{description}</span>}
      </span>
    </label>
  )
}

/** Meter-register numerals: each digit is a wheel that rolls to its new value. `register` frames each wheel in a counter window. */
export function Rolling({ text, className, register }: { text: string; className?: string; register?: boolean }) {
  const chars = text.split('')
  return (
    <span className={css.roll + (register ? ' ' + css.register : '') + ' ' + (className ?? '')}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={css.rollFace}>
        {chars.map((ch, i) => {
          const key = chars.length - i
          if (ch >= '0' && ch <= '9') {
            const d = ch.charCodeAt(0) - 48
            return (
              <span key={key} className={css.wheel}>
                <span className={css.strip} style={{ transform: `translateY(${-d * 10}%)` }}>
                  {DIGITS.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </span>
              </span>
            )
          }
          return (
            <span key={key + ch} className={css.glyph}>
              {ch}
            </span>
          )
        })}
      </span>
    </span>
  )
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
