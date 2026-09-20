/**
 * Sana formati — natijalar ro'yxatlarida ishlatiladi.
 *
 * Reading/Listening band jadvallari (to'g'ri javob → band) shu faylda edi;
 * o'sha bo'limlar saytdan olib tashlangach kerak bo'lmay qoldi. Writing
 * bandini AI qo'yadi, uni koddan hisoblanmaydi.
 */
export function formatDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date()
  const validDate = isNaN(d.getTime()) ? new Date() : d
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${validDate.getDate()}-${months[validDate.getMonth()]} ${validDate.getFullYear()}`
}
