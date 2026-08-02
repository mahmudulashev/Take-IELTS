import React, { useState } from 'react'
import { TrendingUp, Award, BarChart2 } from 'lucide-react'

export default function BandScoreChart({ results = [] }) {
  const [activePoint, setActivePoint] = useState(null)

  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm h-full flex flex-col justify-between min-h-[320px]">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#FF3131] flex items-center justify-center mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-base font-bold text-gray-800">Grafik ma'lumoti yo'q</p>
        <p className="text-xs text-gray-400 mt-1">Test topshirilganidan so'ng o'sish dinamikasi bu yerda aks etadi.</p>
      </div>
    )
  }

  // Sort chronological
  const sorted = [...results].reverse()
  const chartData = sorted.map((item, idx) => ({
    index: idx,
    date: item.completed_at || item.created_at || item.date ? new Date(item.completed_at || item.created_at || item.date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }) : `Test ${idx + 1}`,
    band: parseFloat(item.band_score || 0),
    score: item.score || 0,
    type: item.test_type === 'reading' ? 'Reading' : 'Listening'
  }))

  const width = 800
  const height = 220
  const padding = 40

  const minBand = 0
  const maxBand = 9.0

  const getX = (i) => {
    if (chartData.length === 1) return width / 2
    return padding + (i / (chartData.length - 1)) * (width - padding * 2)
  }

  const getY = (val) => {
    return height - padding - ((val - minBand) / (maxBand - minBand)) * (height - padding * 2)
  }

  // Generate SVG path cubic bezier
  const points = chartData.map((d, i) => `${getX(i)},${getY(d.band)}`)
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point}`
    const prev = arr[i - 1].split(',').map(Number)
    const curr = point.split(',').map(Number)
    const cx = (prev[0] + curr[0]) / 2
    return `${acc} C ${cx},${prev[1]} ${cx},${curr[1]} ${curr[0]},${curr[1]}`
  }, '')

  const areaD = chartData.length > 1
    ? `${pathD} L ${getX(chartData.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z`
    : ''

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm h-full flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3131] uppercase tracking-wider bg-[#FFF0F0] px-3 py-1 rounded-full mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>O'sish Dinamikasi</span>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900">Band Score O'sish Grafikasi</h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF3131]" />
            <span>IELTS Band Score (0.0 - 9.0)</span>
          </div>
        </div>
      </div>

      {/* SVG Responsive Chart */}
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3131" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF3131" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y-Axis Grid Lines */}
          {[0, 3, 5, 6, 7, 8, 9].map((val) => {
            const y = getY(val)
            return (
              <g key={val}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text x={padding - 10} y={y + 4} textAnchor="end" className="text-[10px] fill-gray-400 font-semibold">
                  {val}.0
                </text>
              </g>
            )
          })}

          {/* Area Fill */}
          {areaD && <path d={areaD} fill="url(#redGradient)" />}

          {/* Line Path */}
          {chartData.length > 1 && (
            <path d={pathD} fill="none" stroke="#FF3131" strokeWidth="3" strokeLinecap="round" />
          )}

          {/* Data Points */}
          {chartData.map((d, i) => {
            const cx = getX(i)
            const cy = getY(d.band)
            const isHovered = activePoint === i

            return (
              <g
                key={i}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setActivePoint(i)}
                onMouseLeave={() => setActivePoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 5}
                  fill="#ffffff"
                  stroke="#FF3131"
                  strokeWidth={isHovered ? 4 : 3}
                  className="transition-all duration-200"
                />
                {/* X-axis date labels */}
                <text
                  x={cx}
                  y={height - 12}
                  textAnchor="middle"
                  className="text-[10px] fill-gray-400 font-semibold"
                >
                  {d.date}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Floating Tooltip */}
        {activePoint !== null && chartData[activePoint] && (
          <div
            className="absolute bg-gray-900 text-white p-3 rounded-xl shadow-xl text-xs font-semibold pointer-events-none transition-all z-20"
            style={{
              left: `${(getX(activePoint) / width) * 100}%`,
              top: `${(getY(chartData[activePoint].band) / height) * 100 - 25}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Band {chartData[activePoint].band}</span>
            </div>
            <p className="text-gray-300">{chartData[activePoint].type} Test</p>
            <p className="text-gray-400 text-[10px]">{chartData[activePoint].score} / 40 to'g'ri javob</p>
          </div>
        )}
      </div>
    </div>
  )
}
