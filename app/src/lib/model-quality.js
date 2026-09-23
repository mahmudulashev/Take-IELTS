/**
 * Qaysi model bahoni qo'ygani muhim.
 *
 * Google 503 ("high demand") qaytarganda baholash zaxira modellarga
 * tushadi. Ularning eng oxirgisi — flash-lite — vazifani uddalay
 * olmaydi: bir xil inshoga 6.5 o'rniga 7.5 qo'ygani kuzatilgan.
 *
 * Xizmatni to'xtatmaslik uchun u zanjirda qoladi, lekin bunday bahoni
 * boshqalari bilan teng ko'rsatish mumkin emas — foydalanuvchi ballning
 * ishonchliligi pastroq ekanini bilib tursin.
 */
const DEGRADED_MODELS = new Set([
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  // Groq zaxirasi — ochiq modellar, bizning matnimizda Gemini'dan zaifroq
  'openai/gpt-oss-120b',
  'llama-3.3-70b-versatile',
])

export function isDegradedModel(model) {
  return typeof model === 'string' && DEGRADED_MODELS.has(model)
}
