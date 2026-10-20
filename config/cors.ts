import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

const corsConfig = defineConfig({
  enabled: true,

  // Local ane production banne origins allow karva mate
  origin: [
    'http://localhost:5173',
    'https://gurukul-flame.vercel.app',
    env.get('FRONTEND_URL', ''), // Environment variable thi override karvu hoy to pan chale
  ].filter(Boolean), // Empty values remove karva mate

  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],

  headers: true,

  exposeHeaders: [],

  credentials: true,

  maxAge: 90,
})

export default corsConfig