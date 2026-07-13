import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['icons/favicon-32.png'],
      manifest: {
        name: 'FluxoCerto - Cake',
        short_name: 'FluxoCerto',
        description: 'Precificação inteligente para confeiteiros, boleiras e docerias.',
        lang: 'pt-BR',
        start_url: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FFF8F6',
        theme_color: '#E393AA',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        // jsPDF inclui um plugin doc.html() carregado sob demanda (html2canvas,
        // dompurify, canvg) que este app nunca usa — não faz sentido pré-cachear.
        globIgnores: ['**/html2canvas-*.js', '**/purify.es-*.js', '**/index.es-*.js'],
      },
    }),
  ],
})
