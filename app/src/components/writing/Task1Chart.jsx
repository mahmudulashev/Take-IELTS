import React, { useEffect, useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { colorAt, niceMax, axisTicks, formatNumber, MAP_W, MAP_H } from '../../lib/task1-chart'

/**
 * Writing Task 1 grafigi — `chart` ma'lumotidan chiziladi, rasm emas.
 * Sababi va ma'lumot shakli: lib/task1-chart.js
 *
 * Imtihondagi kabi grafikda aniq qiymat yozuvlari yo'q (pie va jadvaldan
 * tashqari) — nomzod qiymatni o'q bo'yicha taxminan o'qiydi.
 */
export default function Task1Chart({ chart }) {
  if (!chart) return null

  const Body = { bar: BarChart, line: LineChart, pie: PieCharts, table: DataTable, map: Maps }[chart.kind]
  if (!Body) return null

  return (
    <figure className="m-0">
      <figcaption className="text-xs font-bold text-gray-800 text-center mb-3 leading-snug">
        {chart.title}
        {chart.unit && (
          <span className="block font-semibold text-gray-400 mt-0.5">({chart.unit})</span>
        )}
      </figcaption>
      <Body chart={chart} />
    </figure>
  )
}

// ---------------------------------------------------------------
// Bar va line uchun umumiy koordinatalar
// ---------------------------------------------------------------
const W = 640
const H = 300
const PAD = { r: 12, t: 12, b: 44 }
const PLOT_H = H - PAD.t - PAD.b

const yOf = (v, max) => PAD.t + PLOT_H - (v / max) * PLOT_H

function seriesMax(series) {
  return niceMax(Math.max(...series.flatMap((s) => s.values)))
}

/** Seriya rangi: ma'lumotda berilgan bo'lsa o'sha, aks holda umumiy palitra */
const seriesColor = (s, i) => s.color || colorAt(i)

/**
 * Y o'qi belgilari va chap bo'shliq. Bo'shliq eng uzun yozuvga qarab
 * hisoblanadi — "500,000" kabi uzun sonlar chetdan kesilib qolmasin.
 */
function yAxis(series) {
  const max = seriesMax(series)
  const ticks = axisTicks(max)
  const longest = Math.max(...ticks.map((t) => formatNumber(t).length))
  const l = Math.max(40, Math.ceil(longest * 8 + 16))
  return { max, ticks, l, plotW: W - l - PAD.r }
}

function Grid({ ticks, max, l }) {
  return (
    <g>
      {ticks.map((t) => {
        const y = yOf(t, max)
        return (
          <g key={t}>
            <line x1={l} x2={W - PAD.r} y1={y} y2={y} stroke={t === 0 ? '#9CA3AF' : '#E5E7EB'} strokeWidth="1" />
            <text x={l - 8} y={y + 4} textAnchor="end" fontSize="12" fill="#6B7280">
              {formatNumber(t)}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function CategoryLabel({ x, children }) {
  return (
    <text x={x} y={H - PAD.b + 20} textAnchor="middle" fontSize="12" fontWeight="600" fill="#4B5563">
      {children}
    </text>
  )
}

function Legend({ names, colors }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {names.map((name, i) => (
        <span key={name} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: colors ? colors[i] : colorAt(i) }} />
          {name}
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------
// Bar chart — guruhlangan vertikal ustunlar
// ---------------------------------------------------------------
function BarChart({ chart }) {
  const { categories, series } = chart
  const { max, ticks, l, plotW } = yAxis(series)
  const groupW = plotW / categories.length
  const innerW = groupW * 0.74
  const barW = innerW / series.length

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={chart.title}>
        <Grid ticks={ticks} max={max} l={l} />
        {categories.map((cat, ci) => {
          const groupX = l + ci * groupW
          const startX = groupX + (groupW - innerW) / 2
          return (
            <g key={cat}>
              {series.map((s, si) => {
                const y = yOf(s.values[ci], max)
                return (
                  <rect
                    key={s.name}
                    x={startX + si * barW + 1}
                    y={y}
                    width={Math.max(barW - 2, 1)}
                    height={PAD.t + PLOT_H - y}
                    rx="2"
                    fill={seriesColor(s, si)}
                  />
                )
              })}
              <CategoryLabel x={groupX + groupW / 2}>{cat}</CategoryLabel>
            </g>
          )
        })}
      </svg>
      <Legend names={series.map((s) => s.name)} colors={series.map(seriesColor)} />
    </>
  )
}

// ---------------------------------------------------------------
// Line graph
// ---------------------------------------------------------------
function LineChart({ chart }) {
  const { categories, series } = chart
  const { max, ticks, l, plotW } = yAxis(series)
  const inset = 20
  const xOf = (i) => categories.length === 1
    ? l + plotW / 2
    : l + inset + (i / (categories.length - 1)) * (plotW - inset * 2)

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={chart.title}>
        <Grid ticks={ticks} max={max} l={l} />
        {categories.map((cat, i) => (
          <CategoryLabel key={cat} x={xOf(i)}>{cat}</CategoryLabel>
        ))}
        {series.map((s, si) => (
          <g key={s.name}>
            <polyline
              points={s.values.map((v, i) => `${xOf(i)},${yOf(v, max)}`).join(' ')}
              fill="none"
              stroke={seriesColor(s, si)}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.values.map((v, i) => (
              <circle key={i} cx={xOf(i)} cy={yOf(v, max)} r="3.5" fill="#fff" stroke={seriesColor(s, si)} strokeWidth="2" />
            ))}
          </g>
        ))}
      </svg>
      <Legend names={series.map((s) => s.name)} colors={series.map(seriesColor)} />
    </>
  )
}

// ---------------------------------------------------------------
// Pie charts — bir yoki bir nechta doira, rang har birida bir xil
// ---------------------------------------------------------------
function PieCharts({ chart }) {
  // Rang nom bo'yicha bog'lanadi — ikki yil solishtirilganda
  // "Coal" ikkala doirada ham bir xil rangda bo'lishi shart.
  const names = chart.pies[0].slices.map((s) => s.name)
  const single = chart.pies.length === 1

  return (
    <>
      <div className={single ? 'max-w-[260px] mx-auto' : 'grid grid-cols-2 gap-3'}>
        {chart.pies.map((pie) => (
          <Pie key={pie.label} pie={pie} names={names} showPercent={chart.unit === '%'} />
        ))}
      </div>
      <Legend names={names} />
    </>
  )
}

function Pie({ pie, names, showPercent }) {
  const R = 90
  const total = pie.slices.reduce((sum, s) => sum + s.value, 0) || 1

  // Burchaklarni oldindan hisoblaymiz (render ichida o'zgaruvchini
  // mutatsiya qilmaslik uchun)
  const arcs = pie.slices.reduce((acc, s) => {
    const start = acc.length ? acc[acc.length - 1].end : -Math.PI / 2
    const frac = s.value / total
    acc.push({ ...s, frac, start, end: start + frac * 2 * Math.PI })
    return acc
  }, [])

  const pt = (angle, r) => [r * Math.cos(angle), r * Math.sin(angle)]

  return (
    <div className="text-center">
      <svg viewBox="-120 -120 240 240" className="w-full h-auto" role="img" aria-label={pie.label}>
        {arcs.map((a) => {
          const [x0, y0] = pt(a.start, R)
          const [x1, y1] = pt(a.end, R)
          const mid = (a.start + a.end) / 2
          const inside = a.frac >= 0.08
          const [lx, ly] = pt(mid, inside ? R * 0.62 : R + 16)
          const d = a.frac >= 0.9999
            ? `M ${-R} 0 A ${R} ${R} 0 1 1 ${R} 0 A ${R} ${R} 0 1 1 ${-R} 0 Z`
            : `M 0 0 L ${x0} ${y0} A ${R} ${R} 0 ${a.frac > 0.5 ? 1 : 0} 1 ${x1} ${y1} Z`
          return (
            <g key={a.name}>
              <path d={d} fill={colorAt(names.indexOf(a.name))} stroke="#fff" strokeWidth="1.5" />
              <text
                x={lx}
                y={ly + 4}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill={inside ? '#fff' : '#374151'}
              >
                {formatNumber(a.value)}{showPercent ? '%' : ''}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="text-xs font-bold text-gray-700 -mt-1">{pie.label}</p>
    </div>
  )
}

// ---------------------------------------------------------------
// Table
// ---------------------------------------------------------------
function DataTable({ chart }) {
  const cell = 'border border-gray-200 px-3 py-2'
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className={`${cell} text-left font-bold text-gray-500`}>{chart.axisLabel ?? ''}</th>
            {chart.categories.map((c) => (
              <th key={c} className={`${cell} text-right font-bold text-gray-700`}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chart.series.map((s) => (
            <tr key={s.name}>
              <th scope="row" className={`${cell} text-left font-semibold text-gray-700`}>{s.name}</th>
              {s.values.map((v, i) => (
                <td key={i} className={`${cell} text-right tabular-nums text-gray-800`}>{formatNumber(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------
// Maps — bir joyning ikki (yoki ko'proq) yildagi xaritasi
// ---------------------------------------------------------------
const MAP_FONT = 26
const MAP_LINE = 29

/**
 * Tor panelda xarita yozuvlari mayda chiqadi, shuning uchun xaritani
 * bosib katta ko'rinishda ochish mumkin (Esc yoki fonni bosish — yopish).
 */
function Maps({ chart }) {
  const [zoomed, setZoomed] = useState(null)

  useEffect(() => {
    if (!zoomed) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setZoomed(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  return (
    <div className="space-y-4">
      {chart.maps.map((m) => (
        <div key={m.label}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold text-gray-700">{m.label}</p>
            <button
              type="button"
              onClick={() => setZoomed(m)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800"
            >
              <Maximize2 className="w-3 h-3" />
              Kattalashtirish
            </button>
          </div>
          <button type="button" onClick={() => setZoomed(m)} className="block w-full cursor-zoom-in" aria-label={`${m.label} xaritasini kattalashtirish`}>
            <MapSvg chart={chart} map={m} />
          </button>
        </div>
      ))}

      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setZoomed(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${chart.title}: ${zoomed.label}`}
        >
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-[960px] max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-800">{chart.title} — {zoomed.label}</p>
              <button type="button" onClick={() => setZoomed(null)} className="p-1 text-gray-500 hover:text-gray-900" aria-label="Yopish">
                <X className="w-5 h-5" />
              </button>
            </div>
            <MapSvg chart={chart} map={zoomed} />
          </div>
        </div>
      )}
    </div>
  )
}

function MapSvg({ chart, map: m }) {
  return (
    <svg
      viewBox={`-3 -3 ${MAP_W + 6} ${MAP_H + 6}`}
      className="w-full h-auto"
      role="img"
      aria-label={`${chart.title}: ${m.label}`}
    >
      <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#fff" />
      {m.features.map((f, i) => <MapFeature key={i} f={f} />)}
      {chart.road && <Road road={chart.road} />}
      <NorthArrow />
      <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="none" stroke="#111827" strokeWidth="5" />
    </svg>
  )
}

function MapLabel({ x, y, text }) {
  const lines = text.split('\n')
  const top = y - ((lines.length - 1) * MAP_LINE) / 2
  return (
    <text textAnchor="middle" fontSize={MAP_FONT} fontWeight="700" fill="#1F2937" letterSpacing="0.5">
      {lines.map((line, i) => (
        <tspan key={i} x={x} y={top + i * MAP_LINE + MAP_FONT * 0.35}>{line}</tspan>
      ))}
    </text>
  )
}

function MapFeature({ f }) {
  const fill = f.color || '#fff'
  const cx = f.x + f.w / 2
  const cy = f.y + f.h / 2
  const label = f.label ?? f.name.toUpperCase()
  return (
    <g>
      {f.shape === 'blob'
        ? <path d={blobPath(f)} fill={fill} />
        : <rect x={f.x} y={f.y} width={f.w} height={f.h} fill={fill} stroke="#374151" strokeWidth="2" />}
      <MapLabel x={cx} y={cy} text={label} />
    </g>
  )
}

/**
 * Park kabi tartibsiz hudud: ellips chetini to'lqinlantiramiz. Shakl
 * har safar bir xil chiqadi (tasodif yo'q) — ikki xaritada bir joy
 * bir xil ko'rinsin.
 */
function blobPath(f) {
  const cx = f.x + f.w / 2
  const cy = f.y + f.h / 2
  const n = 48
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (i / n) * 2 * Math.PI
    const k = 1 + 0.07 * Math.sin(3 * t + 0.6) + 0.05 * Math.cos(5 * t)
    return [cx + (f.w / 2) * 0.93 * k * Math.cos(t), cy + (f.h / 2) * 0.93 * k * Math.sin(t)]
  })
  return `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')} Z`
}

function Road({ road }) {
  const [x0, y0] = road.from
  const [x1, y1] = road.to
  const half = road.width / 2
  const angle = Math.atan2(y1 - y0, x1 - x0)
  // Yo'l bo'ylab ikki chet chizig'i
  const nx = Math.sin(angle) * half
  const ny = -Math.cos(angle) * half
  const edges = [[nx, ny], [-nx, -ny]]
  // Yozuv pastdan yuqoriga o'qilsin (darslikdagidek)
  const deg = (angle * 180) / Math.PI
  const textDeg = deg > 90 || deg < -90 ? deg + 180 : deg
  const mx = (x0 + x1) / 2
  const my = (y0 + y1) / 2
  return (
    <g>
      <polygon
        points={`${x0 + nx},${y0 + ny} ${x1 + nx},${y1 + ny} ${x1 - nx},${y1 - ny} ${x0 - nx},${y0 - ny}`}
        fill="#fff"
      />
      {edges.map(([ex, ey], i) => (
        <line key={i} x1={x0 + ex} y1={y0 + ey} x2={x1 + ex} y2={y1 + ey} stroke="#111827" strokeWidth="2.5" />
      ))}
      <text
        x={mx}
        y={my}
        transform={`rotate(${textDeg} ${mx} ${my})`}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={MAP_FONT}
        fontWeight="700"
        fill="#1F2937"
        letterSpacing="1"
      >
        {road.name.toUpperCase()}
      </text>
    </g>
  )
}

function NorthArrow() {
  const x = MAP_W - 66
  return (
    <g>
      <rect x={x} y="0" width="66" height="88" fill="#fff" stroke="#9CA3AF" strokeWidth="2" />
      <path d={`M ${x + 33} 12 L ${x + 45} 40 L ${x + 33} 33 L ${x + 21} 40 Z`} fill="#111827" />
      <text x={x + 33} y="74" textAnchor="middle" fontSize="28" fontWeight="800" fill="#111827">N</text>
    </g>
  )
}
