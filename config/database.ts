import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION'),

  connections: {
    pg: {
      client: 'pg',

      connection: env.get('DATABASE_URL')
        ? {
          connectionString: env.get('DATABASE_URL'),
          ssl: { rejectUnauthorized: false },
        }
        : {
          host: env.get('DB_HOST'),
          port: env.get('DB_PORT'),
          user: env.get('DB_USER'),
          password: env.get('DB_PASSWORD'),
          database: env.get('DB_DATABASE'),
        },

      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
        tableName: 'adonis_schema',
      },

      debug: app.inDev,
    },
  },
})

export default dbConfig