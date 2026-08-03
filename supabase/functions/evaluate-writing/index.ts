/**
 * evaluate-writing — IELTS Writing Task 2 insholarini baholovchi Edge Function
 * ---------------------------------------------------------------------------
 * NIMA UCHUN SERVER TOMONIDA:
 * Gemini API kaliti hech qachon brauzerga tushmasligi kerak. Vite'da
 * `VITE_` bilan boshlanuvchi har qanday o'zgaruvchi bundle ichiga matn
 * holida yoziladi va DevTools'dan o'qiladi. Bu funksiya kalitni faqat
 * server muhitida ushlaydi.
 *
 * DEPLOY:
 *   supabase secrets set GEMINI_API_KEY=...
 *   supabase functions deploy evaluate-writing
 *
 * Talab qilinadigan muhit o'zgaruvchilari:
 *   GEMINI_API_KEY              — Google AI Studio'dan
 *   SUPABASE_URL                — avtomatik beriladi
 *   SUPABASE_SERVICE_ROLE_KEY   — avtomatik beriladi
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_MODEL = 'gemini-2.5-flash'
const DAILY_LIMIT = 5          // bitta foydalanuvchi uchun kuniga
const MIN_WORDS = 50
const MAX_WORDS = 1000

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Rasmiy IELTS Writing Task 2 band descriptor'lariga tayangan prompt.
 * Modelga "o'zingcha baho ber" demaymiz — har bir mezon uchun nimaga
 * qarash kerakligini aniq aytamiz, aks holda baholar tasodifiy chiqadi.
 */
function buildPrompt(promptText: string, essay: string, wordCount: number): string {
  return `You are an experienced IELTS examiner. Assess the candidate's Writing Task 2 response using the official public band descriptors.

TASK PROMPT:
"""
${promptText}
"""

CANDIDATE'S ESSAY (${wordCount} words):
"""
${essay}
"""

Assess these four criteria independently, each 0.0-9.0 in 0.5 steps:

1. task_response — Does it address all parts of the prompt? Is a clear position maintained throughout? Are ideas developed and supported? Note: under 250 words is a penalty.
2. coherence_cohesion — Logical progression, paragraphing, cohesive devices used naturally rather than mechanically.
3. lexical_resource — Range and precision of vocabulary, collocation, word formation, spelling.
4. grammatical_range — Variety of structures, accuracy, punctuation, error density and whether errors impede communication.

Overall band = average of the four, rounded to the nearest 0.5 (.25 rounds up, .75 rounds up).

Be strict and realistic. Most candidates score 5.5-6.5. Do not inflate scores to be encouraging — an inflated score misleads the candidate about their exam readiness.

Write all feedback in Uzbek (latin script), except quoted English examples from the essay.

Return ONLY valid JSON, no markdown fences, in exactly this shape:
{
  "task_response": 6.0,
  "coherence_cohesion": 6.5,
  "lexical_resource": 5.5,
  "grammatical_range": 6.0,
  "overall": 6.0,
  "summary": "2-3 jumlada umumiy baho va asosiy xulosa",
  "criteria_feedback": {
    "task_response": "nima yaxshi, nima yetishmaydi",
    "coherence_cohesion": "...",
    "lexical_resource": "...",
    "grammatical_range": "..."
  },
  "strengths": ["kuchli tomon 1", "kuchli tomon 2"],
  "improvements": ["aniq tavsiya 1", "aniq tavsiya 2", "aniq tavsiya 3"],
  "corrections": [
    { "original": "essaydagi aynan jumla", "corrected": "tuzatilgan variant", "why": "qisqa izoh" }
  ]
}

Include 3-6 corrections drawn verbatim from the essay. If the essay is too short or off-topic to assess, still return the JSON with low bands and explain why in "summary".`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Faqat POST' }, 405)

  try {
    // ---------------------------------------------------------------
    // 1. Foydalanuvchini aniqlash
    // ---------------------------------------------------------------
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) return json({ error: 'Avval tizimga kiring.' }, 401)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: userData, error: userErr } = await admin.auth.getUser(token)
    const user = userData?.user
    if (userErr || !user) return json({ error: 'Sessiya yaroqsiz. Qayta kiring.' }, 401)

    // ---------------------------------------------------------------
    // 2. Kirish ma'lumotlarini tekshirish
    // ---------------------------------------------------------------
    const body = await req.json().catch(() => null)
    if (!body) return json({ error: "So'rov formati noto'g'ri." }, 400)

    const { promptId, promptText, essay, timeSpent } = body
    if (typeof promptText !== 'string' || typeof essay !== 'string') {
      return json({ error: 'promptText va essay matn bo\'lishi kerak.' }, 400)
    }

    const wordCount = countWords(essay)
    if (wordCount < MIN_WORDS) {
      return json({ error: `Insho juda qisqa (${wordCount} so'z). Kamida ${MIN_WORDS} so'z yozing.` }, 400)
    }
    if (wordCount > MAX_WORDS) {
      return json({ error: `Insho juda uzun (${wordCount} so'z).` }, 400)
    }

    // ---------------------------------------------------------------
    // 3. Kunlik limit
    // ---------------------------------------------------------------
    const { data: attempts } = await admin.rpc('writing_attempts_today', { p_user_id: user.id })
    if (typeof attempts === 'number' && attempts >= DAILY_LIMIT) {
      return json({
        error: `Kunlik limit tugadi (${DAILY_LIMIT} ta insho). Ertaga qayta urinib ko'ring.`,
        limitReached: true,
      }, 429)
    }

    // ---------------------------------------------------------------
    // 4. Gemini
    // ---------------------------------------------------------------
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      return json({
        error: "Server sozlanmagan: GEMINI_API_KEY o'rnatilmagan. Terminalda: supabase secrets set GEMINI_API_KEY=...",
      }, 500)
    }

    // Model nomlari vaqt o'tishi bilan o'zgaradi va eskilari o'chiriladi.
    // Bittasi 404 bersa keyingisiga o'tamiz — sayt to'xtab qolmasin.
    const MODELS = [GEMINI_MODEL, 'gemini-flash-latest', 'gemini-2.5-flash-lite']

    let geminiJson: any = null
    let lastError = ''
    let lastStatus = 0

    for (const model of MODELS) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: buildPrompt(promptText, essay, wordCount) }] }],
            generationConfig: {
              temperature: 0.3,          // baho barqaror bo'lsin
              responseMimeType: 'application/json',
            },
          }),
        },
      )

      if (res.ok) {
        geminiJson = await res.json()
        if (model !== GEMINI_MODEL) console.warn(`Zaxira model ishlatildi: ${model}`)
        break
      }

      lastStatus = res.status
      const detail = await res.text()
      console.error(`Gemini xatosi [${model}]:`, res.status, detail)

      // Google xato JSON'idan tushunarli sababni ajratamiz
      try {
        const parsed = JSON.parse(detail)
        lastError = parsed?.error?.status || parsed?.error?.message || detail.slice(0, 200)
      } catch {
        lastError = detail.slice(0, 200)
      }

      // 404 — model topilmadi, keyingisini sinaymiz.
      // Qolgan xatolar (kalit, kvota, ruxsat) modelga bog'liq emas — to'xtaymiz.
      if (res.status !== 404) break
    }

    if (!geminiJson) {
      if (lastStatus === 429) {
        return json({ error: "Kvota tugadi yoki juda ko'p so'rov yuborildi. Bir necha daqiqadan keyin urinib ko'ring." }, 429)
      }
      // Sababni foydalanuvchiga ochiq aytamiz — API kaliti hech qachon
      // xato matniga tushmaydi, faqat Google'ning status kodi va izohi.
      const hint =
        lastStatus === 400 ? " — GEMINI_API_KEY noto'g'ri ko'rinadi"
        : lastStatus === 403 ? ' — Generative Language API yoqilmagan yoki kalitga ruxsat yo\'q'
        : lastStatus === 404 ? ' — model nomi topilmadi'
        : ''
      return json({ error: `Baholash xizmati xatosi (${lastStatus}${hint}): ${lastError}` }, 502)
    }

    const raw = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) {
      const reason = geminiJson?.candidates?.[0]?.finishReason
      if (reason === 'SAFETY') {
        return json({ error: 'Insho mazmuni xavfsizlik filtridan o\'tmadi. Boshqa mavzuda yozib ko\'ring.' }, 400)
      }
      console.error('Bo\'sh javob:', JSON.stringify(geminiJson).slice(0, 400))
      return json({ error: `Baholash natijasi bo'sh keldi${reason ? ` (${reason})` : ''}.` }, 502)
    }

    let assessment: any
    try {
      assessment = JSON.parse(raw)
    } catch {
      // responseMimeType bo'lsa ham ba'zan ```json bilan o'raladi
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '')
      try {
        assessment = JSON.parse(cleaned)
      } catch {
        console.error('JSON parse xatosi:', raw.slice(0, 400))
        return json({ error: 'Baholash natijasini o\'qib bo\'lmadi.' }, 502)
      }
    }

    // Band qiymatlarini 0-9 oralig'iga va 0.5 qadamga keltiramiz —
    // model chegaradan chiqib ketsa baza cheklovi xato bermasin.
    const band = (v: unknown) => {
      const n = Number(v)
      if (!isFinite(n)) return null
      return Math.min(9, Math.max(0, Math.round(n * 2) / 2))
    }

    const record = {
      user_id: user.id,
      task_type: 'task2',
      prompt_id: typeof promptId === 'string' ? promptId : null,
      prompt_text: promptText,
      essay,
      word_count: wordCount,
      time_spent: Number.isFinite(timeSpent) ? Math.round(timeSpent) : null,
      band_overall: band(assessment.overall),
      band_task: band(assessment.task_response),
      band_coherence: band(assessment.coherence_cohesion),
      band_lexical: band(assessment.lexical_resource),
      band_grammar: band(assessment.grammatical_range),
      feedback: {
        summary: assessment.summary ?? '',
        criteria_feedback: assessment.criteria_feedback ?? {},
        strengths: assessment.strengths ?? [],
        improvements: assessment.improvements ?? [],
        corrections: assessment.corrections ?? [],
      },
      model: GEMINI_MODEL,
    }

    // ---------------------------------------------------------------
    // 5. Saqlash
    // ---------------------------------------------------------------
    const { data: saved, error: saveErr } = await admin
      .from('writing_results')
      .insert(record)
      .select()
      .single()

    if (saveErr) {
      console.error('Saqlash xatosi:', saveErr)
      // Baho tayyor — saqlanmasa ham foydalanuvchiga ko'rsatamiz
      return json({ ...record, id: null, saveFailed: true })
    }

    return json({ ...saved, attemptsToday: (attempts ?? 0) + 1, dailyLimit: DAILY_LIMIT })

  } catch (err) {
    console.error('Kutilmagan xato:', err)
    return json({ error: 'Serverda kutilmagan xato yuz berdi.' }, 500)
  }
})
