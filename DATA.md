# Updating the data

All prices, scores and defaults live in `src/data/`. You can refresh them without touching
any code. Edit the JSON, run `npm test` and `npm run build`, then push. Vercel redeploys
on every push to `main`.

Prices and scores change often. When you refresh them, also update `asOf` in `meta.json`,
because the header, footer and CSV export all show that date.

## `models.json`: Bedrock and reference models

One object per line. Fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | Stable identifier. It appears in shared scenario links (`m=`), so don't rename it casually. |
| `name` | string | Display name. |
| `maker` | string | Developer. |
| `origin` | string | Country of the developer. `"China"` is what the "Exclude models developed in China" filter matches. |
| `kind` | `"closed"` \| `"open"` \| `"ref"` | Closed model on Bedrock, open-weight model on Bedrock, or a reference model that isn't on Bedrock (drawn hollow). |
| `pi` / `po` | number | USD per 1M input / output tokens, commercial region (Global cross-Region rate where offered). |
| `idx` | number | Artificial Analysis Intelligence Index, v4.3.2. Only compare scores within one version. |
| `tps` | number \| null | Output tokens per second. Sets bubble size; `null` draws a dashed outline. |
| `gov` | boolean | Listed for AWS GovCloud (US) at FedRAMP High. |
| `il` | boolean | Cleared for DoD IL4/IL5. |
| `govPi` / `govPo` | number, optional | GovCloud price per 1M tokens. If it's missing in GovCloud mode, the commercial rate is used and flagged "est.". |
| `govEst` | boolean, optional | The GovCloud price shown is itself an estimate. |
| `over` | object, optional | Long-prompt tier: `{ "tokens": 100000, "pi": 0.5, "po": 2.5 }` bills at these rates when a task's per-call input is above `tokens`. |

To add a model, copy a similar line and change every field. A model without an index score
can't be plotted, so leave it out (the Notes section lists the ones excluded for that reason).

## `localModels.json`: self-hostable models

| Field | Meaning |
| --- | --- |
| `id`, `name`, `origin`, `idx` | As above. Local models with `origin: "China"` are hidden by the China filter. |
| `hw` | Hardware cost per box, USD. |
| `tput` | Combined output tokens per second per box, with request batching. |
| `pre` | Prompt (prefill) tokens per second per box. |
| `wact` / `widle` | Watts while busy / idle. |
| `setup` | One-line hardware description shown in the picker. |

Picking a local model in the app loads these as defaults. Every value can then be edited.

## `tasks.json`: everyday tasks

| Field | Meaning |
| --- | --- |
| `id` | Stable identifier, used in scenario links. Letters only, no hyphens. |
| `name`, `size` | Label and a short description of a typical instance. |
| `calls` | Model calls per task (an agentic session makes many). |
| `inPer` / `outPer` | Input / output tokens per call, including system prompts and retrieved context. Output is multiplied by the "Model thinking" setting. |
| `cache` | Share of input (0–1) that is cached on repeat calls when prompt caching is on. Cached input bills at 10% of the input rate. |

## `groups.json`: team groups

| Field | Meaning |
| --- | --- |
| `id` | Stable identifier, used in scenario links. Letters only, no hyphens. |
| `name`, `hint` | Label and a short description. |
| `headcount` | Default number of people. |
| `perDay` | Default tasks per active person per workday, keyed by task `id`. |

## `meta.json`

`asOf` (ISO date), `indexVersion`, and `sources` (label + URL), which are listed in the
Notes section of the app.

## How the numbers are computed

See `src/lib/cost.ts`. It holds pure functions with comments, pinned by the tests in
`src/lib/cost.test.ts`. If you change a formula, the tests tell you which reference
numbers moved.
