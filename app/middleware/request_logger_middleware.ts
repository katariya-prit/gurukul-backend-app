import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Temporary debug middleware - badha requests terminal ma print kare chhe
 * ane Authorization header aavyo ke nahi e batave chhe.
 * Kaam purun thay pachi kernel.ts mathi aa middleware hatavi do.
 */
export default class RequestLoggerMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    console.log(`➡️  ${request.method()} ${request.url()}`)
    console.log('   Authorization:', request.header('authorization') ? 'present' : 'MISSING')
    return next()
  }
}