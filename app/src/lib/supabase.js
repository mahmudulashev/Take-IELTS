import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  !supabaseUrl.includes('your-project-ref')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

const STORAGE_KEYS = {
  USER: 'ielts_user',
  PROFILE: 'ielts_user_profile',
  RESULTS: 'ielts_test_results',
  CLEARED_AT: 'ielts_cleared_at',
  SYNCED_IDS: 'ielts_synced_ids'
}

/**
 * Supabase'ga muvaffaqiyatli yuborilgan natija ID'larini belgilash.
 * Shu ro'yxat tufayli avtomatik sinxronlash bir xil natijani qayta yubormaydi.
 */
function readSyncedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.SYNCED_IDS) || '[]'))
  } catch {
    return new Set()
  }
}

function markSynced(ids) {
  const synced = readSyncedIds()
  ids.forEach(id => synced.add(id))
  // Ro'yxat cheksiz o'smasligi uchun oxirgi 500 tasini saqlaymiz
  const trimmed = Array.from(synced).slice(-500)
  localStorage.setItem(STORAGE_KEYS.SYNCED_IDS, JSON.stringify(trimmed))
}

/**
 * Google OAuth orqali kirish
 */
export async function signInWithGoogle() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`
      }
    })
    if (error) throw error
    return data
  } else {
    // Fallback Local Auth Simulation
    const mockUser = {
      id: `user-${Date.now()}`,
      email: 'student@ielts.uz',
      app_metadata: { provider: 'google' },
      user_metadata: {
        full_name: 'IELTS Student',
        avatar_url: '',
        target_band: '7.5',
        exam_date: '2026-10-15',
        bio: 'IELTS 7.5+ olish va xorijda ta\'lim olish uchun tayyorlanyapman.'
      },
      created_at: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser))
    window.location.href = '/dashboard'
    return { user: mockUser }
  }
}

/**
 * Email + parol bilan ro'yxatdan o'tish.
 *
 * Loyiha email tasdiqlashsiz ishlashga mo'ljallangan:
 * Supabase → Authentication → Providers → Email → "Confirm email" O'CHIRILGAN.
 * Bu holda `signUp` darhol session qaytaradi va foydalanuvchi kiritiladi.
 *
 * Agar sozlama tasodifan yoqilgan bo'lsa, session null keladi. U holda
 * ham foydalanuvchi qorong'uda qolmasligi uchun xabar ko'rsatamiz —
 * lekin bu kutilmagan holat, sozlamani tekshirish kerak.
 */
export async function signUpWithEmail({ email, password, fullName }) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase sozlanmagan.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: fullName?.trim() || '' },
      emailRedirectTo: `${window.location.origin}/auth`,
    },
  })

  if (error) return { ok: false, error: translateAuthError(error) }

  if (data.session?.user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.session.user))
    return { ok: true, session: data.session, needsConfirmation: false }
  }

  // Session yo'q — email tasdiqlash kutilmoqda
  return { ok: true, session: null, needsConfirmation: true }
}

/** Email + parol bilan kirish */
export async function signInWithEmail({ email, password }) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase sozlanmagan.' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) return { ok: false, error: translateAuthError(error) }

  if (data.session?.user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.session.user))
  }
  return { ok: true, session: data.session }
}

/** Parolni tiklash xatini yuborish */
export async function sendPasswordReset(email) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: 'Supabase sozlanmagan.' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/auth`,
  })

  if (error) return { ok: false, error: translateAuthError(error) }
  return { ok: true }
}

/**
 * Supabase xatolari inglizcha keladi. Foydalanuvchiga tushunarli
 * bo'lishi uchun eng ko'p uchraydiganlarini tarjima qilamiz.
 */
function translateAuthError(error) {
  const msg = (error?.message || '').toLowerCase()

  if (msg.includes('invalid login credentials')) {
    return "Email yoki parol noto'g'ri."
  }
  if (msg.includes('email not confirmed')) {
    return 'Email hali tasdiqlanmagan. Pochtangizdagi havolani bosing.'
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return "Bu email allaqachon ro'yxatdan o'tgan. Kirish bo'limidan foydalaning."
  }
  if (msg.includes('password should be at least')) {
    return "Parol juda qisqa — kamida 6 ta belgi bo'lishi kerak."
  }
  if (msg.includes('unable to validate email') || msg.includes('invalid email')) {
    return "Email manzili noto'g'ri yozilgan."
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return "Juda ko'p urinish. Bir necha daqiqadan keyin qayta urinib ko'ring."
  }
  if (msg.includes('signups not allowed') || msg.includes('signup is disabled')) {
    return "Ro'yxatdan o'tish hozircha yopiq."
  }

  return error?.message || 'Kutilmagan xatolik yuz berdi.'
}

/**
 * OAuth Callback ishlov berish
 */
export async function completeOAuthSignIn() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (data?.session?.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.session.user))
      return data.session
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (userData?.user) {
      const session = { user: userData.user }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData.user))
      return session
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.USER)
  if (stored) {
    try {
      return { user: JSON.parse(stored) }
    } catch (e) {}
  }

  return null
}

/**
 * Tizimdan chiqish
 */
export async function signOut() {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.warn('Supabase signout error:', e)
    }
  }
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.PROFILE)

  // Natijalar keshini ham tozalaymiz. Shu paytgacha ular bulutga
  // sinxronlangan (login'da avtomatik bajariladi), shuning uchun
  // yo'qolmaydi. Tozalamasak, shu brauzerga kirgan keyingi
  // foydalanuvchi oldingi odamning natijalarini ko'rardi.
  localStorage.removeItem(STORAGE_KEYS.RESULTS)
  localStorage.removeItem(STORAGE_KEYS.SYNCED_IDS)
  localStorage.removeItem(STORAGE_KEYS.CLEARED_AT)
  localStorage.removeItem('ielts_writing_draft')

  window.location.href = '/'
}

/**
 * Hozirgi sessiyani olish
 */
export async function getSession() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getSession()
      if (data?.session?.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.session.user))
        return data.session
      }

      if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
        return await completeOAuthSignIn()
      }
    } catch (e) {
      console.warn('Supabase getSession error:', e)
    }
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.USER)
  if (stored) {
    try {
      const user = JSON.parse(stored)
      if (user && user.id) {
        return { user }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  }
  return null
}

/**
 * Auth holati o'zgarganda xabardor bo'lish
 */
export function onAuthStateChange(callback) {
  if (isSupabaseConfigured && supabase) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session.user))
      }
      callback(event, session)
    })
  }
  return { data: { subscription: { unsubscribe: () => {} } } }
}

/**
 * Hozirgi foydalanuvchini olish
 */
export async function getUser() {
  const session = await getSession()
  return session?.user || null
}

/**
 * Foydalanuvchi profilini olish
 */
export async function getProfile() {
  const user = await getUser()
  if (!user) return null

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data && !error) return data
    } catch (e) {
      console.warn('Supabase profile get error:', e)
    }
  }

  // Fallback storage
  const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE)
  if (storedProfile) {
    try {
      return JSON.parse(storedProfile)
    } catch (e) {}
  }

  return {
    id: user.id,
    full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'IELTS Student',
    email: user.email || 'student@ielts.uz',
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
    target_band: user.user_metadata?.target_band || '7.5',
    exam_date: user.user_metadata?.exam_date || '2026-10-15',
    bio: user.user_metadata?.bio || 'IELTS 7.5+ olish va xorijda ta\'lim olish uchun tayyorlanyapman.',
    provider: isSupabaseConfigured ? 'Google (Supabase)' : 'Local Seans',
    created_at: user.created_at || new Date().toISOString()
  }
}

/**
 * Profilni yangilash
 */
export async function updateProfile(profileData) {
  const user = await getUser()
  if (!user) return null

  const updated = {
    id: user.id,
    full_name: profileData.full_name,
    target_band: profileData.target_band,
    exam_date: profileData.exam_date,
    bio: profileData.bio,
    avatar_url: profileData.avatar_url || user.user_metadata?.avatar_url || '',
    updated_at: new Date().toISOString()
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('profiles').upsert(updated)
    } catch (e) {
      console.warn('Supabase profile update failed:', e)
    }
  }

  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated))
  
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}')
  if (currentUser.user_metadata) {
    currentUser.user_metadata = {
      ...currentUser.user_metadata,
      ...updated
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser))
  }

  return updated
}

/**
 * Test natijasini saqlash
 */
export async function saveTestResult({ testType, testId, score, totalQuestions = 40, bandScore, timeSpent, answers }) {
  const user = await getUser()
  const userId = user ? user.id : 'guest-user'

  const newResult = {
    id: `res-${Date.now()}`,
    user_id: userId,
    test_type: testType,
    test_id: testId,
    score,
    total_questions: totalQuestions,
    band_score: bandScore,
    time_spent: timeSpent,
    answers,
    completed_at: new Date().toISOString()
  }

  // Always save to LocalStorage for fallback & offline speed
  const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]')
  results.unshift(newResult)
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results))

  // AuthContext'ga xabar beramiz — dashboard va hisobotlar darhol
  // yangilanadi, foydalanuvchi sahifani qayta yuklamasligi kerak.
  // (`storage` hodisasi faqat BOSHQA tablarda ishlaydi, shu tabda emas.)
  try {
    window.dispatchEvent(new CustomEvent('ielts:results-updated'))
  } catch (e) { /* SSR yoki eski brauzer */ }

  // Avtomatik bulutga yozish — test tugagan zahoti
  if (isSupabaseConfigured && supabase && user?.id) {
    try {
      const { error } = await supabase.from('test_results').insert([newResult])
      if (error) throw error
      markSynced([newResult.id])
    } catch (e) {
      // Xatolik bo'lsa ham natija localStorage'da qoladi va keyingi
      // avtomatik sinxronlashda qayta yuboriladi
      console.warn('Supabase test result save error:', e)
    }
  }

  return newResult
}

/**
 * Aloqa xatosini foydalanuvchi tushunadigan xabarga aylantiradi.
 *
 * NIMA UCHUN KERAK: ilgari bulut so'rovi muvaffaqiyatsiz bo'lsa, funksiya
 * jimgina bo'sh ro'yxat qaytarardi. Ekranda "hali test topshirilmagan"
 * degan yozuv chiqardi — ya'ni "ma'lumot yo'q" va "serverga ulanib
 * bo'lmadi" bir xil ko'rinardi. Supabase loyihasi bepul tarifda pauzaga
 * tushganda aynan shu sodir bo'ldi va natijalar o'chib ketgandek tuyuldi.
 */
export function describeFetchError(err) {
  const raw = (err?.message || String(err || '')).toLowerCase()

  if (raw.includes('failed to fetch') || raw.includes('networkerror') || raw.includes('load failed')) {
    return 'Serverga ulanib bo\'lmadi. Internet aloqangizni tekshiring.'
  }
  if (raw.includes('timeout') || raw.includes('timed out') || raw.includes('521') || raw.includes('503')) {
    return 'Server javob bermayapti — ma\'lumotlar bazasi vaqtincha to\'xtatilgan bo\'lishi mumkin.'
  }
  return 'Serverdan natijalarni olishda xatolik yuz berdi.'
}

/**
 * Natijalarni olish (Tozalash vaqtidan oldingi barcha eskirgan natijalar filtrlanadi).
 *
 * Qaytaradi: `{ results, error }`
 *   - `error === null` → bulut bilan aloqa muvaffaqiyatli
 *   - `error` matn    → aloqa uzilgan; `results` faqat localStorage'dan,
 *                       ya'ni TO'LIQ EMAS. Interfeys buni ochiq aytishi shart.
 */
export async function getTestResultsWithStatus(limit = 100) {
  const clearedAtStr = localStorage.getItem(STORAGE_KEYS.CLEARED_AT)
  const clearedAt = clearedAtStr ? new Date(clearedAtStr) : null

  // Bir marta o'qiymiz — quyida ham, bulut so'rovida ham kerak
  const currentUser = await getUser()
  const currentId = currentUser?.id ?? null

  let supabaseResults = []
  let fetchError = null
  if (isSupabaseConfigured && supabase) {
    try {
      const user = currentUser
      // DIQQAT: user_id filtri shart — busiz har bir foydalanuvchi
      // boshqalarning natijalarini ham ko'radi.
      if (user?.id) {
        const { data, error } = await supabase
          .from('test_results')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(limit)
        if (error) {
          // Xatoni yashirmaymiz — yuqoriga uzatamiz.
          fetchError = describeFetchError(error)
          console.warn('getTestResults:', error)
        } else if (data) {
          supabaseResults = data
        }
      }
    } catch (e) {
      fetchError = describeFetchError(e)
      console.warn('Supabase fetch error:', e)
    }
  }

  const allLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]')

  // DIQQAT: localStorage brauzerga tegishli, foydalanuvchiga emas.
  // Filtrsiz qo'shsak quyidagilar boshqa odamning hisobida ko'rinadi:
  //   - login qilishdan oldin "guest-user" nomi bilan saqlangan testlar
  //   - shu brauzerda boshqa akkaunt bilan topshirilgan testlar
  // Aynan shu sabab dashboard'da "o'zidan o'zi" testlar paydo bo'lardi.
  const localResults = currentId
    ? allLocal.filter(r => !r.user_id || r.user_id === currentId || r.user_id === 'guest-user')
    : allLocal.filter(r => !r.user_id || r.user_id === 'guest-user')

  // Barcha mahalliy va Supabase testlarini dublikatsiz birlashtirish
  const combinedMap = new Map()

  for (const item of localResults) {
    const key = item.id || `${item.test_id}-${item.completed_at}`
    combinedMap.set(key, item)
  }

  for (const item of supabaseResults) {
    const key = item.id || `${item.test_id}-${item.completed_at}`
    combinedMap.set(key, item)
  }

  let allMerged = Array.from(combinedMap.values()).sort((a, b) => {
    const dateA = new Date(a.completed_at || a.created_at || 0)
    const dateB = new Date(b.completed_at || b.created_at || 0)
    return dateB - dateA
  })

  // Agarda o'chirish amalga oshirilgan bo'lsa, o'chirish vaqtidan oldingi testlarni yashirish
  if (clearedAt) {
    allMerged = allMerged.filter(r => {
      const itemDate = new Date(r.completed_at || r.created_at || 0)
      return itemDate > clearedAt
    })
  }

  return { results: allMerged.slice(0, limit), error: fetchError }
}

/**
 * Eski chaqiruvlar uchun moslik qatlami — faqat massiv qaytaradi.
 * Aloqa holati ham kerak bo'lsa `getTestResultsWithStatus` ishlating.
 */
export async function getTestResults(limit = 100) {
  const { results } = await getTestResultsWithStatus(limit)
  return results
}

/**
 * Statistika hisoblash
 */
export async function getStats() {
  const results = await getTestResults(100)

  if (!results.length) {
    return {
      totalTests: 0,
      avgBand: '0.0',
      bestBand: '0.0',
      lastTest: null
    }
  }

  const bands = results.map(r => parseFloat(r.band_score) || 0)
  const sumBands = bands.reduce((acc, curr) => acc + curr, 0)

  return {
    totalTests: results.length,
    avgBand: (sumBands / bands.length).toFixed(1),
    bestBand: Math.max(...bands).toFixed(1),
    lastTest: results[0]
  }
}

/**
 * Local natijalarni Supabase ga sinxronlash.
 * Endi bu funksiya avtomatik chaqiriladi — foydalanuvchi tugma bosishi shart emas.
 *
 * @param {Object}  opts
 * @param {boolean} opts.force  true bo'lsa, allaqachon yuborilgan natijalar ham qayta yuboriladi
 */
export async function syncLocalResultsToSupabase({ force = false } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, count: 0, message: 'Supabase kalitlari o\'rnatilmagan' }
  }

  const user = await getUser()
  if (!user?.id) {
    return { success: false, count: 0, message: 'Sinxronlash uchun avval tizimga kiring' }
  }

  const localResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]')
  if (!localResults.length) {
    return { success: true, count: 0, message: 'Sinxronlanadigan natijalar yo\'q' }
  }

  const syncedIds = readSyncedIds()
  const pending = force ? localResults : localResults.filter(r => !syncedIds.has(r.id))

  if (!pending.length) {
    return { success: true, count: 0, message: 'Barcha natijalar allaqachon sinxronlangan' }
  }

  // Login'gacha yig'ilgan "guest-user" natijalarini haqiqiy foydalanuvchiga bog'laymiz
  const payload = pending.map(r => ({
    ...r,
    user_id: r.user_id && r.user_id !== 'guest-user' ? r.user_id : user.id
  }))

  try {
    const { error } = await supabase.from('test_results').upsert(payload)
    if (error) throw error
    markSynced(payload.map(r => r.id))

    // Bulutda user_id yangilandi — local nusxada ham yangilaymiz.
    // Aks holda yozuv "guest-user" bo'lib qolib, keyin shu brauzerga
    // kirgan boshqa foydalanuvchining ro'yxatida ham ko'rinardi.
    const claimed = new Set(payload.map(r => r.id))
    const updatedLocal = localResults.map(r =>
      claimed.has(r.id) ? { ...r, user_id: user.id } : r
    )
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updatedLocal))

    return { success: true, count: payload.length, message: `${payload.length} ta natija Supabase ga saqlandi!` }
  } catch (err) {
    console.warn('Sync error:', err)
    return { success: false, count: 0, message: err.message }
  }
}

/**
 * Bitta test natijasini o'chirish.
 *
 * Ikki joydan o'chiriladi: localStorage va Supabase. Faqat bittasidan
 * o'chirilsa, natija keyingi sinxronlashda qaytib keladi.
 */
export async function deleteTestResult(id) {
  if (!id) return { ok: false, error: 'ID yo\'q' }

  // 1. localStorage
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]')
    localStorage.setItem(
      STORAGE_KEYS.RESULTS,
      JSON.stringify(all.filter(r => r.id !== id)),
    )
    // Sinxronlangan ID'lar ro'yxatidan ham olib tashlaymiz
    const synced = readSyncedIds()
    synced.delete(id)
    localStorage.setItem(STORAGE_KEYS.SYNCED_IDS, JSON.stringify([...synced]))
  } catch (e) {
    console.warn('Local delete error:', e)
  }

  // 2. Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const user = await getUser()
      if (user?.id) {
        const { error } = await supabase
          .from('test_results')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)      // begona yozuvga tegmaslik kafolati
        if (error) throw error
      }
    } catch (e) {
      console.warn('Supabase delete error:', e)
      return { ok: false, error: e.message }
    }
  }

  try {
    window.dispatchEvent(new CustomEvent('ielts:results-updated'))
  } catch (e) { /* eski brauzer */ }

  return { ok: true }
}

/**
 * Natijalar tarixini tozalash (Ham Local, Ham Supabase-dan kafolatli va doimiy o'chiradi!)
 */
export async function clearTestHistory() {
  const nowISO = new Date().toISOString()
  localStorage.setItem(STORAGE_KEYS.CLEARED_AT, nowISO)
  localStorage.removeItem(STORAGE_KEYS.RESULTS)
  localStorage.removeItem('ielts_results')
  localStorage.setItem(STORAGE_KEYS.RESULTS, '[]')
  
  let failure = null

  if (isSupabaseConfigured && supabase) {
    try {
      const user = await getUser()
      if (user?.id) {
        // Avval nechta yozuv borligini sanaymiz
        const { count: before } = await supabase
          .from('test_results')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // DIQQAT: faqat shu foydalanuvchining natijalari o'chiriladi.
        // Bu yerga hech qachon filtersiz delete qo'shmang — u butun jadvalni tozalaydi.
        //
        // `.select()` MUHIM: RLS'da DELETE policy'si bo'lmasa Supabase
        // XATO BERMAYDI, shunchaki 0 ta qator o'chiradi. Usiz bu jim
        // muvaffaqiyatsizlikni sezmaymiz va foydalanuvchi "tugma
        // ishlamayapti" deb qoladi.
        const { data, error } = await supabase
          .from('test_results')
          .delete()
          .eq('user_id', user.id)
          .select('id')

        if (error) throw error

        const deleted = data?.length ?? 0
        if ((before ?? 0) > 0 && deleted === 0) {
          failure = `${before} ta natija topildi, lekin bittasi ham o'chirilmadi. Bazada DELETE ruxsati (RLS policy) yo'q — supabase/rls-setup.sql ni qayta ishga tushiring.`
        }
      }
    } catch (e) {
      console.warn('Supabase delete history error:', e)
      failure = e.message
    }
  }

  // Barcha ochiq ko'rinishlar (dashboard, hisobotlar) darhol tozalansin.
  // Bulutdan o'chirish muvaffaqiyatsiz bo'lsa hodisani YUBORMAYMIZ —
  // aks holda tinglovchi bulutdan qayta yuklab, endigina tozalangan
  // ro'yxatni qaytarib qo'yadi va tugma ishlamagandek ko'rinadi.
  if (!failure) {
    try {
      window.dispatchEvent(new CustomEvent('ielts:results-updated'))
    } catch (e) { /* SSR yoki eski brauzer */ }
  }

  return { ok: !failure, error: failure }
}
