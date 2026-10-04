import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { warmAudioCache } from './hooks/useSpeech'
import { ensureLegacyProfile } from './state/bootstrap'

// Reload onto a new version as soon as it's downloaded, instead of leaving
// the device on an old cached copy until a second reload.
registerSW({ immediate: true })

// Devices that used the app before child profiles keep their progress.
ensureLegacyProfile()

// Once the service worker is in control, save every question recording for offline use.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => window.setTimeout(() => void warmAudioCache(), 3000))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
