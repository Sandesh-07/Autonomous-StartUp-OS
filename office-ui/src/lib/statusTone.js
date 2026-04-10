export function statusTone(value) {
  const normalized = String(value || '').toUpperCase()

  if (
    normalized.includes('CRITICAL') ||
    normalized.includes('FAIL') ||
    normalized.includes('MISSING') ||
    normalized.includes('BLOCKED')
  ) {
    return 'border-rose-400/40 bg-rose-500/15 text-rose-100'
  }

  if (
    normalized.includes('READY') ||
    normalized.includes('ACTIVE') ||
    normalized.includes('PASS') ||
    normalized.includes('GREEN') ||
    normalized.includes('COMPLETE') ||
    normalized.includes('SUCCESS') ||
    normalized.includes('RECEIVED') ||
    normalized.includes('PROVISIONED') ||
    normalized.includes('ASSIGNED') ||
    normalized.includes('ISSUED')
  ) {
    return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
  }

  return 'border-amber-300/40 bg-amber-400/15 text-amber-100'
}
