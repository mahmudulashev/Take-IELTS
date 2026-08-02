import { signInWithGoogle } from './supabase.js'
import { redirectIfLoggedIn } from './auth-guard.js'

// Agar allaqachon login bo'lsa, dashboard'ga redirect
redirectIfLoggedIn()

// Google login button
const googleBtn = document.getElementById('google-login-btn')
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    try {
      googleBtn.disabled = true
      googleBtn.classList.add('loading')
      await signInWithGoogle()
    } catch (err) {
      googleBtn.disabled = false
      googleBtn.classList.remove('loading')
      console.error('Login failed:', err)
    }
  })
}
