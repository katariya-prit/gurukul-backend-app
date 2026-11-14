import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

const corsConfig = defineConfig({
  enabled: true,

  origin: (origin: string) => {
    if (!origin) return true

    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin === 'http://localhost' ||
      origin === 'http://127.0.0.1' ||
      origin === 'https://gurukul-flame.vercel.app'
    ) {
      return true
    }

    const frontendUrl = env.get('FRONTEND_URL')
    if (frontendUrl && origin === frontendUrl) {
      return true
    }

    const corsOriginsEnv = env.get('CORS_ORIGINS') || env.get('CORS_ORIGIN')
    if (corsOriginsEnv) {
      const allowed = corsOriginsEnv.split(',').map((o) => o.trim())
      if (allowed.includes(origin)) {
        return true
      }
    }

    return false
  },

  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  headers: true,

  exposeHeaders: [],

  credentials: true,

  maxAge: 90,
})

export default corsConfig
