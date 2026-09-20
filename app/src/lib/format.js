/** Sana formati — natijalar ro'yxatlarida ishlatiladi. */
export function formatDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date()
  const validDate = isNaN(d.getTime()) ? new Date() : d
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${validDate.getDate()}-${months[validDate.getMonth()]} ${validDate.getFullYear()}`
}
