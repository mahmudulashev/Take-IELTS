import React from 'react'
import { Target, Calendar, Clock } from 'lucide-react'
import { formatExamDate } from '../../lib/format'

/** Maqsadli band, imtihon sanasi va qolgan kunlar. */
export default function GoalCard({ targetBand, examDate }) {
  const daysLeft = examDate
    ? Math.max(0, Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="w-full bg-gradient-to-br from-[#FF3B3B] to-[#E82C2C] rounded-[24px] p-6 lg:p-8 border border-[#FF3B3B]/20 shadow-lg shadow-[#FF3131]/20 flex flex-col relative overflow-hidden group text-white">
      {/* Decorative Background Blobs */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-black/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>

      <div className="flex flex-col items-center justify-center text-center mb-6 mt-2 relative z-10">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-white rounded-2xl blur-lg opacity-30"></div>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#FF3131] shadow-xl shadow-black/10 transform -rotate-3 relative z-10 border-[3px] border-white/50">
            <span className="text-2xl font-black tracking-tighter">{targetBand}</span>
          </div>
        </div>
        <h3 className="font-extrabold text-white text-lg flex items-center gap-1.5">
          <Target className="w-4 h-4 text-white" />
          <span>IELTS Maqsadingiz</span>
        </h3>
        <p className="text-[11px] text-white/80 mt-1 font-medium">Orzuyingizdagi natijaga erishing</p>
      </div>

      <div className="space-y-2.5 relative z-10 w-full mt-auto">
        <div className="bg-white/10 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 hover:bg-white/20 transition-colors backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-0.5">Imtihon Sanasi</p>
            <p className="text-sm font-black text-white">{formatExamDate(examDate)}</p>
          </div>
        </div>

        <div className="bg-white/10 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 hover:bg-white/20 transition-colors backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-0.5">Qolgan Vaqt</p>
            <p className="text-sm font-black text-white">{daysLeft} kun qoldi</p>
          </div>
        </div>
      </div>
    </div>
  )
}
