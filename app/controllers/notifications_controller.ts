import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'

function serializeNotification(notification: Notification) {
  return {
    id: notification.id,
    title: notification.title || '',
    message: notification.message || '',
    type: notification.type || 'info',
    link: notification.link || null,
    is_read: Boolean(notification.isRead),
    created_at: notification.createdAt
      ? typeof (notification.createdAt as any).toISO === 'function'
        ? (notification.createdAt as any).toISO()
        : String(notification.createdAt)
      : new Date().toISOString(),
    entity_type: notification.entityType || null,
    entity_id: notification.entityId || null,
    route_key: notification.routeKey || null,
  }
}

export default class NotificationsController {
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const userId = String(user.suid)
      const roleCode = user.roleCode

      const [notifications, unreadResult] = await Promise.all([
        Notification.query()
          .where((q) => {
            q.where('user_id', userId)
            if (roleCode) {
              q.orWhere((rq) => {
                rq.whereNull('user_id').where('target_role', roleCode)
              })
            }
          })
          .orderBy('created_at', 'desc')
          .limit(100),
        Notification.query()
          .where((q) => {
            q.where('user_id', userId)
            if (roleCode) {
              q.orWhere((rq) => {
                rq.whereNull('user_id').where('target_role', roleCode)
              })
            }
          })
          .where('is_read', false)
          .count('* as total')
          .first(),
      ])

      return response.ok({
        success: true,
        data: (notifications || []).map(serializeNotification),
        unread_count: Number(unreadResult?.$extras.total ?? 0),
      })
    } catch (error: any) {
      console.error('notifications index error:', error)
      return response.ok({
        success: true,
        data: [],
        unread_count: 0,
      })
    }
  }

  async markRead({ params, auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const userId = String(user.suid)
      const roleCode = user.roleCode

      const notification = await Notification.query()
        .where('id', params.id)
        .where((q) => {
          q.where('user_id', userId)
          if (roleCode) {
            q.orWhere('target_role', roleCode)
          }
        })
        .first()

      if (!notification) {
        return response.notFound({ success: false, message: 'Notification not found' })
      }

      notification.isRead = true
      await notification.save()
      return response.ok({ success: true })
    } catch (error: any) {
      return response.badRequest({ success: false, message: error.message })
    }
  }

  async markAllRead({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const userId = String(user.suid)
      const roleCode = user.roleCode

      await Notification.query()
        .where((q) => {
          q.where('user_id', userId)
          if (roleCode) {
            q.orWhere('target_role', roleCode)
          }
        })
        .where('is_read', false)
        .update({ is_read: true })

      return response.ok({ success: true })
    } catch (error: any) {
      return response.badRequest({ success: false, message: error.message })
    }
  }
}
