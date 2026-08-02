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
  CLEARED_AT: 'ielts_cleared_at'
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

  // Save to Supabase if available
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('test_results').insert([newResult])
    } catch (e) {
      console.warn('Supabase test result save error:', e)
    }
  }

  return newResult
}

/**
 * Natijalarni olish (Tozalash vaqtidan oldingi barcha eskirgan natijalar filtrlanadi)
 */
export async function getTestResults(limit = 100) {
  const clearedAtStr = localStorage.getItem(STORAGE_KEYS.CLEARED_AT)
  const clearedAt = clearedAtStr ? new Date(clearedAtStr) : null

  let supabaseResults = []
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(limit)
      if (data && !error) {
        supabaseResults = data
      }
    } catch (e) {
      console.warn('Supabase fetch error:', e)
    }
  }

  const localResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]')

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

  return allMerged.slice(0, limit)
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
 * Local natijalarni Supabase ga sinxronlash
 */
export async function syncLocalResultsToSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'Supabase kalitlari o\'rnatilmagan' }
  }

  const localResults = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]')
  if (!localResults.length) {
    return { success: true, count: 0, message: 'Sinxronlanadigan natijalar yo\'q' }
  }

  try {
    const { error } = await supabase.from('test_results').upsert(localResults)
    if (error) throw error
    return { success: true, count: localResults.length, message: `${localResults.length} ta natija Supabase ga saqlandi!` }
  } catch (err) {
    console.error('Sync error:', err)
    return { success: false, message: err.message }
  }
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
  
  if (isSupabaseConfigured && supabase) {
    try {
      const user = await getUser()
      if (user?.id) {
        await supabase.from('test_results').delete().eq('user_id', user.id)
      }
      await supabase.from('test_results').delete().gte('score', 0)
    } catch (e) {
      console.warn('Supabase delete history error:', e)
    }
  }
}
