import React, { useMemo } from 'react'

/**
 * Inshoni xatolar belgilangan holda ko'rsatish.
 *
 * Nima uchun kerak: ChatGPT'ga insho tashlaganda javob alohida oynada
 * keladi va talaba "qaysi jumla haqida gapiryapti?" deb qidiradi. Bu
 * yerda xato aynan o'z o'rnida, matn ichida belgilanadi — bosilsa
 * tuzatish chiqadi. Chat oynasida bunday qilib bo'lmaydi.
 *
 * Ishlash printsipi: model qaytargan `quote` larni matn ichidan topib,
 * matnni bo'laklarga ajratamiz. Edge Function allaqachon essayda
 * uchramaydigan iqtiboslarni tashlab yuborgan, shuning uchun bu yerda
 * faqat joylashuvni hisoblaymiz.
 */

export const TYPE_META = {
  grammar:    { label: 'Grammatika', dot: 'bg-red-500',    chip: 'bg-red-50 text-red-700 border-red-200',        mark: 'bg-red-100 decoration-red-400' },
  vocabulary: { label: 'So\'z boyligi', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200', mark: 'bg-amber-100 decoration-amber-400' },
  cohesion:   { label: 'Bog\'lanish',  dot: 'bg-blue-500',  chip: 'bg-blue-50 text-blue-700 border-blue-200',     mark: 'bg-blue-100 decoration-blue-400' },
  task:       { label: 'Mavzuga javob', dot: 'bg-purple-500', chip: 'bg-purple-50 text-purple-700 border-purple-200', mark: 'bg-purple-100 decoration-purple-400' },
  spelling:   { label: 'Imlo',        dot: 'bg-pink-500',  chip: 'bg-pink-50 text-pink-700 border-pink-200',     mark: 'bg-pink-100 decoration-pink-400' },
}

export function typeMeta(type) {
  return TYPE_META[type] || TYPE_META.grammar
}

/**
 * Matnni belgilangan va oddiy bo'laklarga ajratadi.
 * Bir-birining ustiga tushgan iqtiboslar chetlab o'tiladi —
 * aks holda HTML tuzilishi buziladi.
 */
function buildSegments(essay, annotations) {
  const found = []

  annotations.forEach((a, idx) => {
    const start = essay.indexOf(a.quote)
    if (start === -1) return
    found.push({ start, end: start + a.quote.length, ann: a, idx })
  })

  found.sort((x, y) => x.start - y.start)

  const clean = []
  let lastEnd = -1
  for (const f of found) {
    if (f.start >= lastEnd) {
      clean.push(f)
      lastEnd = f.end
    }
  }

  const segments = []
  let cursor = 0
  for (const f of clean) {
    if (f.start > cursor) segments.push({ text: essay.slice(cursor, f.start) })
    segments.push({ text: essay.slice(f.start, f.end), ann: f.ann, idx: f.idx })
    cursor = f.end
  }
  if (cursor < essay.length) segments.push({ text: essay.slice(cursor) })

  return segments
}

export default function AnnotatedEssay({ essay, annotations = [], activeIdx, onSelect, filter }) {
  const visible = useMemo(
    () => (filter ? annotations.filter((a) => a.type === filter) : annotations),
    [annotations, filter],
  )

  const segments = useMemo(() => buildSegments(essay, visible), [essay, visible])

  return (
    <div className="text-[15px] leading-[1.9] text-gray-800 whitespace-pre-wrap break-words">
      {segments.map((seg, i) => {
        if (!seg.ann) return <span key={i}>{seg.text}</span>

        const meta = typeMeta(seg.ann.type)
        const isActive = activeIdx === seg.idx
        const realIdx = annotations.indexOf(seg.ann)

        return (
          <button
            key={i}
            onClick={() => onSelect(isActive ? null : realIdx)}
            className={`${meta.mark} underline decoration-2 underline-offset-4 rounded px-0.5 -mx-0.5 text-left transition-colors cursor-pointer ${
              isActive ? 'ring-2 ring-offset-1 ring-gray-900' : 'hover:brightness-95'
            }`}
            title="Tuzatishni ko'rish"
          >
            {seg.text}
          </button>
        )
      })}
    </div>
  )
}
