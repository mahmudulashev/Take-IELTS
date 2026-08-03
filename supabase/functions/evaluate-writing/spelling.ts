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
 * Shuning uchun eng ko'p uchraydigan xatolarni ro'yxat bo'yicha
 * qidiramiz. Bu to'liq lug'at emas — 100% qamrov bermaydi, lekin
 * topganini 100% aniqlik bilan topadi va hech qachon "o'ylab
 * topmaydi". IELTS insholarida uchraydigan klassik xatolar
 * qamrab olingan.
 */

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
export function findSpellingIssues(essay: string): SpellingIssue[] {
  const found = new Map<string, SpellingIssue>()
  const re = /\b[A-Za-z']+\b/g
  let m: RegExpExecArray | null

  while ((m = re.exec(essay)) !== null) {
    const word = m[0]
    const lower = word.toLowerCase()
    const correct = COMMON_MISSPELLINGS[lower]
    if (!correct) continue

    const existing = found.get(lower)
    if (existing) {
      existing.count++
      continue
    }

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
