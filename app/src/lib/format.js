/** Sana formati — natijalar ro'yxatlarida ishlatiladi. */
export function formatDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date()
  const validDate = isNaN(d.getTime()) ? new Date() : d
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${validDate.getDate()}-${months[validDate.getMonth()]} ${validDate.getFullYear()}`
}

export const UZBEK_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

/** "2026-10-15" → "15-Oktabr, 2026" */
export function formatExamDate(dateStr) {
  if (!dateStr) return 'Sana tanlanmagan'
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return `${d.getDate()}-${UZBEK_MONTHS[d.getMonth()]}, ${d.getFullYear()}`
}
