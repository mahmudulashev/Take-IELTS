import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  getSession,
  signOut as supabaseSignOut,
  onAuthStateChange,
  describeFetchError,
} from '../lib/supabase'
import { getWritingResultsWithStatus as fetchWriting, clearWritingHistory } from '../lib/writing'

/**
 * Bazadagi `writing_results` qatorini interfeys kutadigan shaklga keltiradi:
 * `band_score` va `completed_at` bo'lsa, ro'yxatlar va statistika
 * hech qanday maxsus shartsiz ishlaydi.
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
    task_type: row.task_type,
    writing: row,                   // to'liq tahlil kerak bo'lsa
  }
}

const EMPTY_STATS = { totalTests: 0, avgBand: '0.0', bestBand: '0.0', lastTest: null }

const AuthContext = createContext(null)

// Instantaneous synchronous local user read
function readLocalUser() {
  try {
    const raw = localStorage.getItem('ielts_user')
    const parsed = raw ? JSON.parse(raw) : null
    return parsed?.id ? parsed : null
  } catch { return null }
}

function toResults(rows) {
  return rows
    .map(normalizeWriting)
    .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))
}

/**
 * Umumiy Writing band.
 *
 * IELTS'da Writing bandini ikkala task teng belgilamaydi — Task 2 ning
 * og'irligi ikki barobar:  (Task 1 + 2 × Task 2) / 3.  Oddiy o'rtacha
 * olish Task 1 ni haddan tashqari ko'tarib yuboradi va nomzodga
 * imtihonda chiqadigan balldan boshqa raqam ko'rsatadi.
 *
 * Bitta task bo'yicha hali javob bo'lmasa, bor bo'lganining o'rtachasi
 * olinadi. Natija eng yaqin yarim bandga yaxlitlanadi.
 */
function writingBand(results) {
  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
  const halfBand = (n) => (Math.round(n * 2) / 2).toFixed(1)

  const bandsOf = (task) => results
    .filter((r) => (r.task_type === 'task1' ? 'task1' : 'task2') === task)
    .map((r) => parseFloat(r.band_score))
    .filter((n) => !Number.isNaN(n))

  const t1 = bandsOf('task1')
  const t2 = bandsOf('task2')

  if (!t1.length && !t2.length) return '0.0'
  if (!t1.length) return halfBand(mean(t2))
  if (!t2.length) return halfBand(mean(t1))
  return halfBand((mean(t1) + 2 * mean(t2)) / 3)
}

function computeStats(results) {
  if (!results.length) return EMPTY_STATS
  const bands = results.map(r => parseFloat(r.band_score) || 0)
  return {
    totalTests: results.length,
    avgBand: writingBand(results),
    bestBand: Math.max(...bands).toFixed(1),
    lastTest: results[0],
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readLocalUser())
  // Lokal nusxa bo'lsa darhol chizamiz; bo'lmasa Supabase javobini kutamiz —
  // aks holda tizimga kirgan foydalanuvchi bir zumda /auth ga otilib ketadi.
  const [sessionChecked, setSessionChecked] = useState(() => Boolean(readLocalUser()))

  const [results, setResults] = useState([])
  const [stats, setStats] = useState(EMPTY_STATS)

  // Bulut bilan aloqa uzilganda ro'yxat bo'sh qoladi. Interfeys buni
  // "hali javob yozilmagan" deb ko'rsatmasligi uchun xatoni alohida
  // saqlaymiz — foydalanuvchi ma'lumotim o'chibdi deb o'ylamasin.
  const [syncError, setSyncError] = useState(null)

  useEffect(() => {
    async function init() {
      try {
        const session = await getSession()
        if (session?.user) setUser(session.user)
      } finally {
        setSessionChecked(true)
      }
    }
    init()

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user)
    })

    return () => subscription?.unsubscribe()
  }, [])

  const refreshResults = useCallback(async () => {
    try {
      const { results: rows, error } = await fetchWriting(50)
      const normalized = toResults(rows)
      setResults(normalized)
      setStats(computeStats(normalized))
      setSyncError(error || null)
    } catch (e) {
      setSyncError(describeFetchError(e))
    }
  }, [])

  // Foydalanuvchi aniqlangach yuklaymiz
  useEffect(() => {
    if (!user) return
    let cancelled = false

    ;(async () => {
      try {
        const { results: rows, error } = await fetchWriting(50)
        if (cancelled) return
        const normalized = toResults(rows)
        setResults(normalized)
        setStats(computeStats(normalized))
        setSyncError(error || null)
      } catch (e) {
        if (!cancelled) setSyncError(describeFetchError(e))
      }
    })()

    return () => { cancelled = true }
  }, [user])

  // Boshqa tabda yoki test sahifasida yozilgan javob darhol ko'rinsin:
  // tabga qaytganda va bfcache'dan tiklanganda qayta o'qiymiz.
  useEffect(() => {
    let last = 0

    function refreshThrottled() {
      const now = Date.now()
      if (now - last < 1500) return   // signal ketma-ket kelishi mumkin
      last = now
      refreshResults()
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') refreshThrottled()
    }

    window.addEventListener('pageshow', refreshThrottled)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pageshow', refreshThrottled)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refreshResults])

  const clearHistory = useCallback(async () => {
    // Parametrsiz chaqiruv — Task 1 va Task 2 javoblarining hammasi
    const res = await clearWritingHistory()

    // Bulutdan o'chirish muvaffaqiyatsiz bo'lsa ekranni tozalamaymiz —
    // aks holda foydalanuvchi "tozalandi" deb o'ylaydi, keyin sahifani
    // yangilaganda natijalar qaytib keladi.
    if (res?.ok !== false) {
      setResults([])
      setStats(EMPTY_STATS)
    }
    return res ?? { ok: true }
  }, [])

  const signOut = async () => {
    await supabaseSignOut()
    setUser(null)
    setSyncError(null)
    setResults([])
    setStats(EMPTY_STATS)
  }

  return (
    <AuthContext.Provider value={{ user, sessionChecked, signOut, results, stats, syncError, refreshResults, clearHistory }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
