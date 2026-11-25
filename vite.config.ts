import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' keeps asset paths relative so the static build works on GitHub Pages
// under any repository sub-path. Routing uses HashRouter for the same reason.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    // React + Framer Motion + Router form one ~170 kB (gzip) vendor bundle; the Client Studio is lazy-loaded separately.
    chunkSizeWarningLimit: 700,
  },
})
