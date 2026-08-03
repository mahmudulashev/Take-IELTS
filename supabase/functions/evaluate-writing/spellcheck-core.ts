/**
 * Imlo tekshiruvi — haqiqiy lug'at + tahrir masofasi.
 *
 * NIMA UCHUN BUNDAY:
 * Oldingi versiyada oldindan yozilgan ~160 ta xato ro'yxati bor edi.
 * U "goverment" ni topardi, lekin "univrsity", "stady", "encouragingg"
 * kabi tasodifiy terish xatolarini bilmasdi — ro'yxatga hamma
 * mumkin bo'lgan xatoni yozib bo'lmaydi.
 *
 * Endi teskari yondashuv: lug'atda YO'Q so'zlarni qidiramiz.
 * Lekin "lug'atda yo'q" degani "xato" degani emas — ismlar,
 * atamalar, qisqartmalar ham yo'q bo'ladi. Shuning uchun qo'shimcha
 * shart: so'z lug'atdagi biror so'zdan atigi BITTA tahrir masofasida
 * bo'lishi kerak (bitta harf qo'shilgan/tushgan/almashgan).
 *
 *   univrsity   -> university   (1 ta harf tushgan)   → xato
 *   stady       -> study        (1 ta harf almashgan) → xato
 *   encouragingg-> encouraging  (1 ta harf ortiqcha)  → xato
 *   Tashkent    -> (yaqin so'z yo'q)                  → xato emas
 *
 * Bu qoida terish xatolarini deyarli 100% tutadi va ismlarni
 * deyarli hech qachon noto'g'ri belgilamaydi.
 */

/** Levenshtein masofasi, `max` dan oshsa erta to'xtaydi (tezlik uchun) */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1
  if (a === b) return 0

  let prev = new Array(b.length + 1)
  let curr = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    let rowMin = curr[0]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost)
      if (curr[j] < rowMin) rowMin = curr[j]
    }
    if (rowMin > max) return max + 1     // bu qatorda ham umid yo'q
    const t = prev; prev = curr; curr = t
  }
  return prev[b.length]
}

/**
 * Lug'atdan `word` ga eng yaqin so'zni topadi (masofa <= maxDist).
 * Tezlik uchun faqat uzunligi mos va birinchi harfi bir xil
 * nomzodlar tekshiriladi — terish xatolarida birinchi harf
 * kamdan-kam o'zgaradi.
 */
export function nearestWord(
  word: string,
  dict: Set<string>,
  byFirstLetter: Map<string, string[]>,
  maxDist = 1,
): string | null {
  const candidates = byFirstLetter.get(word[0]) ?? []
  let best: string | null = null
  let bestDist = maxDist + 1

  for (const cand of candidates) {
    if (Math.abs(cand.length - word.length) > maxDist) continue
    const d = editDistance(word, cand, maxDist)
    if (d < bestDist) {
      bestDist = d
      best = cand
      if (d === 1) break        // 1 dan yaxshirog'i bo'lmaydi
    }
  }
  return bestDist <= maxDist ? best : null
}

/** Lug'atni birinchi harf bo'yicha guruhlash — qidiruvni tezlashtiradi */
export function indexByFirstLetter(dict: Set<string>): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const w of dict) {
    const k = w[0]
    if (!k) continue
    const arr = map.get(k)
    if (arr) arr.push(w)
    else map.set(k, [w])
  }
  return map
}

/** So'z tekshirishga arziydimi? */
export function isCheckable(word: string, index: number, prevChar: string): boolean {
  if (word.length < 4) return false          // qisqa so'zlarda xato aniqlash ishonchsiz
  if (/\d/.test(word)) return false          // raqamli
  if (word !== word.toLowerCase()) {
    // Katta harfli — gap boshida bo'lmasa atoqli ot deb hisoblaymiz
    const sentenceStart = index === 0 || /[.!?]\s*$/.test(prevChar)
    if (!sentenceStart) return false
  }
  return true
}
