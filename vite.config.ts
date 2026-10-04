import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// GitHub Pages serves the app under /<repo>/; the deploy workflow sets this.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  define: {
    // Shown in Settings so a parent can confirm the device has the newest version.
    __BUILD_ID__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'ThinkSprout',
        short_name: 'ThinkSprout',
        description: 'Gifted & Talented test practice for 1st and 2nd graders',
        theme_color: '#2ea44f',
        background_color: '#fffbf0',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],
        // The SPA fallback must not swallow the standalone policy pages.
        navigateFallbackDenylist: [/privacy\.html$/, /terms\.html$/],
        // Recordings are cached as they're fetched (the app pre-fetches them all
        // once). Range support matters: iPhones request audio in byte ranges and
        // won't play a full response served from the cache.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/audio/') && url.pathname.endsWith('.m4a'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'question-audio',
              rangeRequests: true,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
