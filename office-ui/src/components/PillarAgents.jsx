import { statusTone } from '../lib/statusTone'

const AGENTS = [
  {
    pillar: 'Legal',
    title: 'CLO Sprite',
    label: 'L',
    accent: 'from-[#9e5a39]/80 to-[#6b341f]/90',
    glow: 'shadow-[0_0_30px_rgba(158,90,57,0.35)]',
    toneKey: 'legal',
  },
  {
    pillar: 'Finance',
    title: 'CFO Sprite',
    label: 'F',
    accent: 'from-[#8c2f2f]/80 to-[#5b1717]/90',
    glow: 'shadow-[0_0_30px_rgba(140,47,47,0.35)]',
    toneKey: 'finance',
  },
]

export function PillarAgents({ legalStatus, financeStatus }) {
  const statuses = {
    legal: legalStatus,
    finance: financeStatus,
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {AGENTS.map((agent) => (
        <article
          key={agent.pillar}
          className="rounded-[1.6rem] border border-white/10 bg-black/18 p-4"
        >
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-stone-300/60">
            {agent.pillar} Pillar
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-white/10 bg-gradient-to-br text-2xl font-display font-bold text-stone-50 ${agent.accent} ${agent.glow}`}
              >
                {agent.label}
              </div>
              <span
                className={`absolute -right-2 -top-2 rounded-full border px-2 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] ${statusTone(statuses[agent.toneKey])}`}
              >
                {statuses[agent.toneKey]}
              </span>
            </div>

            <div>
              <p className="font-semibold text-stone-100">{agent.title}</p>
              <p className="mt-1 text-sm leading-6 text-stone-300/75">
                Live status bubble sourced from `agents.md`.
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
