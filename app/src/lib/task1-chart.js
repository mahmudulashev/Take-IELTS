/**
 * Writing Task 1 grafiklari uchun umumiy yordamchilar.
 *
 * NIMA UCHUN GRAFIK RASM EMAS, MA'LUMOTDAN CHIZILADI:
 * AI baholovchi rasmni ko'rmaydi — u faqat matn oladi. Ma'lumot bitta
 * joyda tursa, ekrandagi grafik va AI'ga yuborilgan raqamlar hech qachon
 * bir-biridan farq qilmaydi. Shunda "raqam noto'g'ri keltirilgan" degan
 * izoh ishonchli bo'ladi, rasm bilan esa buni kafolatlab bo'lmaydi.
 *
 * Grafik shakli (`chart`):
 *   kind       — 'bar' | 'line' | 'pie' | 'table'
 *   title      — grafik sarlavhasi
 *   unit       — o'lchov birligi ('%', 'millions', ...)
 *   categories — bar/line: X o'qi; table: ustunlar
 *   series     — bar/line: chiziq/ustun guruhlari; table: qatorlar
 *                [{ name, values: [...], color? }], values tartibi categories bilan bir xil;
 *                color berilmasa SERIES_COLORS'dan olinadi
 *   ordered    — bar/line/table: categories ketma-ketlikmi (yillar, yosh guruhlari).
 *                Mahsulotlar kabi alohida narsalar uchun `false` — trend faktlari chiqmaydi
 *   pies       — faqat pie: [{ label, slices: [{ name, value }] }]
 *
 * Xarita (`kind: 'map'`) — raqam yo'q, joy va o'zgarish bor:
 *   road  — { name, from: [x, y], to: [x, y], width } — barcha xaritalarda bir xil
 *   maps  — [{ label, features: [...] }], odatda ikki yil
 *   feature — { name, label?, x, y, w, h, shape?: 'blob', color?, use, note? }
 *     koordinatalar MAP_W × MAP_H maydonida, shimol — tepada;
 *     label — xaritadagi yozuv ('\n' bilan qatorlarga bo'linadi), berilmasa name;
 *     use   — maqsad guruhi ('Housing', 'Public green space', ...) — umumiy
 *             o'zgarishni (overview) tekshirish uchun faktlar shu bo'yicha guruhlanadi.
 *   Qaysi joy nimaga aylangani nomdan emas, GEOMETRIYADAN hisoblanadi
 *   (bir xil joydagi ikki obyekt — o'sha joyning o'zgarishi).
 */

export const SERIES_COLORS = ['#FF3131', '#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#64748B']

export const colorAt = (i) => SERIES_COLORS[i % SERIES_COLORS.length]

const KIND_NAMES = {
  bar: 'Bar chart',
  line: 'Line graph',
  pie: 'Pie charts',
  table: 'Table',
  map: 'Maps',
}

/** Xarita maydoni o'lchami (SVG viewBox ham shu) */
export const MAP_W = 900
export const MAP_H = 570

/** O'q uchun yumaloq yuqori chegara: 19 → 20, 5.2 → 6, 480 → 500 */
export function niceMax(value) {
  if (!(value > 0)) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(value)))
  const f = value / exp
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
  return steps.find((s) => f <= s + 1e-9) * exp
}

/**
 * O'q belgilari. Butun qadam beradigan bo'linishni tanlaymiz —
 * 0, 1.2, 2.4 kabi belgilar grafikdan qiymat o'qishni qiyinlashtiradi.
 */
export function axisTicks(max) {
  const n = [5, 4, 6, 3].find((k) => Number.isInteger(Math.round((max / k) * 1e6) / 1e6)) ?? 5
  const step = max / n
  return Array.from({ length: n + 1 }, (_, i) => Math.round(i * step * 1e6) / 1e6)
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
}

const round = (n) => Math.round(n * 1e6) / 1e6
const signed = (n) => (n > 0 ? '+' : '−') + formatNumber(Math.abs(n))

/**
 * Bar/line grafikdan qiymat o'qishda ruxsat etilgan chetlanish.
 *
 * Bu grafiklarda qiymat yozuvlari yo'q — nomzod qiymatni o'q bo'yicha
 * taxminan o'qiydi. Ruxsat — o'q belgilari orasidagi qadamning choragi:
 * 0–20 o'qda (qadam 4) ±1. Pie va jadvalda raqam yozilgan, ruxsat 0.
 */
export function readingTolerance(chart) {
  if (chart.kind !== 'bar' && chart.kind !== 'line') return 0
  const max = niceMax(Math.max(...chart.series.flatMap((s) => s.values)))
  return round(axisTicks(max)[1] / 4)
}

/** "A 18 > B 8 = C 8" ko'rinishidagi tartib */
function rankingText(items, suffix) {
  const sorted = [...items].sort((a, b) => b.value - a.value)
  return sorted
    .map((x, k) => (k === 0 ? '' : x.value === sorted[k - 1].value ? ' = ' : ' > ') + `${x.name} ${formatNumber(x.value)}${suffix}`)
    .join('')
}

/** Bar, line va table uchun tayanch faktlar */
function tabularFacts(chart) {
  const { categories: cats, series } = chart
  const suffix = chart.unit === '%' ? '%' : ''
  const where = chart.kind === 'table' ? 'table' : 'chart'
  const facts = []

  const cells = series.flatMap((s) => s.values.map((v, i) => ({ s: s.name, c: cats[i], v })))
  for (const [label, pick] of [['Highest', Math.max], ['Lowest', Math.min]]) {
    const target = pick(...cells.map((x) => x.v))
    const at = cells.filter((x) => x.v === target).map((x) => `${x.s}, ${x.c}`)
    facts.push(`${label} value in the whole ${where}: ${formatNumber(target)}${suffix} — ${at.join('; ')}`)
  }

  cats.forEach((cat, i) => {
    facts.push(`Ranking in ${cat}: ${rankingText(series.map((s) => ({ name: s.name, value: s.values[i] })), suffix)}`)
  })

  // Kategoriyalar ketma-ketlik bo'lmasa (Cars, Books, ...) "o'sish",
  // "kesishish" degan faktlar ma'nosiz va modelni chalg'itadi. O'rniga
  // "eng kam sarflangan mahsulot" kabi da'volarni tekshirish uchun har
  // seriya ichidagi tartib, jami va tafovut beriladi.
  if (chart.ordered === false) {
    for (const s of series) {
      facts.push(`${s.name} ranking across ${where === 'table' ? 'columns' : 'categories'}: ${rankingText(cats.map((c, i) => ({ name: c, value: s.values[i] })), suffix)}`)
    }
    if (series.length > 1 && suffix !== '%') {
      facts.push(`Combined total of all series, by category: ${rankingText(cats.map((c, i) => ({ name: c, value: round(series.reduce((sum, s) => sum + s.values[i], 0)) })), '')}`)
    }
    if (series.length === 2) {
      const [a, b] = series
      facts.push(`Gap between ${a.name} and ${b.name}, by category (largest first): ${rankingText(cats.map((c, i) => ({ name: c, value: round(Math.abs(a.values[i] - b.values[i])) })), suffix)}`)
    }
    return facts
  }

  for (const s of series) {
    const first = s.values[0]
    const last = s.values[s.values.length - 1]
    const hi = Math.max(...s.values)
    const lo = Math.min(...s.values)
    const at = (v) => cats.filter((_, i) => s.values[i] === v).join(', ')
    const change = round(last - first)
    facts.push(
      `${s.name}: ${formatNumber(first)}${suffix} (${cats[0]}) → ${formatNumber(last)}${suffix} (${cats[cats.length - 1]}), `
      + `${change === 0 ? 'no net change' : `net change ${signed(change)}`}; `
      + `highest ${formatNumber(hi)}${suffix} at ${at(hi)}, lowest ${formatNumber(lo)}${suffix} at ${at(lo)}`,
    )
  }

  // Kesishishlar va tenglik. Nol farq (tenglik) kesishishni "yashirmasligi"
  // uchun oxirgi nol bo'lmagan ishorani eslab qolamiz: 4, 2, 0, −4 → kesishish bor.
  for (let a = 0; a < series.length; a++) {
    for (let b = a + 1; b < series.length; b++) {
      let prevSign = 0
      let prevIdx = -1
      series[a].values.forEach((va, i) => {
        const d = round(va - series[b].values[i])
        const sign = Math.sign(d)
        if (sign === 0) {
          facts.push(`${series[a].name} and ${series[b].name} are equal at ${cats[i]} (${formatNumber(va)}${suffix})`)
          return
        }
        if (prevSign !== 0 && sign !== prevSign) {
          const [higher, lower] = sign > 0 ? [series[a].name, series[b].name] : [series[b].name, series[a].name]
          facts.push(`${higher} becomes higher than ${lower} between ${cats[prevIdx]} and ${cats[i]}`)
        }
        prevSign = sign
        prevIdx = i
      })
    }
  }

  if (series.length > 1) {
    const unit = chart.kind === 'table' ? 'row' : 'series'
    for (let i = 0; i < cats.length - 1; i++) {
      const dirs = series.map((s) => Math.sign(round(s.values[i + 1] - s.values[i])))
      if (dirs.every((d) => d > 0)) facts.push(`From ${cats[i]} to ${cats[i + 1]} every ${unit} rose`)
      if (dirs.every((d) => d < 0)) facts.push(`From ${cats[i]} to ${cats[i + 1]} every ${unit} fell`)
    }
  }

  return facts
}

/** Pie chart'lar uchun tayanch faktlar */
function pieFacts(chart) {
  const suffix = chart.unit === '%' ? '%' : ''
  const facts = chart.pies.map((pie) => `Ranking in ${pie.label}: ${rankingText(pie.slices, suffix)}`)

  if (chart.pies.length > 1) {
    const first = chart.pies[0]
    const last = chart.pies[chart.pies.length - 1]
    const points = suffix === '%' ? ' percentage points' : ''
    const changes = first.slices.map((s) => {
      const to = last.slices.find((x) => x.name === s.name)?.value ?? 0
      return { name: s.name, from: s.value, to, d: round(to - s.value) }
    })

    for (const c of changes) {
      facts.push(
        `${c.name}: ${formatNumber(c.from)}${suffix} (${first.label}) → ${formatNumber(c.to)}${suffix} (${last.label}), `
        + (c.d === 0 ? 'no change' : `change ${signed(c.d)}${points}`),
      )
    }

    const up = changes.reduce((m, c) => (c.d > m.d ? c : m))
    const down = changes.reduce((m, c) => (c.d < m.d ? c : m))
    if (up.d > 0) facts.push(`Largest increase: ${up.name} (${signed(up.d)}${points})`)
    if (down.d < 0) facts.push(`Largest decrease: ${down.name} (${signed(down.d)}${points})`)

    const leader = (pie) => [...pie.slices].sort((a, b) => b.value - a.value)[0].name
    if (leader(first) !== leader(last)) {
      facts.push(`The largest share changes from ${leader(first)} (${first.label}) to ${leader(last)} (${last.label})`)
    }
  }

  return facts
}

// ---------------------------------------------------------------
// Xaritalar
// ---------------------------------------------------------------

/** Obyekt markazining kompas yo'nalishi — xarita uchga bo'lingan har o'qda */
function compass(cx, cy) {
  const row = ['north', '', 'south'][Math.min(2, Math.floor((cy / MAP_H) * 3))]
  const col = ['west', '', 'east'][Math.min(2, Math.floor((cx / MAP_W) * 3))]
  if (row && col) return `${row}-${col}`
  return row || col || 'centre'
}

/** Yo'l o'qining berilgan balandlikdagi x koordinatasi */
function roadXAt(road, y) {
  const [x0, y0] = road.from
  const [x1, y1] = road.to
  return x0 + ((y - y0) / (y1 - y0)) * (x1 - x0)
}

/** "north-west, west of High Street" */
export function mapPlace(f, road) {
  const cx = f.x + f.w / 2
  const cy = f.y + f.h / 2
  const where = compass(cx, cy)
  if (!road) return where
  return `${where}, ${cx < roadXAt(road, cy) ? 'west' : 'east'} of ${road.name}`
}

/** Ikki to'rtburchak kesishuvining kichigiga nisbati: 1 — biri ikkinchisi ichida */
function overlapShare(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
  if (w <= 0 || h <= 0) return 0
  return (w * h) / Math.min(a.w * a.h, b.w * b.h)
}

/**
 * Birinchi va oxirgi xaritani joy bo'yicha solishtiradi. Joyning yarmidan
 * ko'pi ustma-ust tushsa — bu bitta joy: nomi bir xil bo'lsa saqlangan,
 * boshqa bo'lsa almashtirilgan.
 */
function mapFacts(chart) {
  const first = chart.maps[0]
  const last = chart.maps[chart.maps.length - 1]
  const road = chart.road
  const place = (f) => mapPlace(f, road)
  const facts = []

  const used = new Set()
  const unchanged = []
  for (const before of first.features) {
    const candidates = last.features
      .map((after) => ({ after, share: overlapShare(before, after) }))
      .filter((c) => c.share >= 0.5 && !used.has(c.after))
      .sort((a, b) => b.share - a.share)
    const match = candidates[0]?.after

    if (!match) {
      facts.push(`Removed: ${before.name} (${place(before)}) — nothing stands on this site in ${last.label}`)
      continue
    }
    used.add(match)

    if (match.name === before.name) {
      const ratio = (match.w * match.h) / (before.w * before.h)
      if (ratio >= 1.3) {
        facts.push(`Enlarged: ${before.name} (${place(before)}) — its site is about ${formatNumber(Math.round(ratio * 10) / 10)} times larger in ${last.label}`)
      } else if (ratio <= 0.77) {
        facts.push(`Reduced: ${before.name} (${place(before)}) — its site is smaller in ${last.label}`)
      } else {
        unchanged.push(`${before.name} (${place(before)})`)
      }
    } else {
      facts.push(`Replaced: ${before.name} (${first.label}) → ${match.name} (${last.label}), ${place(match)}`)
    }
  }

  for (const after of last.features) {
    if (!used.has(after)) {
      facts.push(`New: ${after.name} (${place(after)}) — built on land that was empty in ${first.label}`)
    }
  }

  if (road) unchanged.push(`${road.name} (same route in both maps)`)
  facts.unshift(`Unchanged: ${unchanged.length ? unchanged.join('; ') : 'nothing'}`)

  // Maqsad bo'yicha guruhlar — overview ("yashil hudud yo'qoldi, uy-joy
  // ko'paydi") shu yerdan tekshiriladi.
  const uses = [...new Set(chart.maps.flatMap((m) => m.features.map((f) => f.use)).filter(Boolean))]
  for (const use of uses) {
    const list = (m) => {
      const names = m.features.filter((f) => f.use === use).map((f) => f.name)
      if (!names.length) return 'none'
      return [...new Set(names)]
        .map((n) => { const k = names.filter((x) => x === n).length; return k > 1 ? `${n} (×${k})` : n })
        .join(', ')
    }
    facts.push(`${use}: ${first.label} — ${list(first)}; ${last.label} — ${list(last)}`)
  }

  return facts
}

function mapToText(chart) {
  const lines = [`${KIND_NAMES.map}: ${chart.title}`, 'North is at the top of each map.']
  if (chart.road) {
    const [fx, fy] = chart.road.from
    const [tx, ty] = chart.road.to
    lines.push(`${chart.road.name} runs in a straight line from the ${compass(fx, fy)} edge to the ${compass(tx, ty)} edge.`)
  }
  for (const m of chart.maps) {
    lines.push('', `${m.label}:`)
    for (const f of m.features) {
      lines.push(`- ${f.name} — ${mapPlace(f, chart.road)}${f.note ? ` (${f.note})` : ''}`)
    }
  }

  lines.push('', 'REFERENCE FACTS (computed by code from the maps above — always correct):')
  lines.push('- This visual is a pair of maps: there are no figures. In "data_checks" record every claim about LOCATION (compass direction, side of the street) and about CHANGE (built, demolished, replaced, converted, enlarged, unchanged), and check each against these facts.')
  lines.push('- Compass positions divide each map into thirds, so they are approximate: a neighbouring direction ("in the north" for a north-west site) is an approximation, not an error. Placing a site on the wrong side of the street, or in the opposite part of town, is inaccurate.')
  lines.push('- Key features for a map task are the main transformations, not every site. A clear overview states the overall direction of change, which the use groups below show.')
  lines.push('- The precise vocabulary for maps is that of change and location: was replaced by, was demolished, was converted into, was extended, made way for, to the north of, opposite, alongside. It plays the role that trend and comparison vocabulary plays for charts.')
  for (const fact of mapFacts(chart)) lines.push(`- ${fact}`)
  return lines.join('\n')
}

/**
 * Grafikni AI uchun matnga aylantiradi: avval ma'lumot jadvali, keyin
 * kod hisoblagan tayanch faktlar.
 *
 * NIMA UCHUN FAKTLAR KODDA HISOBLANADI:
 * Birinchi sinovda model "18 — butun grafikdagi eng yuqori qiymat" degan
 * da'voni to'g'ri deb qabul qildi, holbuki boshqa seriyada 19 bor edi.
 * Model eng katta qiymatni faqat gap tegishli seriya ichidan qidirgan.
 * Bunday hisobni modelga ishonib bo'lmaydi — kod adashmaydi.
 */
export function chartToText(chart) {
  if (!chart) return ''
  if (chart.kind === 'map') return mapToText(chart)

  const unit = chart.unit ? ` (${chart.unit})` : ''
  const lines = [`${KIND_NAMES[chart.kind] ?? chart.kind}: ${chart.title}${unit}`]

  if (chart.kind === 'pie') {
    const suffix = chart.unit === '%' ? '%' : ''
    for (const pie of chart.pies) {
      lines.push(`${pie.label}: ` + pie.slices.map((s) => `${s.name} ${s.value}${suffix}`).join(', '))
    }
  } else {
    // bar, line va table uchun bir xil jadval ko'rinishi
    lines.push([chart.axisLabel ?? '', ...chart.categories].join(' | '))
    for (const s of chart.series) {
      lines.push([s.name, ...s.values].join(' | '))
    }
  }

  const tolerance = readingTolerance(chart)
  lines.push('', 'REFERENCE FACTS (computed by code from the data above — always correct):')
  lines.push(tolerance > 0
    ? `- Reading tolerance: this ${KIND_NAMES[chart.kind].toLowerCase()} has no value labels, so a stated figure within ±${formatNumber(tolerance)} of the true value is an accurate reading.`
    : '- Reading tolerance: the figures were printed on the visual, so stated figures should match; sensible rounding with hedging words is still acceptable.')
  if (chart.kind !== 'pie' && chart.ordered === false) {
    lines.push('- The categories are separate items, not a sequence (not years or stages): there is no trend across them, so "rose", "fell" or "overtook" across categories is not a valid reading.')
  }
  for (const fact of chart.kind === 'pie' ? pieFacts(chart) : tabularFacts(chart)) {
    lines.push(`- ${fact}`)
  }

  return lines.join('\n')
}
