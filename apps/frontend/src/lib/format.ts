export function formatDate(val?: string): string {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleString()
  } catch {
    return val
  }
}

export function formatNumber(val?: number, decimals = 1): string {
  if (val === undefined || val === null) return '—'
  return val.toFixed(decimals)
}
