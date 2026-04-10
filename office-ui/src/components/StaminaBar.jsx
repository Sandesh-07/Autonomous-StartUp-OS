export function StaminaBar({
  daysLeft,
  percent,
  healthStatus,
  achievementActive,
}) {
  return (
    <div className="w-full max-w-xl">
      <div className="stamina-track h-5 rounded-full border border-white/10 bg-[#081214]/80 p-1">
        <div
          className={`stamina-fill h-full rounded-full ${
            achievementActive ? 'stamina-refill' : ''
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-stone-300/70">
        <span>{daysLeft} runway days</span>
        <span>{healthStatus}</span>
      </div>
    </div>
  )
}
