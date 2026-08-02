import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

// Dev-serverda HMR so'rovlarini to'sib qo'ymasligi uchun barcha ServiceWorker-larni tozalash
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister()
    }
  }).catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)
