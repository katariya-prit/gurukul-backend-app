import env from '#start/env'
import { defineConfig } from '@adonisjs/transmit'
import { redis } from '@adonisjs/transmit/transports/redis'
import { redisConnectionOptions } from '#services/redis_connection_service'

const redisUrl = env.get('REDIS_URL')

export default defineConfig({
  pingInterval: '30s',
  transport: redisUrl ? { driver: redis(redisConnectionOptions()) } : null,
})
