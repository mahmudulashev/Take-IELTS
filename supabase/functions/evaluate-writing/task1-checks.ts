/**
 * Task 1: ma'lumot aniqligi tekshiruvini qayta ishlash.
 *
 * Model javobdagi har bir raqam va solishtiruvchi da'voni `data_checks`
 * ro'yxatiga yozadi. Bu modul uni tozalaydi va noto'g'ri deb topilganlarini
 * matn ichidagi belgiga (annotation) aylantiradi.
 *
 * NIMA UCHUN MODELNING O'Z `annotations` IGA TAYANMAYMIZ:
 * Birinchi sinovda model "18 — butun grafikdagi eng yuqori qiymat" degan
 * xato da'voni (aslida 19) umuman belgilamadi va xulosada "barcha raqamlar
 * 100% aniq" deb yozdi. Tekshiruv alohida, majburiy maydonga chiqarilib,
 * natijasi kod bilan belgiga aylantirilsa, topilgan xato yo'qolib qolmaydi.
 *
 * Deno'ga bog'liq emas — Node'da test qilish mumkin.
 */

export type Verdict = 'correct' | 'approximation' | 'inaccurate'

export interface DataCheck {
  quote: string
  claim: string
  verdict: Verdict
  correct_value: string
  severity: 'minor' | 'major'
  note: string
  /** Iqtibosning javob matnidagi aniq ko'rinishi; topilmasa null */
  located: string | null
}

const MAX_CHECKS = 40

/**
 * Iqtibosni javob matnidan topadi. Model ba'zan bo'sh joy yoki harf
 * katta-kichikligini o'zgartirib ko'chiradi. Aniq moslik bo'lmasa, so'zlar
 * orasidagi bo'shliqni erkin qoldirib qidiramiz va asl matndagi bo'lakni
 * qaytaramiz — belgi aynan shu bo'lakka qo'yiladi.
 */
export function locateQuote(text: string, quote: string): string | null {
  const q = (quote ?? '').trim()
  if (q.length < 3) return null
  if (text.includes(q)) return q
  const words = q.split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const match = text.match(new RegExp(words.join('\\s+'), 'i'))
  return match ? match[0] : null
}

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export function normalizeDataChecks(raw: unknown, text: string): DataCheck[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, MAX_CHECKS).flatMap((c: any): DataCheck[] => {
    if (!c || typeof c.quote !== 'string' || !c.quote.trim()) return []
    const verdict: Verdict = c.verdict === 'inaccurate' || c.verdict === 'approximation' ? c.verdict : 'correct'
    return [{
      quote: str(c.quote, 300),
      claim: str(c.claim, 300),
      verdict,
      correct_value: str(c.correct_value, 200),
      severity: c.severity === 'major' ? 'major' : 'minor',
      note: str(c.note, 400),
      located: locateQuote(text, c.quote),
    }]
  })
}

/**
 * Noto'g'ri da'volarni `task` turidagi belgiga aylantiradi.
 * Bir bo'lakda bir nechta xato bo'lsa, bitta belgi qoladi (og'irrog'i).
 */
export function dataCheckAnnotations(checks: DataCheck[]) {
  const byQuote = new Map<string, DataCheck>()
  for (const c of checks) {
    if (c.verdict !== 'inaccurate' || !c.located) continue
    const prev = byQuote.get(c.located)
    if (!prev || (prev.severity === 'minor' && c.severity === 'major')) byQuote.set(c.located, c)
  }
  return Array.from(byQuote.values()).map((c) => ({
    quote: c.located as string,
    type: 'task' as const,
    severity: c.severity === 'major' ? 'high' as const : 'medium' as const,
    fix: c.correct_value,
    note: c.note || (c.correct_value ? `Grafikka mos emas. To'g'risi: ${c.correct_value}` : 'Grafikka mos emas.'),
  }))
}

/** Iqtibos boshqalardan biri bilan ustma-ust tushadimi — takroriy belgilarni oldini olish uchun */
export function overlapsAny(quote: string, others: string[]): boolean {
  return others.some((o) => o.includes(quote) || quote.includes(o))
}
