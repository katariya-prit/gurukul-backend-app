import { defineConfig } from '@adonisjs/redis'
import { redisConnectionOptions } from '#services/redis_connection_service'

const redisConfig = defineConfig({
  connection: 'main',
  connections: {
    main: redisConnectionOptions(),
  },
})

export default redisConfig

