import { getSession } from './supabase.js'

/**
 * Auth Guard — login qilmagan foydalanuvchini auth sahifasiga yo'naltiradi
 * Har bir himoyalangan sahifada import qilinadi
 */
export async function requireAuth() {
  const session = await getSession()

  if (!session) {
    // Hozirgi sahifani qaytish uchun saqlaymiz
    sessionStorage.setItem('redirectAfterLogin', window.location.href)
    window.location.href = '/auth.html'
    return null
  }

  return session
}

/**
 * Auth sahifasida ishlatiladi — login bo'lsa dashboard'ga yo'naltiradi
 */
export async function redirectIfLoggedIn() {
  const session = await getSession()

  if (session) {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
    sessionStorage.removeItem('redirectAfterLogin')
    window.location.href = redirectUrl || '/dashboard.html'
    return true
  }

  return false
}

/**
 * Header'dagi foydalanuvchi ma'lumotlarini ko'rsatish
 */
export function renderUserHeader(session) {
  if (!session?.user) return

  const user = session.user
  const name = user.user_metadata?.full_name || user.user_metadata?.name || 'User'
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Header avatar elementi
  const avatarEl = document.getElementById('user-avatar')
  if (avatarEl) {
    if (avatar) {
      avatarEl.innerHTML = `<img src="${avatar}" alt="${name}" class="avatar" referrerpolicy="no-referrer">`
    } else {
      avatarEl.innerHTML = `<div class="avatar avatar-placeholder">${initials}</div>`
    }
  }

  // Header ism elementi
  const nameEl = document.getElementById('user-name')
  if (nameEl) {
    nameEl.textContent = name
  }
}
