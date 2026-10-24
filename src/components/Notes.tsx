import { META } from '../lib/data'
import css from './Notes.module.css'

export function Notes() {
  return (
    <section className={css.section} id="notes" aria-labelledby="notes-h">
      <h2 id="notes-h">Notes and sources</h2>
      <ul className={css.list}>
        <li>
          Intelligence Index is Artificial Analysis v4.3.2. It was rescaled from earlier versions (Claude Opus 4.6 now scores 26.4), so only compare scores
          within the same version. Scores are measured at each model's highest reasoning setting; "Model thinking" multiplies output tokens to approximate
          that overhead.
        </li>
        <li>
          Task token sizes are planning estimates, not measurements. A 25-page document is about 12,500 words or 16,600 tokens. Agentic coding sessions
          re-send their growing context on every step, which is why caching matters so much for them.
        </li>
        <li>
          GovCloud availability follows the AWS FedRAMP and DoD SRG status page for Bedrock models (updated Oct 21, 2026). No China-developed model is
          listed there. Claude, gpt-oss and Gemma GovCloud prices aren't published on the pages checked, so the commercial rate is shown and marked "est.";
          GovCloud rates for other models run 20–35% above commercial.
        </li>
        <li>
          Claude prices are Anthropic's list rates. Claude Fable 5.1's $50 output price is assumed equal to GPT-6 Astra's. Haiku 5.5 moves to $0.50 / $2.50
          when a single prompt exceeds 100K tokens. Sonnet 5 is shown at its standard $3 / $15 after promotional pricing ended Aug 31, 2026.
        </li>
        <li>
          Bedrock commercial prices use the Global cross-Region rate where offered; US-only routing is about 10% higher for OpenAI, xAI and Moonshot. GLM 5.3
          access is limited to eligible customers. Qwen3 235B is priced at the Sydney rate. Gemini 4 Argon is not on Bedrock and is shown for reference only.
        </li>
        <li>
          Nova Pro, Lite and Micro, Llama 3 70B and 8B, and Nemotron Nano models are also available in GovCloud but have no current Intelligence Index score,
          so they aren't plotted.
        </li>
        <li>
          On-prem hardware, power and throughput figures are editable assumptions, not quotes. Staff time, networking, and the cost of an authority to
          operate are excluded unless entered under Ops.
        </li>
      </ul>
      <div className={css.sources}>
        <h3>Sources</h3>
        <ul>
          {META.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
