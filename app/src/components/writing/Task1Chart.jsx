import React from 'react'
import { colorAt, niceMax, axisTicks, formatNumber } from '../../lib/task1-chart'

/**
 * Writing Task 1 grafigi — `chart` ma'lumotidan chiziladi, rasm emas.
 * Sababi va ma'lumot shakli: lib/task1-chart.js
 *
 * Imtihondagi kabi grafikda aniq qiymat yozuvlari yo'q (pie va jadvaldan
 * tashqari) — nomzod qiymatni o'q bo'yicha taxminan o'qiydi.
 */
export default function Task1Chart({ chart }) {
  if (!chart) return null

  const Body = { bar: BarChart, line: LineChart, pie: PieCharts, table: DataTable }[chart.kind]
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
// l: 60 — "500,000" kabi olti xonali o'q yozuvlari sig'ishi uchun
const PAD = { l: 60, r: 12, t: 12, b: 44 }
const PLOT_W = W - PAD.l - PAD.r
const PLOT_H = H - PAD.t - PAD.b

const yOf = (v, max) => PAD.t + PLOT_H - (v / max) * PLOT_H

function seriesMax(series) {
  return niceMax(Math.max(...series.flatMap((s) => s.values)))
}

function Grid({ ticks, max }) {
  return (
    <g>
      {ticks.map((t) => {
        const y = yOf(t, max)
        return (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke={t === 0 ? '#9CA3AF' : '#E5E7EB'} strokeWidth="1" />
            <text x={PAD.l - 8} y={y + 4} textAnchor="end" fontSize="12" fill="#6B7280">
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

function Legend({ names }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {names.map((name, i) => (
        <span key={name} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: colorAt(i) }} />
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
  const max = seriesMax(series)
  const groupW = PLOT_W / categories.length
  const innerW = groupW * 0.74
  const barW = innerW / series.length

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={chart.title}>
        <Grid ticks={axisTicks(max)} max={max} />
        {categories.map((cat, ci) => {
          const groupX = PAD.l + ci * groupW
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
                    fill={colorAt(si)}
                  />
                )
              })}
              <CategoryLabel x={groupX + groupW / 2}>{cat}</CategoryLabel>
            </g>
          )
        })}
      </svg>
      <Legend names={series.map((s) => s.name)} />
    </>
  )
}

// ---------------------------------------------------------------
// Line graph
// ---------------------------------------------------------------
function LineChart({ chart }) {
  const { categories, series } = chart
  const max = seriesMax(series)
  const inset = 20
  const xOf = (i) => categories.length === 1
    ? PAD.l + PLOT_W / 2
    : PAD.l + inset + (i / (categories.length - 1)) * (PLOT_W - inset * 2)

  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={chart.title}>
        <Grid ticks={axisTicks(max)} max={max} />
        {categories.map((cat, i) => (
          <CategoryLabel key={cat} x={xOf(i)}>{cat}</CategoryLabel>
        ))}
        {series.map((s, si) => (
          <g key={s.name}>
            <polyline
              points={s.values.map((v, i) => `${xOf(i)},${yOf(v, max)}`).join(' ')}
              fill="none"
              stroke={colorAt(si)}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.values.map((v, i) => (
              <circle key={i} cx={xOf(i)} cy={yOf(v, max)} r="3.5" fill="#fff" stroke={colorAt(si)} strokeWidth="2" />
            ))}
          </g>
        ))}
      </svg>
      <Legend names={series.map((s) => s.name)} />
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
