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
// 'y' ataylab yo'q: u so'z ichida unli vazifasini bajarsa ham,
// TERISH XATOSI sifatida y<->e almashuvi kam uchraydi. Uni unli deb
// hisoblasak, "stady" uchun "stade" ham "study" bilan teng ball olib,
// tasodifan birinchi kelgani tanlanadi.
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])

/**
 * Bir xil tahrir masofasidagi nomzodlarni saralash uchun.
 *
 * NIMA UCHUN KERAK: "stady" so'zi "study" dan ham, "shady" dan ham
 * atigi 1 masofada. Birinchi uchraganini olsak, talabaga "shady"
 * taklif qilinadi — u esa aslida "study" deb yozmoqchi bo'lgan.
 * Terish xatolarida UNLI harf almashishi undosh almashishidan
 * ancha ko'p uchraydi, shuning uchun unli almashgan nomzod ustun.
 */
function candidateScore(word: string, cand: string): number {
  if (word.length !== cand.length) return 0   // qo'shish/tushirish
  let diffs = 0
  let vowelOnly = true
  for (let i = 0; i < word.length; i++) {
    if (word[i] === cand[i]) continue
    diffs++
    if (!VOWELS.has(word[i]) || !VOWELS.has(cand[i])) vowelOnly = false
  }
  return diffs === 1 && vowelOnly ? 2 : 1
}

export function nearestWord(
  word: string,
  dict: Set<string>,
  byFirstLetter: Map<string, string[]>,
  maxDist = 1,
): string | null {
  const candidates = byFirstLetter.get(word[0]) ?? []
  let best: string | null = null
  let bestDist = maxDist + 1
  let bestScore = -1

  for (const cand of candidates) {
    if (Math.abs(cand.length - word.length) > maxDist) continue
    const d = editDistance(word, cand, maxDist)
    if (d > maxDist) continue
    const score = candidateScore(word, cand)
    // Erta to'xtamaymiz: bir xil masofadagi barcha nomzodlar
    // ko'rib chiqilib, eng ishonarlisi tanlanadi.
    if (d < bestDist || (d === bestDist && score > bestScore)) {
      bestDist = d
      bestScore = score
      best = cand
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

/**
 * So'z lug'atdagi biror so'zning oddiy grammatik shaklimi?
 *
 * NIMA UCHUN KERAK: word-list kabi ro'yxatlarda hamma qo'shimchali
 * shakl bo'lmaydi. "lingua francas" dagi "francas" lug'atda yo'q, lekin
 * u "franca" ning ko'pligi — xato emas. Bunday so'zlarni tekshirmasak,
 * tahrir masofasi ularga eng yaqin BEGONA so'zni taklif qiladi
 * ("francas" -> "fracas"), bu esa foydalanuvchini chalg'itadi.
 */
export function hasKnownStem(word: string, dict: Set<string>): boolean {
  const suffixes = ["s", "es", "ed", "ing", "ly", "er", "est", "'s"]
  for (const suf of suffixes) {
    if (!word.endsWith(suf)) continue
    const stem = word.slice(0, word.length - suf.length)
    if (stem.length < 3) continue
    if (dict.has(stem)) return true
    // "hoping" -> "hope": oxirgi 'e' tushib qolgan
    if (dict.has(stem + 'e')) return true
    // "running" -> "run": oxirgi undosh ikkilangan
    if (
      stem.length > 2 &&
      stem[stem.length - 1] === stem[stem.length - 2] &&
      dict.has(stem.slice(0, -1))
    ) return true
    // "studies" -> "study"
    if (stem.endsWith('i') && dict.has(stem.slice(0, -1) + 'y')) return true
  }
  return false
}

/**
 * Lug'atda kam uchraydigan, lekin insholarda normal ishlatiladigan
 * so'zlar. Bularni tekshiruvdan chiqaramiz.
 */
export const ALLOWLIST = new Set([
  'lingua', 'franca', 'francas', 'lingue',
  'globalisation', 'globalization', 'urbanisation', 'urbanization',
  'specialisation', 'specialization', 'socialisation', 'socialization',
  'wellbeing', 'workforce', 'workplace', 'healthcare', 'lifestyle',
  'smartphone', 'smartphones', 'online', 'offline', 'internet',
  'multinational', 'multinationals', 'sustainability', 'employability',
  'coursework', 'fieldwork', 'upskilling', 'overconsumption',
])
