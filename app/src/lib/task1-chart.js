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
 *   pies       — faqat pie: [{ label, slices: [{ name, value }] }]
 */

export const SERIES_COLORS = ['#FF3131', '#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#64748B']

export const colorAt = (i) => SERIES_COLORS[i % SERIES_COLORS.length]

const KIND_NAMES = {
  bar: 'Bar chart',
  line: 'Line graph',
  pie: 'Pie charts',
  table: 'Table',
}

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
  for (const fact of chart.kind === 'pie' ? pieFacts(chart) : tabularFacts(chart)) {
    lines.push(`- ${fact}`)
  }

  return lines.join('\n')
}
