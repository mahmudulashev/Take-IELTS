import { getProfile, getTestResults, getStats, signOut } from './supabase.js'
import { requireAuth, renderUserHeader } from './auth-guard.js'
import { formatDate, formatTime, getBandBadgeClass } from './test-common.js'

// ══════════════════════════════════════════
// DASHBOARD — Profil + Natijalar
// ══════════════════════════════════════════

async function initDashboard() {
  // Auth tekshiruvi
  const session = await requireAuth()
  if (!session) return

  // Foydalanuvchi ma'lumotlarini ko'rsatish
  renderUserHeader(session)
  await renderProfile(session)
  await renderStats()
  await renderResults()

  // Logout tugmasi
  const logoutBtn = document.getElementById('logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut()
    })
  }

  // Mobile sidebar toggle
  const menuBtn = document.getElementById('menu-toggle')
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('sidebar-overlay')

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open')
      overlay?.classList.toggle('open')
    })
    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('open')
      overlay.classList.remove('open')
    })
  }

  // Sahifani ko'rsatish (loading holatini yashirish)
  document.body.classList.add('loaded')
}

/**
 * Profil ma'lumotlarini ko'rsatish
 */
async function renderProfile(session) {
  const user = session.user
  const name = user.user_metadata?.full_name || user.user_metadata?.name || 'Foydalanuvchi'
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
  const email = user.email || ''
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Welcome section
  const welcomeName = document.getElementById('welcome-name')
  if (welcomeName) welcomeName.textContent = `Salom, ${name.split(' ')[0]}! 👋`

  // Welcome avatar
  const welcomeAvatar = document.getElementById('welcome-avatar')
  if (welcomeAvatar) {
    if (avatar) {
      welcomeAvatar.innerHTML = `<img src="${avatar}" alt="${name}" class="avatar avatar-xl" referrerpolicy="no-referrer">`
    } else {
      welcomeAvatar.innerHTML = `<div class="avatar avatar-xl avatar-placeholder">${initials}</div>`
    }
  }

  // Sidebar profil
  const sidebarAvatar = document.getElementById('sidebar-avatar')
  if (sidebarAvatar) {
    if (avatar) {
      sidebarAvatar.innerHTML = `<img src="${avatar}" alt="${name}" class="avatar" referrerpolicy="no-referrer">`
    } else {
      sidebarAvatar.innerHTML = `<div class="avatar avatar-placeholder">${initials}</div>`
    }
  }

  const sidebarName = document.getElementById('sidebar-name')
  if (sidebarName) sidebarName.textContent = name

  const sidebarEmail = document.getElementById('sidebar-email')
  if (sidebarEmail) sidebarEmail.textContent = email
}

/**
 * Statistikani ko'rsatish
 */
async function renderStats() {
  const stats = await getStats()

  const statTests = document.getElementById('stat-tests')
  const statAvg = document.getElementById('stat-avg')
  const statBest = document.getElementById('stat-best')
  const statLast = document.getElementById('stat-last')

  if (statTests) statTests.textContent = stats.totalTests
  if (statAvg) statAvg.textContent = stats.totalTests > 0 ? stats.avgBand : '—'
  if (statBest) statBest.textContent = stats.totalTests > 0 ? stats.bestBand : '—'
  if (statLast) {
    if (stats.lastTest) {
      statLast.textContent = `${stats.lastTest.band_score}`
    } else {
      statLast.textContent = '—'
    }
  }
}

/**
 * Natijalar jadvalini ko'rsatish
 */
async function renderResults() {
  const results = await getTestResults()
  const tbody = document.getElementById('results-table-body')
  const emptyState = document.getElementById('results-empty')

  if (!tbody) return

  if (results.length === 0) {
    tbody.innerHTML = ''
    if (emptyState) emptyState.classList.remove('hidden')
    return
  }

  if (emptyState) emptyState.classList.add('hidden')

  tbody.innerHTML = results.map((r, i) => `
    <tr>
      <td class="results-num">${i + 1}</td>
      <td>${formatDate(r.completed_at)}</td>
      <td>
        <span class="test-type-badge ${r.test_type === 'reading' ? 'test-type-reading' : 'test-type-listening'}">
          ${r.test_type === 'reading' ? '📖 Reading' : '🎧 Listening'}
        </span>
      </td>
      <td class="results-score">${r.score}/${r.total_questions}</td>
      <td>
        <span class="badge ${getBandBadgeClass(r.band_score)}">${r.band_score}</span>
      </td>
      <td class="results-time">${formatTime(r.time_spent)}</td>
    </tr>
  `).join('')
}

// Ishga tushirish
initDashboard()
