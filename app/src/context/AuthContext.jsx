import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { 
  getSession, 
  signOut as supabaseSignOut, 
  onAuthStateChange, 
  getTestResults as fetchResults, 
  getStats as fetchStats,
  clearTestHistory as supabaseClearHistory,
  syncLocalResultsToSupabase,
  isSupabaseConfigured
} from '../lib/supabase'
import { getWritingResults } from '../lib/writing'

/**
 * Writing natijalari alohida jadvalda (`writing_results`) saqlanadi,
 * chunki ularning tuzilishi butunlay boshqacha — 40 ta savol emas,
 * to'rtta mezon va matn tahlili.
 *
 * Lekin Dashboard va statistika uchun ular Reading/Listening bilan
 * bir qatorda turishi kerak. Shuning uchun bu yerda umumiy shaklga
 * keltiramiz: `band_score` va `completed_at` bo'lsa, mavjud kod
 * hech qanday o'zgarishsiz ishlaydi.
 */
function normalizeWriting(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    test_type: 'writing',
    test_id: row.prompt_id || 'writing-task2',
    score: row.word_count,          // "so'z" ma'nosida
    total_questions: null,          // Writing'da savol soni yo'q
    band_score: row.band_overall,
    time_spent: row.time_spent,
    completed_at: row.created_at,
    writing: row,                   // to'liq tahlil kerak bo'lsa
  }
}

const AuthContext = createContext(null)

// Instantaneous synchronous local user read
function readLocalUser() {
  try {
    const raw = localStorage.getItem('ielts_user')
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.id ? parsed : null
  } catch { return null }
}

// Sync localStorage read — 0ms, no spinner needed
function readLocalResults(limit = 100) {
  try {
    const raw = localStorage.getItem('ielts_test_results')
    const all = raw ? JSON.parse(raw) : []

    // localStorage brauzerga tegishli, foydalanuvchiga emas.
    // Filtrsiz o'qisak, boshqa akkaunt bilan yoki login'gacha
    // topshirilgan testlar shu foydalanuvchining natijalari
    // bo'lib ko'rinadi va statistikani buzadi.
    const me = readLocalUser()
    const filtered = all.filter(
      (r) => !r.user_id || r.user_id === 'guest-user' || r.user_id === me?.id,
    )

    return filtered.slice(0, limit)
  } catch { return [] }
}

/** Reading/Listening va Writing natijalarini bitta sanalangan ro'yxatga qo'shish */
function mergeAll(testRows = [], writingRows = []) {
  return [...testRows, ...writingRows.map(normalizeWriting)]
    .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))
}

function computeStats(results) {
  if (!results.length) return { totalTests: 0, avgBand: '0.0', bestBand: '0.0', lastTest: null }
  const bands = results.map(r => parseFloat(r.band_score) || 0)
  const sum = bands.reduce((a, b) => a + b, 0)
  return {
    totalTests: results.length,
    avgBand: (sum / bands.length).toFixed(1),
    bestBand: Math.max(...bands).toFixed(1),
    lastTest: results[0]
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readLocalUser())
  const [sessionChecked, setSessionChecked] = useState(true)

  const [results, setResults] = useState(() => readLocalResults())
  const [stats, setStats] = useState(() => computeStats(readLocalResults()))
  const [dataReady, setDataReady] = useState(true)

  useEffect(() => {
    async function init() {
      const session = await getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }
    init()

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // Foydalanuvchi kirgach: avval yuborilmagan local natijalarni avtomatik
  // sinxronlaymiz, keyin natija/statistikani yangilaymiz.
  // Har bir user uchun seans davomida bir marta ishlaydi.
  const syncedForUser = useRef(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function syncThenRefresh() {
      if (isSupabaseConfigured && syncedForUser.current !== user.id) {
        syncedForUser.current = user.id
        try {
          const res = await syncLocalResultsToSupabase()
          if (res.count > 0) {
            console.info(`[auto-sync] ${res.count} ta natija bulutga yuborildi`)
          }
        } catch (e) {
          // Sinxronlash muvaffaqiyatsiz bo'lsa ham natijalarni ko'rsatishda davom etamiz
          syncedForUser.current = null
        }
      }

      if (cancelled) return

      try {
        const [testRows, writingRows] = await Promise.all([fetchResults(100), getWritingResults(50)])
        if (cancelled) return
        const merged = mergeAll(testRows, writingRows)
        setResults(merged)
        setStats(computeStats(merged))
      } catch (e) {
        // Keep localStorage data on error
      }
    }

    syncThenRefresh()
    return () => { cancelled = true }
  }, [user])

  // ------------------------------------------------------------------
  // Natijalar boshqa joyda o'zgarganda darhol ko'rinsin.
  //
  // Muammo: natija uch xil joyda saqlanadi —
  //   1. React test sahifasi (/test/reading)  → saveTestResult()
  //   2. Statik HTML testlar                  → to'g'ridan-to'g'ri localStorage
  //   3. Boshqa tab                            → localStorage
  // Ilgari `results` faqat `user` o'zgarganda yangilanardi, shuning uchun
  // testdan qaytgach dashboard eski holatni ko'rsatardi va foydalanuvchi
  // sahifani qo'lda yangilashga majbur bo'lardi.
  //
  // Yechim: to'rtta signalni tinglaymiz. Avval localStorage'dan darhol
  // o'qiymiz (0ms, spinner yo'q), keyin fonda Supabase bilan birlashtiramiz.
  // ------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false
    let lastSync = 0

    function syncNow() {
      // Bir necha signal ketma-ket kelishi mumkin (masalan pageshow +
      // visibilitychange). Bulutga keraksiz so'rov yubormaslik uchun
      // 1.5 soniyalik oraliq qo'yamiz.
      const now = Date.now()
      if (now - lastSync < 1500) return
      lastSync = now

      // 1-bosqich: darhol localStorage'dan (tez)
      const local = readLocalResults()
      setResults(local)
      setStats(computeStats(local))

      // 2-bosqich: fonda bulut bilan birlashtirish (Writing ham qo'shiladi)
      Promise.all([fetchResults(100), getWritingResults(50)])
        .then(([testRows, writingRows]) => {
          if (cancelled) return
          const merged = mergeAll(testRows, writingRows)
          setResults(merged)
          setStats(computeStats(merged))
        })
        .catch(() => { /* xato bo'lsa local ma'lumot qoladi */ })
    }

    function onStorage(e) {
      // e.key null bo'lishi mumkin (localStorage.clear())
      if (!e.key || e.key === 'ielts_test_results') syncNow()
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') syncNow()
    }

    function onPageShow() {
      // Orqaga tugmasi bfcache'dan tiklaganda ham ishlaydi
      syncNow()
    }

    window.addEventListener('storage', onStorage)                 // boshqa tab
    window.addEventListener('ielts:results-updated', syncNow)     // shu tab (saveTestResult)
    window.addEventListener('pageshow', onPageShow)               // bfcache / orqaga
    document.addEventListener('visibilitychange', onVisibility)   // tabga qaytish

    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('ielts:results-updated', syncNow)
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const refreshResults = useCallback(async () => {
    const [testRows, writingRows] = await Promise.all([fetchResults(100), getWritingResults(50)])
    const merged = mergeAll(testRows, writingRows)
    setResults(merged)
    setStats(computeStats(merged))
  }, [])

  const clearHistory = useCallback(async () => {
    const res = await supabaseClearHistory()

    // Bulutdan o'chirish muvaffaqiyatsiz bo'lsa ekranni tozalamaymiz —
    // aks holda foydalanuvchi "tozalandi" deb o'ylaydi, keyin sahifani
    // yangilaganda natijalar qaytib keladi.
    if (res?.ok !== false) {
      setResults([])
      setStats({ totalTests: 0, avgBand: '0.0', bestBand: '0.0', lastTest: null })
    }
    return res ?? { ok: true }
  }, [])

  const signOut = async () => {
    await supabaseSignOut()
    setUser(null)
    setResults([])
    setStats({ totalTests: 0, avgBand: '0.0', bestBand: '0.0', lastTest: null })
  }

  return (
    <AuthContext.Provider value={{ user, sessionChecked, signOut, results, stats, dataReady, refreshResults, clearHistory }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
