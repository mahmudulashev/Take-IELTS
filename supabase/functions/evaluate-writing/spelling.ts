/**
 * Imlo tekshiruvi — determinuvchi, modelsiz.
 *
 * NIMA UCHUN LLM'GA ISHONMAYMIZ:
 * Til modellari matnni harflar emas, tokenlar sifatida ko'radi.
 * "Goverment" va "government" model uchun deyarli bir xil vektor —
 * u ma'noni o'qiydi va xatoni sezmay o'tib ketadi. Prompt'ni
 * qanchalik qattiqlashtirmang, bu tokenizatsiya darajasidagi
 * cheklov, uni ko'rsatma bilan yechib bo'lmaydi.
 *
 * IKKI BOSQICHLI TEKSHIRUV:
 *   1. Quyidagi ro'yxat — eng ko'p uchraydigan xatolar. Bir zumda
 *      ishlaydi, tarmoq kerak emas.
 *   2. Haqiqiy lug'at (~275k so'z, CDN'dan bir marta yuklanadi):
 *      lug'atda yo'q, lekin biror so'zdan atigi 1 ta tahrir
 *      masofasida turgan so'zlar. Bu "univrsity", "stady",
 *      "encouragingg" kabi tasodifiy terish xatolarini tutadi —
 *      ularni oldindan ro'yxatga yozib bo'lmaydi.
 *
 * Lug'at yuklanmasa (tarmoq xatosi) 1-bosqich baribir ishlaydi.
 */

import {
  nearestWord, indexByFirstLetter, isCheckable,
} from './spellcheck-core.ts'

const WORD_LIST_URL = 'https://cdn.jsdelivr.net/npm/word-list@2.0.0/words.txt'

/**
 * Lug'at modul darajasida keshlanadi — Edge Function instansiyasi
 * "issiq" turganda qayta yuklanmaydi. Faqat sovuq startda ~2.4MB.
 */
let DICT: Set<string> | null = null
let DICT_INDEX: Map<string, string[]> | null = null
let dictLoadFailed = false

/**
 * Bir vaqtning o'zida kelgan so'rovlar lug'atni ikki marta yuklamasin —
 * hammasi shu bitta promise'ni kutadi.
 */
let loadPromise: Promise<boolean> | null = null

/**
 * Lug'atni oldindan yuklashni boshlaydi (kutmasdan).
 * `index.ts` buni modul yuklanishida chaqiradi: sovuq startda 2.4MB
 * yuklanishi foydalanuvchi autentifikatsiyasi va limit so'rovi bilan
 * bir vaqtda ketadi, ketma-ket emas.
 */
export function warmDictionary(): void {
  loadDictionary().catch(() => {})
}

function loadDictionary(): Promise<boolean> {
  if (DICT) return Promise.resolve(true)
  if (dictLoadFailed) return Promise.resolve(false)
  if (loadPromise) return loadPromise
  loadPromise = fetchDictionary()
  return loadPromise
}

async function fetchDictionary(): Promise<boolean> {
  try {
    const res = await fetch(WORD_LIST_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()

    const set = new Set<string>()
    for (const line of text.split('\n')) {
      const w = line.trim().toLowerCase()
      if (w) set.add(w)
    }
    if (set.size < 10000) throw new Error(`lug'at juda kichik: ${set.size}`)

    DICT = set
    DICT_INDEX = indexByFirstLetter(set)
    console.info(`[spelling] lug'at yuklandi: ${set.size} ta so'z`)
    return true
  } catch (e) {
    console.warn('[spelling] lug\'at yuklanmadi, faqat ro\'yxat ishlaydi:', e)
    dictLoadFailed = true
    return false
  }
}

export const COMMON_MISSPELLINGS: Record<string, string> = {
  // "n" tushib qolishi — eng ko'p uchraydigan guruh
  goverment: 'government',
  govermental: 'governmental',
  goverments: 'governments',
  enviroment: 'environment',
  enviromental: 'environmental',
  enviroments: 'environments',
  goverance: 'governance',

  // Qo'sh undosh
  adictive: 'addictive',
  adiction: 'addiction',
  adress: 'address',
  agressive: 'aggressive',
  agression: 'aggression',
  comunication: 'communication',
  comunicate: 'communicate',
  comitted: 'committed',
  comittee: 'committee',
  necesary: 'necessary',
  ocurred: 'occurred',
  occured: 'occurred',
  ocurrence: 'occurrence',
  proffesional: 'professional',
  profesional: 'professional',
  posible: 'possible',
  oportunity: 'opportunity',
  begining: 'beginning',
  sucessful: 'successful',
  succesful: 'successful',
  sucess: 'success',
  acomodation: 'accommodation',
  accomodation: 'accommodation',
  reccomend: 'recommend',
  recomend: 'recommend',
  imediately: 'immediately',
  comercial: 'commercial',
  tommorow: 'tomorrow',
  personnaly: 'personally',
  runing: 'running',
  planing: 'planning',
  refered: 'referred',
  prefered: 'preferred',
  transfered: 'transferred',

  // "ie" / "ei"
  recieve: 'receive',
  recieved: 'received',
  beleive: 'believe',
  beleived: 'believed',
  acheive: 'achieve',
  acheived: 'achieved',
  acheivement: 'achievement',
  freind: 'friend',
  wieght: 'weight',
  heigth: 'height',

  // "a" / "e" almashuvi
  seperate: 'separate',
  seperated: 'separated',
  seperately: 'separately',
  independant: 'independent',
  independance: 'independence',
  existance: 'existence',
  persistance: 'persistence',
  resistence: 'resistance',
  relevent: 'relevant',
  consistant: 'consistent',
  significent: 'significant',
  apparant: 'apparent',
  definately: 'definitely',
  definatly: 'definitely',
  seperation: 'separation',

  // Akademik insho leksikasi
  arguement: 'argument',
  concious: 'conscious',
  concequence: 'consequence',
  consequense: 'consequence',
  benificial: 'beneficial',
  benefical: 'beneficial',
  advantagous: 'advantageous',
  disadvantagous: 'disadvantageous',
  responsability: 'responsibility',
  responsibilty: 'responsibility',
  oppinion: 'opinion',
  goverend: 'governed',
  developement: 'development',
  employmentment: 'employment',
  goverming: 'governing',
  managment: 'management',
  enviromentaly: 'environmentally',
  technoligy: 'technology',
  tecnology: 'technology',
  scientifical: 'scientific',
  finacial: 'financial',
  finantial: 'financial',
  econimic: 'economic',
  ecconomic: 'economic',
  goverm: 'govern',
  poverity: 'poverty',
  populaton: 'population',
  polution: 'pollution',
  polluton: 'pollution',
  nutricion: 'nutrition',
  nutritian: 'nutrition',
  medecine: 'medicine',
  medecal: 'medical',
  goverened: 'governed',

  // Boshqa tez-tez uchraydiganlar
  untill: 'until',
  wich: 'which',
  becuase: 'because',
  becouse: 'because',
  bacause: 'because',
  thier: 'their',
  wheter: 'whether',
  wether: 'whether',
  allthough: 'although',
  eventhough: 'even though',
  alot: 'a lot',
  infact: 'in fact',
  aswell: 'as well',
  nowdays: 'nowadays',
  nowadys: 'nowadays',
  furthermor: 'furthermore',
  morever: 'moreover',
  therfore: 'therefore',
  therefor: 'therefore',
  wherease: 'whereas',
  wereas: 'whereas',
  childrens: "children's",
  peoples: 'people',
  informations: 'information',
  advices: 'advice',
  knowledges: 'knowledge',
  researches: 'research',
  equipments: 'equipment',
  softwares: 'software',
}

/** Tuzatishni asl so'zning katta/kichik harf shakliga moslash */
function matchCase(original: string, corrected: string): string {
  if (original === original.toUpperCase() && original.length > 1) return corrected.toUpperCase()
  if (original[0] === original[0].toUpperCase()) {
    return corrected[0].toUpperCase() + corrected.slice(1)
  }
  return corrected
}

/**
 * Lug'at haqiqatan yuklanganmi.
 * Yuklanmagan bo'lsa modelga imlo tekshirishni qaytarib beramiz —
 * uning aniqligi past, lekin hech narsadan yaxshiroq.
 */
export function isDictionaryActive(): boolean {
  return DICT !== null
}

export interface SpellingIssue {
  quote: string
  type: 'spelling'
  severity: 'medium'
  fix: string
  note: string
  count: number
}

/**
 * Insho matnidan imlo xatolarini topadi.
 * Har bir noto'g'ri so'z bir marta qaytariladi (nechta uchragani `count` da).
 */
export async function findSpellingIssues(essay: string): Promise<SpellingIssue[]> {
  const hasDict = await loadDictionary()

  const found = new Map<string, SpellingIssue>()
  const re = /\b[A-Za-z']+\b/g
  let m: RegExpExecArray | null

  while ((m = re.exec(essay)) !== null) {
    const word = m[0]
    const lower = word.toLowerCase()

    const existing = found.get(lower)
    if (existing) {
      existing.count++
      continue
    }

    // --- 1-bosqich: ma'lum xatolar ro'yxati ---
    let correct = COMMON_MISSPELLINGS[lower] ?? null

    // --- 2-bosqich: lug'atda yo'q + 1 tahrir masofasida so'z bor ---
    if (!correct && hasDict && DICT && DICT_INDEX) {
      const clean = lower.replace(/^'+|'+$/g, '')
      if (
        clean.length >= 4 &&
        !DICT.has(clean) &&
        // Egalik shakli: "student's" -> "student" tekshiriladi
        !DICT.has(clean.replace(/'s$/, '')) &&
        isCheckable(word, m.index, essay.slice(Math.max(0, m.index - 3), m.index))
      ) {
        correct = nearestWord(clean, DICT, DICT_INDEX, 1)
      }
    }

    if (!correct) continue

    found.set(lower, {
      quote: word,
      type: 'spelling',
      severity: 'medium',
      fix: matchCase(word, correct),
      note: `Imlo xatosi: "${word}" emas, "${matchCase(word, correct)}".`,
      count: 1,
    })
  }

  // Bir so'z bir necha marta uchrasa, buni izohda ko'rsatamiz —
  // takrorlanuvchi xato tasodifiy xatodan jiddiyroq.
  const issues = Array.from(found.values())
  for (const issue of issues) {
    if (issue.count > 1) {
      issue.note += ` Insho davomida ${issue.count} marta takrorlangan.`
      issue.severity = 'high' as SpellingIssue['severity']
    }
  }
  return issues
}
