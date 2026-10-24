import type { RowKind } from './types'

export const KIND_LABEL: Record<RowKind, string> = {
  closed: 'Closed · Bedrock',
  open: 'Open · Bedrock',
  ref: 'Not on Bedrock',
  local: 'On-prem',
}

export const COLOR: Record<RowKind, string> = {
  closed: 'var(--s-closed)',
  open: 'var(--s-open)',
  local: 'var(--s-local)',
  ref: 'var(--s-ref)',
}
