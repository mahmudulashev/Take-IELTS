import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// ErrorBoundary render xatolarini tutadi, lekin async xatolarni tutmaydi.
// Ular hech bo'lmasa konsolda ko'rinib tursin — "jimgina" yo'qolmasin.
window.addEventListener('unhandledrejection', (event) => {
  console.error('[global] ushlanmagan Promise xatosi:', event.reason)
})
window.addEventListener('error', (event) => {
  if (event.error) console.error('[global] ushlanmagan xato:', event.error)
})

// Dev-serverda HMR so'rovlarini to'sib qo'ymasligi uchun barcha ServiceWorker-larni tozalash
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister()
    }
  }).catch(() => {})
}

// Tashqi ErrorBoundary — AuthProvider'ning o'zi xato bersa ham tutadi.
// App ichida yana bittasi bor (Router ichida), u sahifa darajasidagi
// xatolarni tutib, foydalanuvchini butun ilovadan chiqarib yubormaydi.
ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
)
