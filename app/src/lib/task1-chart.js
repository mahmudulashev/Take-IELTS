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
 *                [{ name, values: [...] }], values tartibi categories bilan bir xil
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

/**
 * Grafikni AI uchun oddiy jadval matniga aylantiradi.
 * Masalan:
 *   Bar chart: Average weekly hours ... (hours per week)
 *   Age group | 16–24 | 25–34 | ...
 *   Social media | 18 | 12 | ...
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

  return lines.join('\n')
}
