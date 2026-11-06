import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { routeNotificationRules } from '../app/notifications/route_notifications.js'

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

void app.ready(() => {
  for (const routes of Object.values(router.toJSON())) {
    for (const route of routes) {
      for (const method of route.methods) {
        if (!MUTATING_METHODS.has(method)) continue
        if (
          route.pattern.startsWith('/notifications') ||
          route.pattern.startsWith('/__transmit') ||
          route.pattern === '/users/login' ||
          route.pattern === '/users/logout'
        ) {
          continue
        }

        const key = `${method} ${route.pattern}`
        if (!routeNotificationRules[key]) {
          console.warn(`No explicit route notification rule registered for ${key}`)
        }
      }
    }
  }
})
