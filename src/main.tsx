import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Capacitor } from '@capacitor/core'
import { registerSW } from 'virtual:pwa-register'
import { warmAudioCache } from './hooks/useSpeech'
import { ensureLegacyProfile } from './state/bootstrap'
import { startCloud } from './cloud/authStore'

// Inside the iPhone/Android app everything ships in the app bundle, so the
// web-only offline service worker isn't used there.
const isWeb = !Capacitor.isNativePlatform()

// Reload onto a new version as soon as it's downloaded, instead of leaving
// the device on an old cached copy until a second reload.
if (isWeb) registerSW({ immediate: true })

// Devices that used the app before child profiles keep their progress.
ensureLegacyProfile()

// Accounts + sync (only in builds configured with a Supabase project).
startCloud()

// Once the service worker is in control, save every question recording for offline use.
if (isWeb && 'serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => window.setTimeout(() => void warmAudioCache(), 3000))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
