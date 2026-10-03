import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { warmAudioCache } from './hooks/useSpeech'

// Reload onto a new version as soon as it's downloaded, instead of leaving
// the device on an old cached copy until a second reload.
registerSW({ immediate: true })

// Once the service worker is in control, save every question recording for offline use.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => window.setTimeout(() => void warmAudioCache(), 3000))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
