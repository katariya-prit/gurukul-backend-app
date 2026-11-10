import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import UserContact from '#models/user_contact'
import UserBlock from '#models/user_block'
import {
  createContactValidator,
  updateContactValidator,
  blockUserValidator,
} from '#validators/chat'

export default class ChatContactsController {
  /**
   * GET /chat/users/lookup/:suid
   * Dial lookup: returns user profile only if approved.
   */
  async lookup({ params, response }: HttpContext) {
    const rawSuid = String(params.suid || '').trim()
    if (!rawSuid) {
      return response.notFound({ success: false, message: 'User not found' })
    }

    const query = User.query().where('status', 'APPROVED')
    if (/^\d+$/.test(rawSuid)) {
      query.where((q) => q.where('suid', rawSuid).orWhere('username', rawSuid))
    } else {
      query.where((q) => q.where('username', rawSuid).orWhereILike('name', `%${rawSuid}%`))
    }

    const user = await query.select('suid', 'name', 'avatar', 'roleCode').first()

    if (!user) {
      console.warn(`[CHAT LOOKUP 404] Query "${rawSuid}" did not match any approved user`)
      return response.notFound({ success: false, message: 'User not found' })
    }

    console.log(`[CHAT LOOKUP 200] Query "${rawSuid}" matched user "${user.name}" (suid: ${user.suid})`)

    return response.ok({
      success: true,
      data: {
        suid: String(user.suid),
        name: user.name,
        avatar: user.avatar,
        role_code: user.roleCode,
      },
    })
  }

  /**
   * GET /chat/contacts
   * Returns saved contacts for the current user.
   */
  async index({ auth, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const mySuid = String(me.suid)

    const contacts = await db.rawQuery(
      `SELECT 
          c.id,
          c.owner_id,
          c.contact_id,
          c.nickname,
          c.created_at,
          u.name AS contact_name,
          u.avatar AS contact_avatar,
          u.role_code AS contact_role_code,
          conv.id AS conversation_id,
          conv.last_message_preview,
          conv.last_message_at,
          COALESCE(
            (SELECT COUNT(*) 
             FROM chat_messages cm 
             WHERE cm.conversation_id = conv.id 
               AND cm.sender_id != ?::bigint 
               AND cm.deleted_at IS NULL
               AND (cr.last_read_message_id IS NULL OR cm.id > cr.last_read_message_id)
            ), 0
          )::int AS unread_count
       FROM user_contacts c
       JOIN users u ON u.suid = c.contact_id
       LEFT JOIN chat_conversations conv 
         ON (conv.user_low_id = LEAST(c.owner_id, c.contact_id) 
         AND conv.user_high_id = GREATEST(c.owner_id, c.contact_id))
       LEFT JOIN chat_reads cr 
         ON cr.conversation_id = conv.id AND cr.user_id = ?::bigint
       WHERE c.owner_id = ?::bigint
       ORDER BY c.created_at DESC`,
      [mySuid, mySuid, mySuid]
    )

    return response.ok({
      success: true,
      data: (contacts.rows || []).map((row: any) => ({
        id: String(row.id),
        contact_id: String(row.contact_id),
        nickname: row.nickname,
        name: row.contact_name,
        avatar: row.contact_avatar,
        role_code: row.contact_role_code,
        conversation_id: row.conversation_id ? String(row.conversation_id) : null,
        last_message_preview: row.last_message_preview,
        last_message_at: row.last_message_at ? new Date(row.last_message_at).toISOString() : null,
        unread_count: Number(row.unread_count || 0),
        created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      })),
    })
  }

  /**
   * POST /chat/contacts
   * Save a contact
   */
  async store({ auth, request, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const mySuid = String(me.suid)
    const payload = await request.validateUsing(createContactValidator)

    if (payload.user_id === mySuid) {
      return response.badRequest({ success: false, message: 'You cannot save yourself as a contact.' })
    }

    const targetUser = await User.query()
      .where('suid', payload.user_id)
      .where('status', 'APPROVED')
      .first()

    if (!targetUser) {
      return response.notFound({ success: false, message: 'User not found or not approved.' })
    }

    let contact = await UserContact.query()
      .where('owner_id', mySuid)
      .where('contact_id', payload.user_id)
      .first()

    if (contact) {
      if (payload.nickname !== undefined) {
        contact.nickname = payload.nickname || null
        await contact.save()
      }
    } else {
      contact = await UserContact.create({
        ownerId: mySuid as any,
        contactId: payload.user_id as any,
        nickname: payload.nickname || null,
      })
    }

    return response.ok({
      success: true,
      message: 'Contact saved successfully.',
      data: {
        id: String(contact.id),
        contact_id: String(contact.contactId),
        nickname: contact.nickname,
        name: targetUser.name,
        avatar: targetUser.avatar,
        role_code: targetUser.roleCode,
      },
    })
  }

  /**
   * PUT /chat/contacts/:contactId
   */
  async update({ auth, params, request, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const payload = await request.validateUsing(updateContactValidator)

    const contact = await UserContact.query()
      .where('id', params.contactId)
      .where('owner_id', String(me.suid))
      .first()

    if (!contact) {
      return response.notFound({ success: false, message: 'Contact not found.' })
    }

    contact.nickname = payload.nickname || null
    await contact.save()

    return response.ok({ success: true, message: 'Contact updated.', data: contact })
  }

  /**
   * DELETE /chat/contacts/:contactId
   */
  async destroy({ auth, params, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const contact = await UserContact.query()
      .where('id', params.contactId)
      .where('owner_id', String(me.suid))
      .first()

    if (!contact) {
      return response.notFound({ success: false, message: 'Contact not found.' })
    }

    await contact.delete()
    return response.ok({ success: true, message: 'Contact removed.' })
  }

  /**
   * GET /chat/blocks
   */
  async blocks({ auth, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const blocks = await UserBlock.query()
      .where('blocker_id', String(me.suid))
      .preload('blocked')

    return response.ok({
      success: true,
      data: blocks.map((b) => ({
        id: String(b.id),
        user_id: String(b.blockedId),
        name: b.blocked?.name ?? '',
        avatar: b.blocked?.avatar ?? null,
        created_at: b.createdAt ? b.createdAt.toISO() : null,
      })),
    })
  }

  /**
   * POST /chat/blocks
   */
  async block({ auth, request, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const payload = await request.validateUsing(blockUserValidator)

    if (payload.user_id === String(me.suid)) {
      return response.badRequest({ success: false, message: 'You cannot block yourself.' })
    }

    const existing = await UserBlock.query()
      .where('blocker_id', String(me.suid))
      .where('blocked_id', payload.user_id)
      .first()

    if (!existing) {
      await UserBlock.create({
        blockerId: String(me.suid) as any,
        blockedId: payload.user_id as any,
      })
    }

    return response.ok({ success: true, message: 'User blocked.' })
  }

  /**
   * DELETE /chat/blocks/:userId
   */
  async unblock({ auth, params, response }: HttpContext) {
    const me = auth.getUserOrFail()
    await UserBlock.query()
      .where('blocker_id', String(me.suid))
      .where('blocked_id', params.userId)
      .delete()

    return response.ok({ success: true, message: 'User unblocked.' })
  }
}
