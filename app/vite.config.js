import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        readingTest: resolve(__dirname, 'reading-test.html'),
        readingTest2: resolve(__dirname, 'reading-test-2.html'),
        readingTest3: resolve(__dirname, 'reading-test-3.html'),
        readingTest4: resolve(__dirname, 'reading-test-4.html'),
        readingTest5: resolve(__dirname, 'reading-test-5.html'),
        listeningTest: resolve(__dirname, 'listening-test.html'),
        listeningTest2: resolve(__dirname, 'listening-test-2.html'),
        listeningTest3: resolve(__dirname, 'listening-test-3.html'),
        listeningTest4: resolve(__dirname, 'listening-test-4.html'),
        listeningTest5: resolve(__dirname, 'listening-test-5.html'),
        listeningTest6: resolve(__dirname, 'listening-test-6.html'),
        listeningTest7: resolve(__dirname, 'listening-test-7.html'),
        listeningTest8: resolve(__dirname, 'listening-test-8.html'),
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    hmr: {
      clientPort: 3000,
    },
  },
})
