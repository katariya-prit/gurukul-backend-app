import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

const corsConfig = defineConfig({
  enabled: true,

  // Add FRONTEND_URL=http://localhost:5173 to your .env file
  origin: [env.get('FRONTEND_URL', 'http://localhost:5173')],

  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],

  headers: true,

  exposeHeaders: [],

  credentials: true,

  maxAge: 90,
})

export default corsConfig