import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sayt bitta SPA'dan iborat. Ilgari bu yerda har bir statik reading/listening
// test HTML'i alohida input sifatida ro'yxatlangan edi — ular olib tashlandi.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    hmr: {
      clientPort: 3000,
    },
  },
})
