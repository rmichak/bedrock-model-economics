# Bedrock Model Economics

What would AI cost your team each month, and is any model worth more than it costs?

Describe your team (headcount per group and how often people do everyday tasks like
drafting an email, summarizing a document or running a coding agent). The app turns that
into tokens and gives every Amazon Bedrock model a monthly bill. It then plots cost against
quality (the Artificial Analysis Intelligence Index) with a Pareto frontier and puts a
self-hosted on-prem box on the same chart. Up and to the left wins: higher quality for less
money. Nobody has to think in tokens.

It's built for managers and IT/security staff choosing between closed frontier models on
Bedrock, open-weight models on Bedrock, or running a box on-prem. Some of them work in
government, so policy filters are built in: exclude China-developed models (on by default),
AWS GovCloud only, and DoD IL4/IL5 only.

**Live:** https://bedrock-model-economics.vercel.app

## What's in it

- **Monthly statement**: team usage, highest-quality model available, best value within
  3 points of the top, and on-prem vs the cheapest Bedrock model that scores at least as
  high as the local one.
- **Cost against quality**: log/linear cost axis, bubble area by output speed, dashed
  outline when speed isn't reported, hollow marker for models not on Bedrock, the Pareto
  frontier, labels on frontier models and the local box, and hover/focus/tap tooltips.
- **Team and policy controls**: headcount per group, active users, workdays, model
  thinking (output multiplier), prompt caching, China/GovCloud/IL4-IL5 filters and the
  Bedrock service tier (Standard, Flex/Batch −50%, Priority +75%).
- **Task worksheet**: editable tasks per person per day for each group, tokens and cost
  per task, and team monthly cost for whichever model you pick. You can add your own tasks.
- **Model ledger**: a sortable table with origin and GovCloud chips. Models hidden by your
  filters are listed greyed at the bottom. **Download CSV** exports the ledger at the
  current scenario.
- **On-prem box**: picking a local model loads typical hardware; every field is editable.
  It shows a cost breakdown and a utilization gauge that warns above 85%.
- **Shareable scenarios**: every input is encoded in the URL as you change it. **Copy
  link** sends someone the exact scenario; **Reset** returns to the defaults.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest: pins the cost math to the prototype's numbers
npm run build    # type-check and build to dist/
```

It's a static Vite + React + TypeScript site with no backend, database or auth. The chart
is a hand-built SVG, not a charting library.

## Update prices and scores

All data is in `src/data/*.json`. See [DATA.md](DATA.md) for what each field means and how
to refresh it without touching code. Bump `asOf` in `src/data/meta.json` when you do.

## How the cost is calculated

`src/lib/cost.ts`, in short:

- Team tasks per month for a task = Σ groups (headcount × active share × tasks per person
  per day × workdays).
- Cost of one task = [calls × inPer × ((1 − c) × pi + c × pi × 0.10) + calls × outPer ×
  thinking × po] / 1e6, where c is the task's cached share when caching is on. Rates come
  from GovCloud pricing when that filter is on, the long-prompt tier when it applies, and
  the service tier multiplier.
- On-prem: GPU-hours = (output tokens ÷ output tok/s + uncached input ÷ prompt tok/s) ÷
  3600. Boxes are sized so a workday's GPU-hours fit inside business hours. Monthly cost =
  amortized hardware + energy (busy hours at active watts, the rest of 720 h/box at idle
  watts) + ops.

With the default inputs (40 staff, 10 analysts, 10 developers, 60% active, 21 workdays,
Standard thinking, caching on), Claude Sonnet 5.5 comes to about **$930 a month** and
Claude Opus 5.5 to about **$1,861**. The tests pin those numbers.

## Caveats

- Prices and scores are as of **Oct 23, 2026** and change often.
- The Intelligence Index is Artificial Analysis v4.3.2. It was rescaled from earlier
  versions (Claude Opus 4.6 now scores 26.4), so only compare scores within one version.
  Scores are measured at each model's highest reasoning setting; "Model thinking"
  approximates that overhead by multiplying output tokens.
- Task token sizes are planning estimates, not measurements. Agentic coding sessions
  re-send their growing context every step, which is why caching matters so much for them.
- GovCloud availability follows the AWS FedRAMP and DoD SRG status page for Bedrock models
  (updated Oct 21, 2026). Claude, gpt-oss and Gemma GovCloud prices aren't published on the
  pages checked, so the commercial rate is shown and marked "est."; other models' GovCloud
  rates run 20–35% above commercial.
- Claude prices are Anthropic's list rates. Claude Fable 5.1's $50 output price is assumed
  equal to GPT-6 Astra's. Haiku 5.5 moves to $0.50 / $2.50 when a single prompt exceeds
  100K tokens. Sonnet 5 is shown at $3 / $15 after promotional pricing ended Aug 31, 2026.
- Commercial prices use the Global cross-Region rate where offered; US-only routing is
  about 10% higher for OpenAI, xAI and Moonshot. GLM 5.3 access is limited to eligible
  customers. Qwen3 235B is priced at the Sydney rate. Gemini 4 Argon isn't on Bedrock and
  is shown for reference.
- Nova Pro/Lite/Micro, Llama 3 70B/8B and Nemotron Nano are in GovCloud but have no current
  Intelligence Index score, so they aren't plotted.
- On-prem hardware, power and throughput figures are editable assumptions, not quotes.
  Staff time, networking and the cost of an authority to operate are excluded unless you
  enter them under Ops.

Sources: [Amazon Bedrock pricing](https://aws.amazon.com/bedrock/pricing/) ·
[Bedrock model cards](https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards-openai.html) ·
[Bedrock FedRAMP and DoD SRG status](https://aws.amazon.com/compliance/services-in-scope/FedRAMP/amazon-bedrock-models/) ·
[Bedrock regional availability](https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html) ·
[modelgrep leaderboard](https://modelgrep.com/leaderboard) ·
[Artificial Analysis comparisons](https://artificialanalysis.ai/models/comparisons/deepseek-v3-2-reasoning-vs-gpt-oss-120b) ·
[Claude 5.5 pricing](https://www.eesel.ai/blog/claude-haiku-5-5-pricing)

## Background

This started as a single-file prototype inspired by a
[video on the economics of local AI vs frontier models](https://www.youtube.com/watch?v=fHY0sjAejcA).
That video found the cost-vs-quality frontier is all closed models, and that buying local
hardware rarely pays off on cost alone. This version makes the same comparison for a whole
team on Bedrock, with GovCloud and on-prem options.

A planning tool, not a quote.
