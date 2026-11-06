import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'

function serializeNotification(notification: Notification) {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    link: notification.link,
    is_read: notification.isRead,
    created_at: notification.createdAt.toISO(),
    entity_type: notification.entityType,
    entity_id: notification.entityId,
    route_key: notification.routeKey,
  }
}

export default class NotificationsController {
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const userId = String(user.suid)
    const [notifications, unreadResult] = await Promise.all([
      Notification.query().where('user_id', userId).orderBy('created_at', 'desc').limit(100),
      Notification.query()
        .where('user_id', userId)
        .where('is_read', false)
        .count('* as total')
        .first(),
    ])

    return response.ok({
      success: true,
      data: notifications.map(serializeNotification),
      unread_count: Number(unreadResult?.$extras.total ?? 0),
    })
  }

  async markRead({ params, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const notification = await Notification.query()
      .where('id', params.id)
      .where('user_id', String(user.suid))
      .first()

    if (!notification) {
      return response.notFound({ success: false, message: 'Notification not found' })
    }

    notification.isRead = true
    await notification.save()
    return response.ok({ success: true })
  }

  async markAllRead({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await Notification.query()
      .where('user_id', String(user.suid))
      .where('is_read', false)
      .update({ isRead: true })

    return response.ok({ success: true })
  }
}
