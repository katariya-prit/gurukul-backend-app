import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import transmit from '@adonisjs/transmit/services/main'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import User from '#models/user'
import ChatConversation from '#models/chat_conversation'
import ChatMessage from '#models/chat_message'
import UserBlock from '#models/user_block'
import {
  sendMessageValidator,
  markReadValidator,
  typingValidator,
} from '#validators/chat'

function serializeMsg(m: any) {
  const createdAtIso = m.created_at
    ? typeof m.created_at === 'string'
      ? m.created_at
      : new Date(m.created_at).toISOString()
    : m.createdAt && typeof m.createdAt.toISO === 'function'
      ? m.createdAt.toISO()
      : new Date().toISOString()

  if (m.deleted_at || m.deletedAt) {
    return {
      id: String(m.id),
      conversation_id: String(m.conversation_id || m.conversationId),
      sender_id: String(m.sender_id || m.senderId),
      body: '',
      client_id: String(m.client_id || m.clientId || ''),
      deleted: true,
      created_at: createdAtIso,
    }
  }

  return {
    id: String(m.id),
    conversation_id: String(m.conversation_id || m.conversationId),
    sender_id: String(m.sender_id || m.senderId),
    body: String(m.body || ''),
    client_id: String(m.client_id || m.clientId || ''),
    deleted: false,
    created_at: createdAtIso,
  }
}

export default class ChatMessagesController {
  /**
   * GET /chat/conversations
   */
  async conversations({ auth, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const mySuid = String(me.suid)

    const result = await db.rawQuery(
      `SELECT 
          c.id,
          c.user_low_id,
          c.user_high_id,
          c.last_message_id,
          c.last_message_at,
          c.last_message_preview,
          c.created_at,
          CASE 
            WHEN c.user_low_id = ?::bigint THEN c.user_high_id 
            ELSE c.user_low_id 
          END AS other_user_id,
          u.name AS other_user_name,
          u.avatar AS other_user_avatar,
          u.role_code AS other_user_role_code,
          contact.nickname AS other_user_nickname,
          COALESCE(
            (SELECT COUNT(*) 
             FROM chat_messages cm 
             WHERE cm.conversation_id = c.id 
               AND cm.sender_id != ?::bigint 
               AND cm.deleted_at IS NULL
               AND (my_read.last_read_message_id IS NULL OR cm.id > my_read.last_read_message_id)
            ), 0
          )::int AS unread_count,
          other_read.last_read_message_id AS other_last_read_message_id
       FROM chat_conversations c
       JOIN users u ON u.suid = (
         CASE WHEN c.user_low_id = ?::bigint THEN c.user_high_id ELSE c.user_low_id END
       )
       LEFT JOIN user_contacts contact 
         ON contact.owner_id = ?::bigint AND contact.contact_id = u.suid
       LEFT JOIN chat_reads my_read 
         ON my_read.conversation_id = c.id AND my_read.user_id = ?::bigint
       LEFT JOIN chat_reads other_read 
         ON other_read.conversation_id = c.id AND other_read.user_id = u.suid
       WHERE (c.user_low_id = ?::bigint OR c.user_high_id = ?::bigint)
         AND c.last_message_id IS NOT NULL
       ORDER BY c.last_message_at DESC NULLS LAST`,
      [mySuid, mySuid, mySuid, mySuid, mySuid, mySuid, mySuid]
    )

    return response.ok({
      success: true,
      data: (result.rows || []).map((row: any) => ({
        id: String(row.id),
        other_user: {
          suid: String(row.other_user_id),
          name: row.other_user_name,
          avatar: row.other_user_avatar,
          role_code: row.other_user_role_code,
          nickname: row.other_user_nickname,
        },
        last_message_preview: row.last_message_preview,
        last_message_at: row.last_message_at ? new Date(row.last_message_at).toISOString() : null,
        unread_count: Number(row.unread_count || 0),
        other_last_read_message_id: row.other_last_read_message_id ? String(row.other_last_read_message_id) : null,
      })),
    })
  }

  /**
   * GET /chat/conversations/:id/messages?before=<id>&limit=30
   */
  async messages({ auth, params, request, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const mySuid = String(me.suid)
    const convId = params.id

    const conversation = await ChatConversation.find(convId)
    if (!conversation) {
      return response.notFound({ success: false, message: 'Conversation not found.' })
    }

    if (String(conversation.userLowId) !== mySuid && String(conversation.userHighId) !== mySuid) {
      return response.notFound({ success: false, message: 'Conversation not found.' })
    }

    const before = request.input('before')
    const limit = Math.min(Number(request.input('limit', 30)) || 30, 100)

    const query = ChatMessage.query()
      .where('conversation_id', convId)
      .orderBy('id', 'desc')
      .limit(limit)

    if (before && /^\d+$/.test(String(before))) {
      query.where('id', '<', String(before))
    }

    const list = await query
    return response.ok({
      success: true,
      data: list.map(serializeMsg),
    })
  }

  /**
   * GET /chat/peer/:peerId/messages
   * Returns all messages for the direct conversation between current user and peerId
   */
  async peerMessages({ auth, params, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const mySuid = String(me.suid)
    const peerSuid = String(params.peerId || '').trim()

    if (!peerSuid) {
      return response.badRequest({ success: false, message: 'Peer SUID is required.' })
    }

    try {
      const meBig = BigInt(mySuid)
      const peerBig = BigInt(peerSuid)
      const lowId = meBig < peerBig ? mySuid : peerSuid
      const highId = meBig < peerBig ? peerSuid : mySuid

      const conv = await ChatConversation.query()
        .where('user_low_id', lowId)
        .where('user_high_id', highId)
        .first()

      if (!conv) {
        return response.ok({ success: true, data: [] })
      }

      const list = await db.rawQuery(
        `SELECT m.id, m.conversation_id, m.sender_id, m.body, m.client_id, m.created_at, m.deleted_at,
                u.name AS sender_name, u.avatar AS sender_avatar
         FROM chat_messages m
         JOIN users u ON u.suid = m.sender_id
         WHERE m.conversation_id = ?
           AND m.deleted_at IS NULL
         ORDER BY m.id ASC`,
        [conv.id]
      )

      console.log(`[CHAT 200] Loaded ${list.rows.length} messages for peer ${peerSuid} (conv: ${conv.id})`)
      return response.ok({
        success: true,
        data: list.rows.map((row: any) => ({
          id: String(row.id),
          conversation_id: String(row.conversation_id),
          sender_id: String(row.sender_id),
          sender_name: row.sender_name || `User #${row.sender_id}`,
          sender_avatar: row.sender_avatar || null,
          body: row.body,
          client_id: row.client_id,
          deleted: false,
          created_at: new Date(row.created_at).toISOString(),
        })),
      })
    } catch (err) {
      console.error(`[CHAT ERROR] peerMessages failed for ${peerSuid}:`, err)
      return response.ok({ success: true, data: [] })
    }
  }

  /**
   * POST /chat/messages
   */
  async store({ auth, request, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const mySuid = String(me.suid)

    // Students are restricted to group chat only, no 1-to-1 direct messaging
    if (me.roleCode === 'STUDENT') {
      return response.forbidden({
        success: false,
        message: 'Students are only permitted to chat inside assigned groups.',
      })
    }

    const payload = await request.validateUsing(sendMessageValidator)

    if (payload.to_user_id === mySuid) {
      return response.badRequest({ success: false, message: 'You cannot message yourself.' })
    }

    const recipient = await User.query()
      .where('suid', payload.to_user_id)
      .where('status', 'APPROVED')
      .first()

    if (!recipient) {
      console.warn(`[CHAT 404] Recipient not found for SUID ${payload.to_user_id}`)
      return response.notFound({ success: false, message: 'Recipient not found.' })
    }

    // Check blocking in both directions safely
    let isBlocked = false
    try {
      const block = await UserBlock.query()
        .where((q) => {
          q.where('blocker_id', mySuid as any).where('blocked_id', payload.to_user_id as any)
        })
        .orWhere((q) => {
          q.where('blocker_id', payload.to_user_id as any).where('blocked_id', mySuid as any)
        })
        .first()
      isBlocked = !!block
    } catch (blockErr) {
      console.warn('[CHAT] UserBlock check skipped (table may be pending migration):', blockErr)
    }

    if (isBlocked) {
      return response.forbidden({ success: false, message: 'Message could not be delivered.' })
    }

    // Ensure client_id is a valid UUID for PostgreSQL uuid column
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const effectiveClientId =
      payload.client_id && uuidRegex.test(payload.client_id)
        ? payload.client_id
        : randomUUID()

    // Determine low and high suid
    const meBig = BigInt(mySuid)
    const toBig = BigInt(payload.to_user_id)
    const lowId = meBig < toBig ? mySuid : payload.to_user_id
    const highId = meBig < toBig ? payload.to_user_id : mySuid

    // Check idempotency with client_id
    const existingMsg = await ChatMessage.query()
      .where('sender_id', mySuid)
      .where('client_id', effectiveClientId)
      .first()

    if (existingMsg) {
      return response.ok({ success: true, data: serializeMsg(existingMsg) })
    }

    // Find or create conversation
    let conv = await ChatConversation.query()
      .where('user_low_id', lowId)
      .where('user_high_id', highId)
      .first()

    if (!conv) {
      conv = await ChatConversation.create({
        userLowId: lowId as any,
        userHighId: highId as any,
      })
    }

    const preview = payload.body.length > 120 ? payload.body.slice(0, 117) + '...' : payload.body
    const now = DateTime.now()

    // Create message and update conversation
    const msg = await ChatMessage.create({
      conversationId: conv.id,
      senderId: mySuid as any,
      body: payload.body,
      clientId: effectiveClientId,
    })

    conv.lastMessageId = msg.id
    conv.lastMessageAt = now
    conv.lastMessagePreview = preview
    await conv.save()

    const serialized = serializeMsg(msg)

    let notifId = Number(msg.id)
    try {
      const [inserted] = await db
        .table('notifications')
        .insert({
          user_id: payload.to_user_id,
          actor_id: mySuid,
          type: 'chat',
          title: `New message from ${me.name}`,
          message: preview,
          link: `/dashboard/community?peerId=${mySuid}`,
          is_read: false,
          created_at: now.toSQL(),
        })
        .returning('id')
      if (inserted && inserted.id) {
        notifId = Number(inserted.id)
      }
    } catch (dbErr) {
      console.error('[CHAT ERROR] Error persisting chat notification to database:', dbErr)
    }

    // Broadcast in real-time via Transmit to both participants and notification stream
    try {
      await Promise.all([
        transmit.broadcast(`chat/${mySuid}`, {
          event: 'message.created',
          conversation_id: String(conv.id),
          peer_suid: payload.to_user_id,
          message: serialized,
        }),
        transmit.broadcast(`chat/${payload.to_user_id}`, {
          event: 'message.created',
          conversation_id: String(conv.id),
          peer_suid: mySuid,
          message: serialized,
          from_user: {
            suid: mySuid,
            name: me.name,
            avatar: me.avatar,
          },
        }),
        transmit.broadcast(`notifications/${payload.to_user_id}`, {
          id: notifId,
          type: 'chat',
          title: `New message from ${me.name}`,
          message: preview,
          link: `/dashboard/community?peerId=${mySuid}`,
          is_read: false,
          created_at: now.toISO(),
          data: {
            peer_id: mySuid,
            conversation_id: String(conv.id),
          },
        }),
      ])
      console.log(`[CHAT SUCCESS] Message id ${msg.id} sent: "${preview}" from ${me.name} (${mySuid}) -> ${recipient.name} (${payload.to_user_id})`)
      console.log(`[CHAT BROADCAST] Emitted to chat/${mySuid}, chat/${payload.to_user_id}, and notifications/${payload.to_user_id}`)
    } catch (err) {
      console.error('[CHAT ERROR] Transmit broadcast error for chat message:', err)
    }

    return response.ok({ success: true, data: serialized })
  }

  /**
   * POST /chat/conversations/:id/read
   */
  async read({ auth, params, request, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const mySuid = String(me.suid)
    const convId = params.id
    const payload = await request.validateUsing(markReadValidator)

    const conv = await ChatConversation.find(convId)
    if (!conv) {
      return response.notFound({ success: false, message: 'Conversation not found.' })
    }

    if (String(conv.userLowId) !== mySuid && String(conv.userHighId) !== mySuid) {
      return response.notFound({ success: false, message: 'Conversation not found.' })
    }

    const otherSuid = String(conv.userLowId) === mySuid ? String(conv.userHighId) : String(conv.userLowId)

    // Upsert into chat_reads
    await db.rawQuery(
      `INSERT INTO chat_reads (conversation_id, user_id, last_read_message_id, updated_at)
       VALUES (?, ?, ?, NOW())
       ON CONFLICT (conversation_id, user_id) 
       DO UPDATE SET 
         last_read_message_id = GREATEST(chat_reads.last_read_message_id, EXCLUDED.last_read_message_id),
         updated_at = NOW()`,
      [convId, mySuid, payload.up_to_message_id]
    )

    try {
      await transmit.broadcast(`chat/${otherSuid}`, {
        event: 'conversation.read',
        conversation_id: String(convId),
        reader_id: mySuid,
        up_to_message_id: payload.up_to_message_id,
      })
    } catch (err) {
      console.error('Broadcast conversation.read error:', err)
    }

    return response.ok({ success: true })
  }

  /**
   * DELETE /chat/messages/:id
   */
  async destroy({ auth, params, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const mySuid = String(me.suid)

    const msg = await ChatMessage.find(params.id)
    if (!msg || String(msg.senderId) !== mySuid) {
      return response.notFound({ success: false, message: 'Message not found.' })
    }

    msg.deletedAt = DateTime.now()
    await msg.save()

    const conv = await ChatConversation.find(msg.conversationId)
    if (conv) {
      const otherSuid = String(conv.userLowId) === mySuid ? String(conv.userHighId) : String(conv.userLowId)
      try {
        await Promise.all([
          transmit.broadcast(`chat/${mySuid}`, {
            event: 'message.deleted',
            message_id: String(msg.id),
            conversation_id: String(conv.id),
          }),
          transmit.broadcast(`chat/${otherSuid}`, {
            event: 'message.deleted',
            message_id: String(msg.id),
            conversation_id: String(conv.id),
          }),
        ])
      } catch (err) {
        console.error('Broadcast message.deleted error:', err)
      }
    }

    return response.ok({ success: true, message: 'Message deleted.' })
  }

  /**
   * POST /chat/typing
   */
  async typing({ auth, request, response }: HttpContext) {
    const me = auth.getUserOrFail()
    const payload = await request.validateUsing(typingValidator)

    try {
      await transmit.broadcast(`chat/${payload.to_user_id}`, {
        event: 'typing',
        from_user_id: String(me.suid),
        from_name: me.name,
      })
    } catch (err) {
      console.error('Broadcast typing error:', err)
    }

    return response.ok({ success: true })
  }
}
