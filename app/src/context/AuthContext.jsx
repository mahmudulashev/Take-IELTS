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
