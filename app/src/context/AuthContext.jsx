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
    return all.slice(0, limit)
  } catch { return [] }
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
        const [freshResults, freshStats] = await Promise.all([fetchResults(100), fetchStats()])
        if (cancelled) return
        setResults(freshResults)
        setStats(freshStats)
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

      // 2-bosqich: fonda bulut bilan birlashtirish
      Promise.all([fetchResults(100), fetchStats()])
        .then(([freshResults, freshStats]) => {
          if (cancelled) return
          setResults(freshResults)
          setStats(freshStats)
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
    const [freshResults, freshStats] = await Promise.all([fetchResults(100), fetchStats()])
    setResults(freshResults)
    setStats(freshStats)
  }, [])

  const clearHistory = useCallback(async () => {
    await supabaseClearHistory()
    setResults([])
    setStats({ totalTests: 0, avgBand: '0.0', bestBand: '0.0', lastTest: null })
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
