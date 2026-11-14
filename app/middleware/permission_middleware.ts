import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Role from '#models/role'

type PermissionAction = 'view' | 'create' | 'edit' | 'delete'

interface PermissionCheck {
  module: string
  action: PermissionAction
}

export default class PermissionMiddleware {
  async handle(
    { auth, response }: HttpContext,
    next: NextFn,
    options: PermissionCheck & { anyOf?: PermissionCheck[] }
  ) {
    const user = auth.getUserOrFail()

    if (user.roleCode === 'SUPER_ADMIN') {
      return next()
    }

    if (options.module === 'Dashboard' && options.action === 'view' && user.roleCode === 'STUDENT') {
      return next()
    }

    const role = await Role.find(user.roleCode)
    const permissions = role?.permissions as
      | Record<string, Partial<Record<PermissionAction, boolean>>>
      | undefined

    const checks: PermissionCheck[] = [{ module: options.module, action: options.action }]
    if (options.anyOf && options.anyOf.length > 0) {
      checks.push(...options.anyOf)
    }

    const hasPermission = checks.some(
      (check) => permissions?.[check.module]?.[check.action] === true
    )

    if (!hasPermission) {
      return response.forbidden({
        success: false,
        message: `Missing permission: ${options.module}.${options.action}`,
      })
    }

    return next()
  }
}
