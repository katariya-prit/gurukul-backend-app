import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import {
  createDefaultRouteRule,
  routeNotificationRules,
  type RouteNotificationData,
} from '../notifications/route_notifications.js'
import { notify } from '../services/notification_service.js'

const SAFE_FIELDS = new Set([
  'name',
  'suid',
  'status',
  'roleCode',
  'role_code',
  'roleName',
  'role_name',
  'departmentId',
  'department_id',
  'departmentHeadId',
  'department_head_id',
  'departmentName',
  'department_name',
  'sectionId',
  'section_id',
  'sectionHeadId',
  'section_head_id',
  'groupId',
  'group_id',
  'groupName',
  'group_name',
  'memberIds',
  'member_ids',
  'lessonId',
  'lesson_id',
  'lessonTitle',
  'lesson_title',
  'id',
  'user_id',
  'userId',
  'title',
  'scope',
  'headOnly',
  'head_only',
  'departmentId',
  'department_id',
  'studentId',
  'student_id',
])

const warnedUnmappedRoutes = new Set<string>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeRecord(value: unknown, includeData = false): Record<string, unknown> {
  if (!isRecord(value)) return {}
  const result: Record<string, unknown> = {}

  for (const [key, fieldValue] of Object.entries(value)) {
    if (includeData && key === 'data') {
      result.data = sanitizeRecord(fieldValue)
      continue
    }

    if (key === 'assignment') {
      let assignment = fieldValue
      if (typeof fieldValue === 'string') {
        try {
          assignment = JSON.parse(fieldValue) as unknown
        } catch {
          continue
        }
      }
      result.assignment = sanitizeRecord(assignment)
      continue
    }

    if (!SAFE_FIELDS.has(key)) continue
    if ((key === 'member_ids' || key === 'memberIds') && Array.isArray(fieldValue)) {
      result[key] = fieldValue.filter(
        (member): member is string | number =>
          typeof member === 'string' || typeof member === 'number'
      )
      continue
    }

    if (
      typeof fieldValue === 'string' ||
      typeof fieldValue === 'number' ||
      typeof fieldValue === 'boolean' ||
      fieldValue === null
    ) {
      result[key] = fieldValue
    }
  }

  return result
}

function getActor(ctx: HttpContext): RouteNotificationData['actor'] {
  const user = ctx.auth.user
  return {
    id: user ? String(user.suid) : null,
    name: user?.name || 'A user',
    roleCode: user?.roleCode ?? null,
  }
}

export default class RouteNotificationsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const method = ctx.request.method().toUpperCase()
    const routePattern = ctx.route?.pattern
    if (!routePattern || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next()
    }

    const routeKey = `${method} ${routePattern}`
    if (
      routePattern.startsWith('/notifications') ||
      routePattern.startsWith('/__transmit') ||
      routePattern.startsWith('/chat') ||
      routePattern === '/users/login' ||
      routePattern === '/users/logout'
    ) {
      return next()
    }

    const registeredRule = routeNotificationRules[routeKey]
    let rule = registeredRule
    if (!rule) {
      if (!warnedUnmappedRoutes.has(routeKey)) {
        warnedUnmappedRoutes.add(routeKey)
        console.warn(`No explicit route notification rule registered for ${routeKey}`)
      }
      rule = createDefaultRouteRule(routeKey)
    }

    let snapshot: Record<string, unknown> | null = null
    if (rule.snapshot) {
      try {
        snapshot = await rule.snapshot(ctx)
      } catch (error: unknown) {
        console.error(`Unable to snapshot ${routeKey} for notifications.`, error)
      }
    }

    const actor = getActor(ctx)
    const params = Object.fromEntries(
      Object.entries(ctx.params).map(([key, value]) => [key, String(value)])
    )

    await next()

    if (ctx.response.response.statusCode < 200 || ctx.response.response.statusCode >= 300) {
      return
    }

    try {
      const data: RouteNotificationData = {
        method,
        routeKey,
        actor,
        params,
        body: sanitizeRecord(ctx.request.body()),
        result: sanitizeRecord(ctx.response.content?.[0], true),
        snapshot,
      }

      void notify(data, rule).catch((error: unknown) => {
        console.error(`Route notification processing failed for ${routeKey}.`, error)
      })
    } catch (error: unknown) {
      console.error(`Unable to capture notification data for ${routeKey}.`, error)
    }
  }
}
