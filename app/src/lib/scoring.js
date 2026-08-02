export function calculateReadingBand(score) {
  if (score >= 39) return '9.0'
  if (score >= 37) return '8.5'
  if (score >= 35) return '8.0'
  if (score >= 33) return '7.5'
  if (score >= 30) return '7.0'
  if (score >= 27) return '6.5'
  if (score >= 23) return '6.0'
  if (score >= 19) return '5.5'
  if (score >= 15) return '5.0'
  if (score >= 13) return '4.5'
  if (score >= 10) return '4.0'
  if (score >= 8) return '3.5'
  if (score >= 6) return '3.0'
  if (score >= 4) return '2.5'
  return '2.0'
}

export function calculateListeningBand(score) {
  if (score >= 39) return '9.0'
  if (score >= 37) return '8.5'
  if (score >= 35) return '8.0'
  if (score >= 32) return '7.5'
  if (score >= 30) return '7.0'
  if (score >= 26) return '6.5'
  if (score >= 23) return '6.0'
  if (score >= 18) return '5.5'
  if (score >= 16) return '5.0'
  if (score >= 13) return '4.5'
  if (score >= 10) return '4.0'
  if (score >= 8) return '3.5'
  if (score >= 6) return '3.0'
  if (score >= 4) return '2.5'
  return '2.0'
}

export function formatDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date()
  const validDate = isNaN(d.getTime()) ? new Date() : d
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${validDate.getDate()}-${months[validDate.getMonth()]} ${validDate.getFullYear()}`
}

export function formatSeconds(seconds) {
  if (!seconds || seconds <= 0) return '00:00'
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
