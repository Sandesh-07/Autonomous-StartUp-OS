import { useMemo } from 'react'

function computeStamina(forecast) {
  const zeroCashDate = forecast?.zeroCashDate || ''
  const zeroCash = new Date(zeroCashDate)
  const hasValidDate = Number.isFinite(zeroCash.getTime())
  const now = Date.now()
  const diffDays = hasValidDate
    ? Math.max(0, Math.ceil((zeroCash.getTime() - now) / (1000 * 60 * 60 * 24)))
    : 365

  return {
    daysLeft: diffDays,
    percent: Math.max(8, Math.min(100, (diffDays / 365) * 100 || 100)),
    healthStatus: forecast?.healthStatus || 'HEALTHY',
    zeroCashDate,
  }
}

export function useForecastStamina(forecast) {
  return useMemo(
    () =>
      computeStamina({
        zeroCashDate: forecast?.zeroCashDate || '',
        healthStatus: forecast?.healthStatus || 'HEALTHY',
      }),
    [forecast?.zeroCashDate, forecast?.healthStatus],
  )
}
