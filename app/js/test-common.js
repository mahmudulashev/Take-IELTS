// ══════════════════════════════════════════
// TEST COMMON — Umumiy test funksiyalari
// ══════════════════════════════════════════

/**
 * Timer class — 60 daqiqalik countdown
 */
export class TestTimer {
  constructor(displayEl, duration = 3600) {
    this.displayEl = displayEl
    this.totalSeconds = duration
    this.remaining = duration
    this.interval = null
    this.running = false
    this.onComplete = null
  }

  start() {
    if (this.running) return
    this.running = true
    this.interval = setInterval(() => {
      this.remaining--
      this.render()
      if (this.remaining <= 0) {
        this.stop()
        if (this.onComplete) this.onComplete()
      }
    }, 1000)
  }

  pause() {
    this.running = false
    clearInterval(this.interval)
  }

  toggle() {
    if (this.running) this.pause()
    else this.start()
  }

  stop() {
    this.running = false
    clearInterval(this.interval)
  }

  reset(duration) {
    this.stop()
    this.remaining = duration || this.totalSeconds
    this.render()
  }

  getTimeSpent() {
    return this.totalSeconds - this.remaining
  }

  render() {
    const min = Math.floor(this.remaining / 60)
    const sec = this.remaining % 60
    const text = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`

    if (this.displayEl) {
      this.displayEl.textContent = text

      // Qizil rang agar 5 daqiqadan kam qolsa
      if (this.remaining <= 300) {
        this.displayEl.classList.add('timer-warning')
      }
      if (this.remaining <= 60) {
        this.displayEl.classList.add('timer-danger')
      }
    }
  }
}

/**
 * IELTS Band score calculator — Reading
 */
export function calculateReadingBand(score) {
  if (score >= 39) return 9.0
  if (score >= 37) return 8.5
  if (score >= 35) return 8.0
  if (score >= 33) return 7.5
  if (score >= 30) return 7.0
  if (score >= 27) return 6.5
  if (score >= 23) return 6.0
  if (score >= 19) return 5.5
  if (score >= 15) return 5.0
  if (score >= 13) return 4.5
  if (score >= 10) return 4.0
  if (score >= 8) return 3.5
  if (score >= 6) return 3.0
  if (score >= 4) return 2.5
  return 2.0
}

/**
 * IELTS Band score calculator — Listening
 */
export function calculateListeningBand(score) {
  if (score >= 39) return 9.0
  if (score >= 37) return 8.5
  if (score >= 35) return 8.0
  if (score >= 32) return 7.5
  if (score >= 30) return 7.0
  if (score >= 26) return 6.5
  if (score >= 23) return 6.0
  if (score >= 18) return 5.5
  if (score >= 16) return 5.0
  if (score >= 13) return 4.5
  if (score >= 10) return 4.0
  if (score >= 8) return 3.5
  if (score >= 6) return 3.0
  if (score >= 4) return 2.5
  return 2.0
}

/**
 * Band score rangini olish
 */
export function getBandColor(band) {
  band = parseFloat(band)
  if (band >= 7.0) return 'var(--success)'
  if (band >= 5.5) return 'var(--warning)'
  return 'var(--danger)'
}

/**
 * Band score badge rangini olish
 */
export function getBandBadgeClass(band) {
  band = parseFloat(band)
  if (band >= 7.0) return 'badge-green'
  if (band >= 5.5) return 'badge-blue'
  return 'badge-red'
}

/**
 * Sanani formatlash: "1-Avg 2026"
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr)
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
  return `${date.getDate()}-${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Vaqtni formatlash: "12:35"
 */
export function formatTime(seconds) {
  if (!seconds) return '--:--'
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

/**
 * Toast notification ko'rsatish
 */
export function showToast(message, type = 'default', duration = 3000) {
  const existing = document.querySelector('.toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(10px)'
    setTimeout(() => toast.remove(), 300)
  }, duration)
}
