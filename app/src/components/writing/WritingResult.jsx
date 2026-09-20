import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ArrowLeft } from 'lucide-react'
import { getPromptById, TASK_CONFIG } from '../../data/writing-prompts'
import { num } from './result/shared'
import ResultHero from './result/ResultHero'
import CriteriaFeedback from './result/CriteriaFeedback'
import DataChecks from './result/DataChecks'
import SummaryCards from './result/SummaryCards'
import EssayPanel from './result/EssayPanel'
import NextSteps from './result/NextSteps'
import PromptCard from './result/PromptCard'

const CRITERIA = [
  { key: 'task_response',      field: 'band_task',      label: 'Task Response',     ring: 'Task Response',     short: 'Mavzuga javob' },
  { key: 'coherence_cohesion', field: 'band_coherence', label: 'Coherence & Cohesion', ring: 'Coherence',      short: 'Bog\'lanish' },
  { key: 'lexical_resource',   field: 'band_lexical',   label: 'Lexical Resource',  ring: 'Lexical Resource',  short: 'So\'z boyligi' },
  { key: 'grammatical_range',  field: 'band_grammar',   label: 'Grammatical Range', ring: 'Grammatical Range', short: 'Grammatika' },
]

/**
 * Bitta javobning to'liq tahlili. Bu fayl faqat ma'lumotni tayyorlab,
 * bo'laklarni tartib bilan joylashtiradi — har bir bo'lak `result/`
 * papkasida alohida turadi.
 */
export default function WritingResult({ result, prompt, onNewEssay }) {
  const navigate = useNavigate()

  const fb = result?.feedback || {}
  const annotations = fb.annotations || []
  const overall = num(result.band_overall)

  // Birinchi mezon Task 1'da boshqa nomlanadi, lekin baza ustuni
  // (`band_task`) va JSON kaliti (`task_response`) ikkalasida bir xil.
  const task = result?.task_type === 'task1' ? 'task1' : 'task2'
  const criteria = CRITERIA.map((c) => (c.key === 'task_response'
    ? { ...c, label: TASK_CONFIG[task].criterion, ring: TASK_CONFIG[task].criterion, short: task === 'task1' ? 'Topshiriqni bajarish' : c.short }
    : c))

  // Kuchli / zaif mezon — faqat ballar farq qilganda ajratib ko'rsatiladi
  const scored = criteria.map((c) => ({ ...c, band: num(result[c.field]) })).filter((c) => c.band != null)
  const minBand = scored.length ? Math.min(...scored.map((c) => c.band)) : null
  const maxBand = scored.length ? Math.max(...scored.map((c) => c.band)) : null
  const uneven = minBand != null && minBand !== maxBand
  const strongest = uneven ? scored.find((c) => c.band === maxBand) : null
  const weakest = uneven ? scored.find((c) => c.band === minBand) : null
  const target = num(fb.next_band?.target) ?? (overall != null ? Math.min(9, overall + 0.5) : null)

  // Task 1 izohlari grafikdagi raqamlarga ishora qiladi — grafik ko'rinib tursin
  const chart = task === 'task1'
    ? (prompt?.chart ?? getPromptById(result?.prompt_id)?.chart ?? null)
    : null

  return (
    <div className="flex flex-col gap-4 text-[#14181F] antialiased" style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <ResultHero result={result} task={task} criteria={criteria} />

      <CriteriaFeedback
        criteria={criteria}
        result={result}
        feedback={fb}
        uneven={uneven}
        minBand={minBand}
        noun={task === 'task1' ? 'Javob' : 'Insho'}
      />

      {task === 'task1' && Array.isArray(fb.data_checks) && fb.data_checks.length > 0 && (
        <DataChecks checks={fb.data_checks} />
      )}

      <SummaryCards
        summary={fb.summary}
        strongest={strongest}
        weakest={weakest}
        target={target}
        overall={overall}
      />

      <EssayPanel task={task} essay={result.essay} annotations={annotations} />

      <NextSteps nextBand={fb.next_band} strengths={fb.strengths} />

      <PromptCard text={result.prompt_text || prompt?.text} chart={chart} />

      {/* ---------- Amallar ---------- */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <button onClick={onNewEssay}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-[18px] py-2.5 rounded-xl bg-[#14181F] hover:bg-[#2A2F38] text-white font-semibold text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Shu mavzuni qayta yozish
        </button>
        <button onClick={() => navigate(`/writing-${task}`)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-[18px] py-2.5 rounded-xl border border-[#E6E6E9] bg-white text-[#3F4650] font-medium text-sm hover:bg-[#FAFAFA] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Boshqa to'plam
        </button>
      </div>
    </div>
  )
}
