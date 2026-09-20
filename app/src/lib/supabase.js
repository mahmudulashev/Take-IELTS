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
