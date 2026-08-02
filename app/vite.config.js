import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Emit to the repository-root `dist/` (this config lives in `app/`).
    // Vercel looks for `dist` at the repo root, so building here keeps the
    // deploy working whether or not vercel.json's outputDirectory is applied.
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: true,
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
