import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const fedSentryBrandPlugin = () => ({
  name: 'fedsentry-brand-normalizer',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!id.includes('/src/') || !/\.(ts|tsx|js|jsx)$/.test(id)) {
      return null
    }

    const branded = code
      .replaceAll('SentinelAI', 'FedSentry')
      .replaceAll('SentinalAI', 'FedSentry')
      .replaceAll('SentinelX', 'FedSentry')
      .replaceAll('sentinelAI', 'FedSentry')

    return branded === code ? null : { code: branded, map: null }
  },
})

export default defineConfig({
  plugins: [fedSentryBrandPlugin(), react()],
})
