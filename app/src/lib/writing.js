import { supabase, isSupabaseConfigured, describeFetchError } from './supabase'

/**
 * Writing insholarini baholash — Supabase Edge Function orqali.
 *
 * Gemini kaliti ataylab bu yerda YO'Q. Vite `VITE_` bilan boshlanuvchi
 * o'zgaruvchilarni bundle ichiga matn holida yozadi, ya'ni brauzerdan
 * o'qish mumkin. Shuning uchun barcha AI chaqiruvlari server tomonida
 * (supabase/functions/evaluate-writing) bajariladi.
 */

const DRAFT_KEY = 'ielts_writing_draft'

export function countWords(text) {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Insho qoralamasini saqlash — sahifa yopilib qolsa yo'qolmasin.
 * Statik testlardagi test-guard.js bilan bir mantiq.
 */
export function saveDraft({ promptId, essay }) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      promptId,
      essay,
      savedAt: Date.now(),
    }))
  } catch (e) { /* localStorage to'lgan bo'lishi mumkin */ }
}

export function readDraft(maxAgeMs = 4 * 60 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (!d?.essay) return null
    if (Date.now() - (d.savedAt || 0) > maxAgeMs) {
      localStorage.removeItem(DRAFT_KEY)
      return null
    }
    return d
  } catch { return null }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch (e) {}
}

/**
 * Inshoni baholashga yuborish.
 * @returns {Promise<{ok: boolean, data?: object, error?: string, limitReached?: boolean}>}
 */
export async function evaluateEssay({ promptId, promptText, essay, timeSpent }) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Baholash xizmati sozlanmagan. Supabase kalitlarini tekshiring.' }
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData?.session?.access_token
  if (!token) {
    return { ok: false, error: 'Baholash uchun tizimga kirgan bo\'lishingiz kerak.' }
  }

  try {
    const { data, error } = await supabase.functions.invoke('evaluate-writing', {
      body: { promptId, promptText, essay, timeSpent },
    })

    if (error) {
      // Edge Function 4xx/5xx qaytarsa haqiqiy sabab `context` (Response)
      // ichida bo'ladi. Uni ochib ko'rsatmasak, foydalanuvchi va biz
      // faqat "xatolik yuz berdi" ko'ramiz va sababni bilmaymiz.
      let message = null
      let limitReached = false

      const ctx = error.context
      if (ctx) {
        try {
          // Response'ni bir marta o'qish mumkin — avval nusxa olamiz
          const res = typeof ctx.clone === 'function' ? ctx.clone() : ctx
          const text = typeof res.text === 'function' ? await res.text() : null
          if (text) {
            try {
              const body = JSON.parse(text)
              if (body?.error) message = body.error
              if (body?.limitReached) limitReached = true
            } catch {
              message = text.slice(0, 300)
            }
          }
        } catch { /* o'qib bo'lmadi */ }
      }

      if (!message) message = error.message || 'Baholashda xatolik yuz berdi.'
      console.error('evaluateEssay xatosi:', message, error)
      return { ok: false, error: message, limitReached }
    }

    if (data?.error) {
      return { ok: false, error: data.error, limitReached: !!data.limitReached }
    }

    return { ok: true, data }
  } catch (err) {
    console.error('evaluateEssay:', err)
    return { ok: false, error: 'Tarmoq xatosi. Internet aloqangizni tekshiring.' }
  }
}

/**
 * Bitta inshoni o'chirish.
 *
 * RLS'da "insho: o'zinikini o'chirish" policy'si bor, ya'ni baza
 * darajasida ham begona yozuvni o'chirib bo'lmaydi. Bu yerdagi
 * `user_id` filtri — ikkinchi qatlam.
 */
export async function deleteWritingResult(id) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase sozlanmagan.' }
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData?.session?.user?.id
  if (!userId) return { ok: false, error: 'Avval tizimga kiring.' }

  // `.select()` MUHIM: usiz Supabase o'chirilgan qatorlar sonini
  // qaytarmaydi. RLS'da DELETE policy'si bo'lmasa, so'rov XATO
  // BERMAYDI — shunchaki 0 ta qator o'chiradi va muvaffaqiyat
  // qaytaradi. Natijada kod "o'chirildi" deb hisoblaydi, yozuv esa
  // joyida qoladi. Bu jim xatoni ko'rinadigan qilamiz.
  const { data, error } = await supabase
    .from('writing_results')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select('id')

  if (error) {
    console.warn('deleteWritingResult:', error)
    return { ok: false, error: error.message }
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      error: "Yozuv o'chirilmadi. Bazada DELETE ruxsati (RLS policy) yo'q bo'lishi mumkin — supabase/writing-setup.sql ni qayta ishga tushiring.",
    }
  }

  return { ok: true, deleted: data.length }
}

/**
 * Barcha insholarni o'chirish.
 *
 * DIQQAT: test natijalaridan farqli o'laroq bu yerda "tozalash vaqti"
 * hiylasi ishlatilmaydi — yozuvlar bazadan haqiqatan o'chiriladi va
 * qaytarib bo'lmaydi. Chaqirishdan oldin tasdiqlash so'ralishi shart.
 */
export async function clearWritingHistory() {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase sozlanmagan.' }
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData?.session?.user?.id
  if (!userId) return { ok: false, error: 'Avval tizimga kiring.' }

  // Avval nechta yozuv borligini bilib olamiz — o'chirish haqiqatan
  // ishlaganini tekshirish uchun.
  const { count: before } = await supabase
    .from('writing_results')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { data, error } = await supabase
    .from('writing_results')
    .delete()
    .eq('user_id', userId)
    .select('id')

  if (error) {
    console.warn('clearWritingHistory:', error)
    return { ok: false, error: error.message }
  }

  const deleted = data?.length ?? 0

  // RLS'da DELETE policy'si yo'q bo'lsa xato chiqmaydi, lekin
  // hech narsa o'chmaydi. Shu holatni tutamiz.
  if ((before ?? 0) > 0 && deleted === 0) {
    return {
      ok: false,
      error: `${before} ta insho topildi, lekin bittasi ham o'chirilmadi. Bazada DELETE ruxsati (RLS policy) yo'q — supabase/writing-setup.sql ni qayta ishga tushiring.`,
    }
  }

  clearDraft()
  return { ok: true, deleted }
}

/**
 * Foydalanuvchining oldingi Writing natijalari.
 * RLS tufayli faqat o'ziniki qaytadi, lekin filtrni baribir
 * ochiq yozamiz — himoya ikki qatlamli bo'lsin.
 */
export async function getWritingResultsWithStatus(limit = 50) {
  // Sozlanmagan yoki tizimga kirilmagan holat — bu aloqa xatosi EMAS,
  // shuning uchun ogohlantirish ko'rsatilmaydi.
  if (!isSupabaseConfigured || !supabase) return { results: [], error: null }

  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id
    if (!userId) return { results: [], error: null }

    const { data, error } = await supabase
      .from('writing_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      // DIQQAT: bu yerda bo'sh ro'yxat qaytarib, xatoni yutib yuborish
      // mumkin emas. Aks holda insholar bazada tursa ham ekranda
      // "hali insho yozilmagan" chiqadi.
      console.warn('getWritingResults:', error)
      return { results: [], error: describeFetchError(error) }
    }
    return { results: data || [], error: null }
  } catch (e) {
    console.warn('getWritingResults:', e)
    return { results: [], error: describeFetchError(e) }
  }
}

/** Eski chaqiruvlar uchun moslik qatlami — faqat massiv qaytaradi. */
export async function getWritingResults(limit = 50) {
  const { results } = await getWritingResultsWithStatus(limit)
  return results
}
