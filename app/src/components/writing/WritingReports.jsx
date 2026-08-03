import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import WritingResult from './WritingResult'
import { formatDate } from '../../lib/scoring'
import { PenLine, ChevronRight, ArrowLeft, TrendingUp } from 'lucide-react'

/**
 * "Natijalarim" sahifasining Writing tabi.
 *
 * Reading/Listening dan farqi: bu yerda 40 ta savol jadvali yo'q.
 * Writing natijasi — matn va uning tahlili, shuning uchun ro'yxatdan
 * bittasini tanlaganda to'liq tahlil (WritingResult) ochiladi.
 */

function bandBadge(band) {
  const b = parseFloat(band)
  if (b >= 7) return 'bg-green-100 text-green-700'
  if (b >= 5.5) return 'bg-blue-100 text-blue-700'
  return 'bg-red-100 text-red-700'
}

const CRITERIA = [
  ['band_task', 'TR'],
  ['band_coherence', 'CC'],
  ['band_lexical', 'LR'],
  ['band_grammar', 'GRA'],
]

export default function WritingReports({ results = [] }) {
  const [selected, setSelected] = useState(null)

  // `results` — AuthContext normalizatsiyasidan kelgan qatorlar.
  // To'liq tahlil `writing` maydonida turadi.
  const rows = useMemo(
    () => results.map((r) => r.writing || r).filter(Boolean),
    [results],
  )

  const stats = useMemo(() => {
    if (!rows.length) return null
    const bands = rows.map((r) => parseFloat(r.band_overall) || 0).filter(Boolean)
    if (!bands.length) return null

    const avg = bands.reduce((a, b) => a + b, 0) / bands.length
    const best = Math.max(...bands)

    // Trend: oxirgi 3 ta va undan oldingi 3 ta o'rtachasini solishtiramiz
    const recent = bands.slice(0, 3)
    const older = bands.slice(3, 6)
    let trend = null
    if (older.length) {
      const rAvg = recent.reduce((a, b) => a + b, 0) / recent.length
      const oAvg = older.reduce((a, b) => a + b, 0) / older.length
      trend = rAvg - oAvg
    }

    const totalWords = rows.reduce((a, r) => a + (r.word_count || 0), 0)
    return { avg: avg.toFixed(1), best: best.toFixed(1), count: rows.length, trend, totalWords }
  }, [rows])

  // ---------------- Tanlangan insho: to'liq tahlil ----------------
  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 px-4 py-2.5 mb-6 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Ro'yxatga qaytish
        </button>

        <WritingResult result={selected} onNewEssay={() => setSelected(null)} />
      </div>
    )
  }

  // ---------------- Bo'sh holat ----------------
  if (!rows.length) {
    return (
      <div className="bg-white rounded-[24px] p-12 border border-gray-100 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFF0F0] text-[#FF3131] flex items-center justify-center mx-auto mb-4">
          <PenLine className="w-5 h-5" />
        </div>
        <p className="text-base font-bold text-gray-700 mb-1.5">Hali insho yozilmagan</p>
        <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
          Writing Task 2 inshosini yozing — AI to'rtta rasmiy mezon bo'yicha
          baholaydi va xatolarni matn ichida ko'rsatadi.
        </p>
        <Link
          to="/test/writing"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF3131] hover:bg-[#E82C2C] text-white font-bold text-xs transition-colors"
        >
          <PenLine className="w-4 h-4" /> Birinchi inshoni yozish
        </Link>
      </div>
    )
  }

  // ---------------- Ro'yxat ----------------
  return (
    <div className="space-y-6">

      {/* Statistika */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Yozilgan insholar</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.count} ta</p>
          <p className="text-[11px] text-gray-400 mt-1">{stats.totalWords.toLocaleString()} so'z jami</p>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">O'rtacha band</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-extrabold text-[#FF3131]">{stats.avg}</p>
            {stats.trend != null && Math.abs(stats.trend) >= 0.1 && (
              <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                stats.trend > 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                <TrendingUp className={`w-3.5 h-3.5 ${stats.trend < 0 ? 'rotate-180' : ''}`} />
                {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)}
              </span>
            )}
          </div>
          {stats.trend != null && Math.abs(stats.trend) >= 0.1 && (
            <p className="text-[11px] text-gray-400 mt-1">oxirgi 3 ta insho bo'yicha</p>
          )}
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Eng yuqori</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.best}</p>
        </div>
      </div>

      {/* Insholar ro'yxati */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Yozilgan insholar</h3>
          <span className="text-xs font-semibold text-gray-400">{rows.length} ta yozuv</span>
        </div>

        <div className="divide-y divide-gray-100">
          {rows.map((row, idx) => (
            <button
              key={row.id || idx}
              onClick={() => setSelected(row)}
              className="w-full p-5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate mb-1">
                  {row.prompt_text}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400 font-medium">
                  <span>{formatDate(row.created_at)}</span>
                  <span>·</span>
                  <span>{row.word_count} so'z</span>
                  {row.feedback?.annotations?.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{row.feedback.annotations.length} ta belgi</span>
                    </>
                  )}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 shrink-0">
                {CRITERIA.map(([field, label]) => (
                  <div key={field} className="text-center px-2">
                    <p className="text-[10px] font-bold text-gray-300 uppercase">{label}</p>
                    <p className="text-xs font-bold text-gray-600">{row[field] ?? '—'}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${bandBadge(row.band_overall)}`}>
                  {row.band_overall ?? '—'}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
