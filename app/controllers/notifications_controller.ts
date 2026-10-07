import type { HttpContext } from '@adonisjs/core/http'
import Notification from '#models/notification'
import transmit from '@adonisjs/transmit/services/main'

export default class NotificationsController {
    async index({ auth, response }: HttpContext) {
        const user = auth.user!
        const notifications = await Notification.query()
            .where('target_role', user.roleCode)
            .where('is_read', false)
            .orderBy('created_at', 'desc')
            .limit(20)

        return response.ok({ success: true, data: notifications })
    }

    async markRead({ params, response }: HttpContext) {
        const notification = await Notification.find(params.id)
        if (!notification) {
            return response.notFound({ success: false, message: 'Notification not found' })
        }
        notification.isRead = true
        await notification.save()
        return response.ok({ success: true })
    }

    static async createAndBroadcast(data: {
        type: string
        title: string
        message: string
        targetRole: string
        relatedId?: number
    }) {
        const notification = await Notification.create({
            type: data.type,
            title: data.title,
            message: data.message,
            targetRole: data.targetRole,
            relatedId: data.relatedId ?? null,
            isRead: false,
        })

        transmit.broadcast(`notifications/${data.targetRole}`, {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            relatedId: notification.relatedId,
            time: notification.createdAt.toISO(),
        })

        return notification
    }
}