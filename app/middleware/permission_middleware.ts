import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Role from '#models/role'

type PermissionAction = 'view' | 'create' | 'edit' | 'delete'

export default class PermissionMiddleware {
  async handle(
    { auth, response }: HttpContext,
    next: NextFn,
    options: { module: string; action: PermissionAction }
  ) {
    const user = auth.getUserOrFail()

    if (user.roleCode !== 'SUPER_ADMIN') {
      const role = await Role.find(user.roleCode)
      const permissions = role?.permissions as
        Record<string, Partial<Record<PermissionAction, boolean>>> | undefined

      if (!permissions?.[options.module]?.[options.action]) {
        return response.forbidden({
          success: false,
          message: `Missing permission: ${options.module}.${options.action}`,
        })
      }
    }

    return next()
  }
}
