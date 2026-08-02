// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STORAGE ENGINE FOR VANILLA JS PAGES
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  USER: 'ielts_user',
  RESULTS: 'ielts_test_results'
}

export async function signInWithGoogle() {
  const mockUser = {
    id: `user-${Date.now()}`,
    email: 'student@ielts.uz',
    user_metadata: {
      full_name: 'IELTS Student',
      avatar_url: ''
    }
  }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser))
  window.location.href = '/dashboard'
  return { user: mockUser }
}

export async function signOut() {
  localStorage.removeItem(STORAGE_KEYS.USER)
  window.location.href = '/'
}

export async function getSession() {
  const stored = localStorage.getItem(STORAGE_KEYS.USER)
  if (stored) {
    try {
      return { user: JSON.parse(stored) }
    } catch {
      return null
    }
  }
  return null
}

export async function getUser() {
  const session = await getSession()
  return session?.user || null
}

export async function getProfile() {
  const user = await getUser()
  if (!user) return null
  return {
    id: user.id,
    full_name: user.user_metadata?.full_name || 'IELTS Student',
    avatar_url: '',
    email: user.email
  }
}

export function onAuthStateChange(callback) {
  getSession().then(session => callback('SIGNED_IN', session))
  return { unsubscribe: () => {} }
}

export async function saveTestResult({ testType, testId, score, totalQuestions = 40, bandScore, timeSpent, answers = null }) {
  const user = await getUser()
  const userId = user ? user.id : 'guest-user'

  const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]')
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

  results.unshift(newResult)
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results))
  return newResult
}

export async function getTestResults(limit = 20) {
  const results = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]')
  return results.slice(0, limit)
}

export async function getStats() {
  const results = await getTestResults(100)
  if (!results.length) {
    return { totalTests: 0, avgBand: '0.0', bestBand: '0.0', lastTest: null }
  }

  const bands = results.map(r => parseFloat(r.band_score))
  return {
    totalTests: results.length,
    avgBand: (bands.reduce((a, b) => a + b, 0) / bands.length).toFixed(1),
    bestBand: Math.max(...bands).toFixed(1),
    lastTest: results[0]
  }
}
