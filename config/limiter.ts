import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const hasRedis = Boolean(env.get('REDIS_URL'))

export default defineConfig({
  default: hasRedis ? 'redis' : 'memory',
  stores: {
    memory: stores.memory({}),
    ...(hasRedis ? { redis: stores.redis({}) } : {}),
  },
})

