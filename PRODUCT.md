# Product

<!-- impeccable:product-schema 1 -->

> Interview substitution: the owner said "Go" and asked for an unattended build, so this record
> is inferred from the owner's brief (`CLAUDE_CODE_PROMPT.md`), the working prototype
> (`prototype.html`), and the source video (youtube.com/watch?v=fHY0sjAejcA). Items marked
> *(inferred)* were not confirmed in conversation.

## Platform

web

## Stack

Vite + React + TypeScript, static site, no backend/database/auth. Vitest for cost math.
Hand-built SVG scatter (no chart library). Deployed to Vercel from a public GitHub repo
(owner explicitly asked for public).

## Users

Managers and IT/security staff deciding how their organization should run AI, some in
government (federal, GovCloud, DoD). They are not token experts; they think in headcount,
job roles, and everyday tasks ("draft an email", "summarize a document", "run a coding agent").
Secondary *(inferred)*: technical people and video viewers who want to sanity-check the
"local AI vs frontier API" math for themselves.

## Product Purpose

Turn a team description into a monthly AI bill for every model, then plot cost against quality
(Artificial Analysis Intelligence Index) with a Pareto frontier, so a team can choose between
closed frontier models on Amazon Bedrock, open-weight models on Bedrock, or a self-hosted
on-prem box. Success: a manager can send a scenario link to a colleague and both see the same
numbers and the same recommendation.

## Positioning

Users never think in tokens: they set headcount and tasks-per-day; the app does the token math.
It prices the on-prem box with the same workload (amortized hardware, energy, utilization) and
puts it on the same chart as the cloud models, so "should we self-host?" is answered with one
picture: up and to the left wins.

## Operating Context

Used at a desk during planning, budgeting, and procurement conversations; screenshots and
scenario links get pasted into email, chat, and briefing decks *(inferred)*. Policy filters
are first-class: exclude China-developed models (default on), AWS GovCloud only, DoD IL4/IL5.

## Capabilities and Constraints

- Cost model, data, and test values are fixed by the brief; prices and scores are as of
  Oct 23, 2026 and must not be changed while porting.
- Every caveat from the prototype's Notes section stays visible in the app.
- Shareable URL-encoded scenarios, copy link, reset, CSV export of the ledger, custom tasks.
- Works at 400px width without horizontal page scroll; keyboard accessible; reduced motion.

## Brand Commitments

Product name: "Bedrock Model Economics". Series semantics carried from the prototype: closed
models, open-weight models, the self-hosted box, and not-on-Bedrock reference models are four
distinct, consistently colored categories. Owner asked for a look that is "flashy, modern,
professional" and explicitly not generic AI output.

## Evidence on Hand

- `src/data/*.json`: the model, local model, task, and group data from the prototype.
- Source list in `meta.json` (AWS pricing, model cards, FedRAMP/DoD SRG status, regional
  availability, modelgrep leaderboard, Artificial Analysis, Claude 5.5 pricing).
- No testimonials, customers, or usage numbers exist; none may be invented.

## Product Principles

1. Speak in tasks and people, never require tokens.
2. Numbers are the product: every figure traceable to a formula and a dated source.
3. The chart is the argument: cost vs quality, frontier drawn, on-prem on the same axes.
4. Policy is not an afterthought: filters change the answer and say what they hid.
5. Shareable by default: the URL is the scenario.

## Accessibility & Inclusion

Government audience *(inferred: Section 508 expectations)*: keyboard operable controls and
chart points, visible focus, sufficient contrast in light and dark, reduced-motion respected,
tables usable at phone width.
