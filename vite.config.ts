import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const demoMode = env.VITE_DEMO_MODE !== 'false'
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'robots-meta',
        transformIndexHtml(html) {
          // Modo de demonstração nunca deve ser indexado.
          const robots = demoMode ? 'noindex, nofollow' : 'index, follow'
          return html.replace('%ROBOTS%', robots)
        },
      },
    ],
    test: { environment: 'node' },
  }
})
