import React from 'react'
import { BarChart2 } from 'lucide-react'

export default function ScoreBreakdownChart({ results = [] }) {
  if (!results || results.length === 0) {
    return (
      <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm mb-8 flex flex-col items-center justify-center min-h-[280px]">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
          <BarChart2 className="w-6 h-6" />
        </div>
        <p className="text-base font-bold text-gray-800">Evaluations ma'lumoti yo'q</p>
        <p className="text-xs text-gray-400 mt-1">Test yechilganidan so'ng javoblar taqsimoti bu yerda ko'rinadi.</p>
      </div>
    )
  }

  const sorted = [...results].reverse().slice(-10)

  // Calculate totals across tests
  const totalQuestions = sorted.reduce((acc, curr) => acc + (curr.total_questions || 40), 0)
  const totalCorrect = sorted.reduce((acc, curr) => acc + (curr.score || 0), 0)
  const totalIncorrect = Math.max(0, totalQuestions - totalCorrect)

  const correctPercent = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : '0.0'
  const incorrectPercent = totalQuestions > 0 ? ((totalIncorrect / totalQuestions) * 100).toFixed(1) : '0.0'

  // Chart bar items
  const barData = sorted.map((res, i) => ({
    label: `Test ${i + 1}`,
    correct: res.score || 0,
    incorrect: (res.total_questions || 40) - (res.score || 0),
    total: res.total_questions || 40
  }))

  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm mb-8">
      <div className="mb-6">
        <h3 className="text-xl font-extrabold text-gray-900">Javoblar Tahlili (Evaluations)</h3>
        <p className="text-xs text-gray-400 mt-0.5">Topshirilgan testlar bo'yicha to'g'ri va xato javoblar taqsimoti</p>
      </div>

      {/* Summary Stat Pills */}
      <div className="flex flex-wrap items-center gap-8 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-md bg-[#FF3131]" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900">{totalCorrect.toLocaleString()}</span>
              <span className="text-sm font-bold text-gray-400">{correctPercent}%</span>
            </div>
            <p className="text-xs font-semibold text-gray-400">To'g'ri Javoblar (True)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-md bg-gray-200" />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900">{totalIncorrect.toLocaleString()}</span>
              <span className="text-sm font-bold text-gray-400">{incorrectPercent}%</span>
            </div>
            <p className="text-xs font-semibold text-gray-400">Xato Javoblar (False)</p>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-gray-100">
        {barData.map((d, index) => {
          const correctHeightPct = (d.correct / d.total) * 100
          const incorrectHeightPct = (d.incorrect / d.total) * 100

          return (
            <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="w-full max-w-[36px] flex flex-col justify-end h-full rounded-lg overflow-hidden bg-gray-100 relative group-hover:shadow-md transition-ui">
                {/* Incorrect top bar */}
                <div
                  style={{ height: `${incorrectHeightPct}%` }}
                  className="bg-gray-200 w-full transition-[height] duration-500"
                />
                {/* Correct bottom bar */}
                <div
                  style={{ height: `${correctHeightPct}%` }}
                  className="bg-[#FF3131] w-full transition-[height] duration-500"
                />
              </div>
              <span className="text-[10px] font-bold text-gray-400 mt-2 truncate w-full text-center">
                {d.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
