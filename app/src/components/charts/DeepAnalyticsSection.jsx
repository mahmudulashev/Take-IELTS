import React from 'react'
import {
  Radar,
  PieChart,
  BarChart3,
  Grid3x3,
  Timer,
  Flame,
  AlertTriangle,
} from 'lucide-react'

/**
 * "Chuqurroq Tahlil" — extra analytics cards (handoff mockup 1i).
 * Built in the same card language as the existing dashboard cards so the
 * whole block can be dropped straight into the analytics row.
 */

const SKILL_AXES = ['MCQ', 'T/F/NG', 'Completion', 'Matching', 'Map/Plan']

// Per-question-type data is not stored on a result row, so — following the
// same convention SkillBreakdownCard already uses — each skill is offset from
// the measured overall accuracy for that test type.
const SKILL_OFFSETS = [0, -5, -18, -2, -12]

function accuracyOf(results) {
  if (!results || results.length === 0) return 0
  const totalQuestions = results.reduce((sum, r) => sum + (r.total_questions || 40), 0)
  const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0)
  return totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0
}

function clampPct(v) {
  return Math.max(0, Math.min(100, v))
}

/* ---------------------------------------------------------------- Radar --- */

function polarPoint(cx, cy, radius, index, count) {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]
}

function ringPoints(cx, cy, radius, count) {
  return Array.from({ length: count }, (_, i) => polarPoint(cx, cy, radius, i, count))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
}

function seriesPoints(cx, cy, maxRadius, values) {
  return values
    .map((v, i) => polarPoint(cx, cy, (clampPct(v) / 100) * maxRadius, i, values.length))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
}

function SkillRadarCard({ readingAccuracy, listeningAccuracy }) {
  const cx = 110
  const cy = 110
  const maxRadius = 90

  const readingValues = SKILL_OFFSETS.map(o => clampPct(readingAccuracy + o))
  const listeningValues = SKILL_OFFSETS.map(o => clampPct(listeningAccuracy + o - 3))

  const labelAnchors = [
    { x: 110, y: 12, anchor: 'middle' },
    { x: 205, y: 80, anchor: 'end' },
    { x: 176, y: 197, anchor: 'middle' },
    { x: 44, y: 197, anchor: 'middle' },
    { x: 14, y: 80, anchor: 'start' },
  ]

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
        <Radar className="w-3.5 h-3.5" />
        <span>Ko'nikma profili</span>
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Savol turlari radari</h3>
      <p className="text-xs text-gray-500 mb-3">Reading va Listening solishtirmasi</p>

      <svg viewBox="0 0 220 230" className="w-full h-auto">
        <g fill="none" stroke="#eef0f4" strokeWidth="1">
          <polygon points={ringPoints(cx, cy, maxRadius, 5)} />
          <polygon points={ringPoints(cx, cy, maxRadius * (2 / 3), 5)} />
          <polygon points={ringPoints(cx, cy, maxRadius / 3, 5)} />
          {SKILL_AXES.map((_, i) => {
            const [x, y] = polarPoint(cx, cy, maxRadius, i, 5)
            return <line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} />
          })}
        </g>

        <polygon
          points={seriesPoints(cx, cy, maxRadius, listeningValues)}
          fill="rgba(37,99,235,.14)"
          stroke="#2563eb"
          strokeWidth="2"
        />
        <polygon
          points={seriesPoints(cx, cy, maxRadius, readingValues)}
          fill="rgba(255,49,49,.16)"
          stroke="#FF3131"
          strokeWidth="2.5"
        />

        <g fill="#fff" stroke="#FF3131" strokeWidth="2">
          {readingValues.map((v, i) => {
            const [x, y] = polarPoint(cx, cy, (clampPct(v) / 100) * maxRadius, i, 5)
            return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.5" />
          })}
        </g>

        <g fill="#6b7280" fontSize="10" fontWeight="700" fontFamily="'Plus Jakarta Sans',sans-serif">
          {SKILL_AXES.map((label, i) => (
            <text key={label} x={labelAnchors[i].x} y={labelAnchors[i].y} textAnchor={labelAnchors[i].anchor}>
              {label}
            </text>
          ))}
        </g>

        <g fontSize="11" fontWeight="700" fontFamily="'Plus Jakarta Sans',sans-serif">
          <circle cx="52" cy="220" r="5" fill="#FF3131" />
          <text x="63" y="224" fill="#4b5563">Reading</text>
          <circle cx="128" cy="220" r="5" fill="#2563eb" />
          <text x="139" y="224" fill="#4b5563">Listening</text>
        </g>
      </svg>
    </div>
  )
}

/* --------------------------------------------------------- Accuracy ring --- */

function AccuracyRingCard({ readingAccuracy, listeningAccuracy, bestBand, targetBand }) {
  const outerCirc = 2 * Math.PI * 70
  const innerCirc = 2 * Math.PI * 50
  const gap = Math.max(0, (parseFloat(targetBand) || 7.5) - (parseFloat(bestBand) || 0))

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col">
      <div className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
        <PieChart className="w-3.5 h-3.5" />
        <span>Umumiy aniqlik</span>
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Aniqlik va maqsad</h3>
      <p className="text-xs text-gray-500 mb-2">Band {targetBand} maqsadiga nisbatan</p>

      <div className="relative w-[200px] h-[200px] mx-auto mt-2 mb-4">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          <circle cx="100" cy="100" r="70" fill="none" stroke="#f3f4f6" strokeWidth="18" />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="#FF3131"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${((clampPct(readingAccuracy) / 100) * outerCirc).toFixed(1)} ${outerCirc.toFixed(1)}`}
          />
          <circle cx="100" cy="100" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx="100"
            cy="100"
            r="50"
            fill="none"
            stroke="#2563eb"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${((clampPct(listeningAccuracy) / 100) * innerCirc).toFixed(1)} ${innerCirc.toFixed(1)}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[34px] font-extrabold text-gray-900 tracking-tight leading-none">
            {readingAccuracy}%
          </div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-1">Reading</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mt-auto">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-2 text-gray-900">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3131]" />
            Reading aniqlik
          </span>
          <span className="font-mono text-gray-900">{readingAccuracy}%</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-2 text-gray-900">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
            Listening aniqlik
          </span>
          <span className="font-mono text-gray-900">{listeningAccuracy}%</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold pt-2.5 border-t border-gray-100">
          <span className="text-gray-500">Maqsadgacha</span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px]">
            {gap > 0 ? `+${gap.toFixed(1)} band` : 'Maqsadga yetdingiz'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------- Monthly compare --- */

const UZ_MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']

function monthlyAverages(results) {
  const buckets = new Map()
  results.forEach(r => {
    const raw = r.completed_at || r.created_at || r.date
    const d = raw ? new Date(raw) : null
    if (!d || isNaN(d)) return
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!buckets.has(key)) buckets.set(key, { month: d.getMonth(), year: d.getFullYear(), reading: [], listening: [] })
    const band = parseFloat(r.band_score || 0)
    if (!band) return
    buckets.get(key)[r.test_type === 'reading' ? 'reading' : 'listening'].push(band)
  })

  const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null)

  return [...buckets.values()]
    .sort((a, b) => (a.year - b.year) || (a.month - b.month))
    .slice(-5)
    .map(b => ({
      label: UZ_MONTHS_SHORT[b.month],
      reading: avg(b.reading),
      listening: avg(b.listening),
    }))
}

function MonthlyCompareCard({ results }) {
  const months = monthlyAverages(results)

  // y axis: band 5.0 at y=180, band 9.0 at y=20 (40px per band)
  const bandToY = band => 180 - (Math.max(5, Math.min(9, band)) - 5) * 40
  const groupWidth = 56
  const firstGroupX = 38

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
        <BarChart3 className="w-3.5 h-3.5" />
        <span>Oylik solishtirma</span>
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Reading vs Listening</h3>
      <p className="text-xs text-gray-500 mb-5">O'rtacha band, oy bo'yicha</p>

      <svg viewBox="0 0 320 220" className="w-full h-auto">
        <g stroke="#f1f5f9" strokeWidth="1">
          {[180, 140, 100, 60, 20].map(y => (
            <line key={y} x1="28" y1={y} x2="312" y2={y} />
          ))}
        </g>
        <g fill="#9ca3af" fontSize="10" fontWeight="600" textAnchor="end" fontFamily="'Plus Jakarta Sans',sans-serif">
          {[['5.0', 183], ['6.0', 143], ['7.0', 103], ['8.0', 63], ['9.0', 23]].map(([label, y]) => (
            <text key={label} x="22" y={y}>{label}</text>
          ))}
        </g>

        {months.map((m, i) => {
          const x = firstGroupX + i * groupWidth
          return (
            <g key={`${m.label}-${i}`}>
              {m.reading != null && (
                <rect x={x} y={bandToY(m.reading)} width="16" height={180 - bandToY(m.reading)} rx="4" fill="#FF3131" />
              )}
              {m.listening != null && (
                <rect x={x + 20} y={bandToY(m.listening)} width="16" height={180 - bandToY(m.listening)} rx="4" fill="#93c5fd" />
              )}
            </g>
          )
        })}

        <g fill="#9ca3af" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="'Plus Jakarta Sans',sans-serif">
          {months.map((m, i) => (
            <text key={`${m.label}-label-${i}`} x={firstGroupX + i * groupWidth + 18} y="197">{m.label}</text>
          ))}
        </g>

        <g fontSize="11" fontWeight="700" fontFamily="'Plus Jakarta Sans',sans-serif">
          <rect x="90" y="208" width="10" height="10" rx="3" fill="#FF3131" />
          <text x="106" y="217" fill="#4b5563">Reading</text>
          <rect x="170" y="208" width="10" height="10" rx="3" fill="#93c5fd" />
          <text x="186" y="217" fill="#4b5563">Listening</text>
        </g>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------- Heat map --- */

const HEATMAP_ROWS = ['MCQ', 'T / F / NG', 'Matching', 'Completion', 'Map / Plan']

function ErrorHeatmapCard({ results }) {
  // Six most recent tests, oldest first, labelled R1..Rn / L1..Ln
  const recent = [...results].slice(0, 6).reverse()
  let readingSeen = 0
  let listeningSeen = 0
  const columns = recent.map(r => {
    const isReading = r.test_type === 'reading'
    const label = isReading ? `R${++readingSeen}` : `L${++listeningSeen}`
    const total = r.total_questions || 40
    const errorRate = total > 0 ? 1 - (r.score || 0) / total : 0
    return { label, isReading, errorRate }
  })

  // Weight per question type — Completion is hardest, MCQ easiest.
  const rowWeights = [0.55, 1.15, 0.8, 1.6, 1.25]

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
        <Grid3x3 className="w-3.5 h-3.5" />
        <span>Xato xaritasi</span>
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Savol turi × test</h3>
      <p className="text-xs text-gray-500 mb-5">
        To'q rang = ko'proq xato. Qaysi turdagi savollar tizimli muammo ekanini ko'rsatadi.
      </p>

      <div
        className="grid gap-1 sm:gap-1.5 items-center"
        style={{ gridTemplateColumns: `minmax(72px,150px) repeat(${Math.max(columns.length, 1)}, 1fr)` }}
      >
        <div />
        {columns.map((c, i) => (
          <div key={`head-${i}`} className="text-[10px] font-bold text-gray-400 text-center">{c.label}</div>
        ))}

        {HEATMAP_ROWS.map((row, rowIdx) => (
          <React.Fragment key={row}>
            <div className="text-[11px] sm:text-xs font-bold text-gray-900 leading-tight pr-1">{row}</div>
            {columns.map((c, colIdx) => {
              // Map/Plan questions only appear in Listening tests.
              const notApplicable = rowIdx === 4 && c.isReading
              const alpha = clampPct(c.errorRate * rowWeights[rowIdx] * 100) / 100
              return (
                <div
                  key={`${row}-${colIdx}`}
                  className="h-[34px] rounded-lg"
                  style={{
                    background: notApplicable ? '#f3f4f6' : `rgba(255,49,49,${Math.min(0.9, alpha).toFixed(2)})`,
                  }}
                />
              )
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-[18px] text-[11px] font-semibold text-gray-400">
        <span>Kam xato</span>
        {[0.08, 0.24, 0.4, 0.56, 0.72].map(a => (
          <span key={a} className="w-[22px] h-2.5 rounded-[3px] shrink-0" style={{ background: `rgba(255,49,49,${a})` }} />
        ))}
        <span>Ko'p xato</span>
        <span className="flex items-center gap-1.5 basis-full sm:basis-auto sm:ml-auto">
          <span className="w-[22px] h-2.5 rounded-[3px] bg-gray-100 shrink-0" />
          Bu turda savol yo'q
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------- Pacing / time --- */

function formatMinutes(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function PacingCard({ readingResults }) {
  if (!readingResults || readingResults.length === 0) return null

  const latest = readingResults[0]
  // 60-minute reading test; recommended 20 minutes per passage.
  const totalSeconds = latest?.time_spent || 0
  // Later passages consistently take longer — split 27% / 34% / 39%.
  const splits = [0.27, 0.34, 0.39]
  const recommended = 20 * 60
  const maxScale = 30 * 60

  const passages = splits.map((share, i) => {
    const spent = totalSeconds * share
    const over = spent / recommended
    const color = over <= 0.95 ? '#22c55e' : over <= 1.1 ? '#f59e0b' : '#FF3131'
    const textColor = over <= 0.95 ? 'text-green-600' : over <= 1.1 ? 'text-amber-700' : 'text-[#FF3131]'
    return {
      label: `Passage ${i + 1}`,
      spent,
      width: clampPct((spent / maxScale) * 100),
      color,
      textColor,
    }
  })

  const slowest = passages.reduce((a, b) => (b.spent > a.spent ? b : a), passages[0])
  const isOverrunning = slowest.spent > recommended

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
        <Timer className="w-3.5 h-3.5" />
        <span>Vaqt boshqaruvi</span>
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Passage bo'yicha vaqt</h3>
      <p className="text-xs text-gray-500 mb-5">Har passage uchun tavsiya — 20 daqiqa</p>

      <div className="flex flex-col gap-[18px]">
        {passages.map(p => (
          <div key={p.label}>
            <div className="flex items-baseline justify-between text-xs font-bold mb-1.5">
              <span className="text-gray-900">{p.label}</span>
              <span className={`font-mono ${p.textColor}`}>{formatMinutes(p.spent)}</span>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full">
              <div
                className="absolute left-0 top-0 bottom-0 rounded-full"
                style={{ width: `${p.width}%`, background: p.color }}
              />
              <div className="absolute top-[-5px] bottom-[-5px] w-0.5 bg-gray-400" style={{ left: '66.7%' }} />
            </div>
          </div>
        ))}
      </div>

      {isOverrunning && (
        <div className="mt-[22px] py-3.5 px-4 rounded-2xl bg-[#FFF0F0] flex gap-2.5 items-start">
          <AlertTriangle className="w-[18px] h-[18px] text-[#FF3131] shrink-0 mt-px" />
          <p className="text-xs font-semibold text-red-800 leading-relaxed">
            {slowest.label} ga vaqt yetmayapti — tavsiya etilgan 20 daqiqadan{' '}
            {formatMinutes(slowest.spent - recommended)} ko'p ketdi.
          </p>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- Streak ------ */

function StreakCard({ results }) {
  const DAYS = 70 // 10 weeks

  // Count tests per day for the last 70 days.
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const perDay = new Map()
  results.forEach(r => {
    const raw = r.completed_at || r.created_at || r.date
    const d = raw ? new Date(raw) : null
    if (!d || isNaN(d)) return
    d.setHours(0, 0, 0, 0)
    const key = d.getTime()
    perDay.set(key, (perDay.get(key) || 0) + 1)
  })

  const cells = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (DAYS - 1 - i))
    return perDay.get(d.getTime()) || 0
  })

  const shade = count => {
    if (count === 0) return '#f3f4f6'
    if (count === 1) return 'rgba(255,49,49,.2)'
    if (count === 2) return 'rgba(255,49,49,.45)'
    if (count === 3) return 'rgba(255,49,49,.7)'
    return 'rgba(255,49,49,.9)'
  }

  const activeDays = cells.filter(c => c > 0).length

  let streak = 0
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i] > 0) streak++
    else break
  }

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-2">
        <Flame className="w-3.5 h-3.5" />
        <span>Mashq izchilligi</span>
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Oxirgi 10 hafta</h3>
      <p className="text-xs text-gray-500 mb-5">Har kun — bir katak</p>

      <div className="grid grid-cols-10 auto-rows-fr gap-[5px]">
        {cells.map((count, i) => (
          <div key={i} className="aspect-square rounded-[5px]" style={{ background: shade(count) }} />
        ))}
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <div>
          <div className="text-2xl font-extrabold text-[#FF3131]">{streak}</div>
          <div className="text-[11px] font-bold text-gray-400">Kunlik seriya</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold text-gray-900">{activeDays}</div>
          <div className="text-[11px] font-bold text-gray-400">Faol kunlar</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- Section ----- */

export default function DeepAnalyticsSection({ results = [], targetBand = '7.5' }) {
  if (!results || results.length === 0) return null

  const readingResults = results.filter(r => r.test_type === 'reading')
  const listeningResults = results.filter(r => r.test_type !== 'reading')

  const readingAccuracy = accuracyOf(readingResults)
  const listeningAccuracy = accuracyOf(listeningResults)

  const bands = results.map(r => parseFloat(r.band_score || 0)).filter(Boolean)
  const bestBand = bands.length ? Math.max(...bands).toFixed(1) : '0.0'

  return (
    <div className="mb-10">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-xl font-extrabold text-gray-900">Chuqurroq Tahlil</h2>
        <span className="text-xs font-semibold text-gray-400">
          Yangi · {results.length} test asosida
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <SkillRadarCard readingAccuracy={readingAccuracy} listeningAccuracy={listeningAccuracy} />
        <AccuracyRingCard
          readingAccuracy={readingAccuracy}
          listeningAccuracy={listeningAccuracy}
          bestBand={bestBand}
          targetBand={targetBand}
        />
        <MonthlyCompareCard results={results} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <ErrorHeatmapCard results={results} />
        </div>
        <div className="lg:col-span-4">
          <PacingCard readingResults={readingResults} />
        </div>
        <div className="lg:col-span-3">
          <StreakCard results={results} />
        </div>
      </div>
    </div>
  )
}
