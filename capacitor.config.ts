import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'us.astrala.thinksprout',
  appName: 'ThinkSprout',
  webDir: 'dist',
  ios: {
    // Keeps the cream background behind the web view while it loads.
    backgroundColor: '#fffbf0',
    contentInset: 'always',
  },
}

export default config
