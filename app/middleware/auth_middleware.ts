import type { Authenticators } from '@adonisjs/auth/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    console.log(`➡️ ${ctx.request.method()} ${ctx.request.url()}`)
    console.log('   Authorization:', ctx.request.header('authorization') ? 'present' : 'MISSING')

    await ctx.auth.authenticateUsing(options.guards ?? ['api'])
    return next()
  }
}