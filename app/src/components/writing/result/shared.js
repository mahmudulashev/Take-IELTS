/** Natija sahifasining bo'laklari umumiy ishlatadigan uslub va yordamchilar. */

export const CARD = 'bg-white border border-[#E9E9EC] rounded-[24px]'
export const LABEL = 'text-xs font-semibold tracking-[.09em] uppercase'

export const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

// 8 → "8", 7.5 → "7.5" (halqa ichida)
export const shortBand = (b) => (Number.isInteger(b) ? String(b) : b.toFixed(1))

export function bandLevel(band) {
  const b = Math.floor(band)
  if (b >= 9) return 'mukammal daraja'
  if (b >= 8) return 'juda yaxshi daraja'
  if (b >= 7) return 'yaxshi daraja'
  if (b >= 6) return 'qoniqarli daraja'
  if (b >= 5) return "o'rtacha daraja"
  if (b >= 4) return 'cheklangan daraja'
  return "boshlang'ich daraja"
}

export function isToday(iso) {
  const d = iso ? new Date(iso) : new Date()
  return d.toDateString() === new Date().toDateString()
}
