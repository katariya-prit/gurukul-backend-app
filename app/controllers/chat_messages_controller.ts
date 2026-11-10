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

let groupMessagesTableReady = false
async function ensureGroupMessagesTable() {
  if (groupMessagesTableReady) return
  try {
    await db.rawQuery(`
      CREATE TABLE IF NOT EXISTS group_messages (
        id BIGSERIAL PRIMARY KEY,
        group_id INTEGER NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
        sender_id BIGINT NOT NULL REFERENCES users(suid) ON DELETE CASCADE,
        body TEXT NOT NULL,
        client_id VARCHAR(120),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS group_messages_group_id_id_idx ON group_messages (group_id, id);
      CREATE INDEX IF NOT EXISTS group_messages_sender_id_idx ON group_messages (sender_id);
    `)
    groupMessagesTableReady = true
  } catch (err) {
    console.warn('[CHAT] ensureGroupMessagesTable notice:', err)
  }
}

export default class ChatMessagesController {
  /**
   * GET /chat/conversations
   */
  async conversations({ auth, response }: HttpContext) {
    try {
      const me = auth.getUserOrFail()
      const mySuid = String(me.suid)
      const mySuidNum = Number(mySuid)

      let rows: any[] = []
      try {
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
                WHEN c.user_low_id = :mySuid::bigint THEN c.user_high_id 
                ELSE c.user_low_id 
              END AS other_user_id,
              u.name AS other_user_name,
              u.avatar AS other_user_avatar,
              u.role_code AS other_user_role_code,
              COALESCE(
                (SELECT COUNT(*) 
                 FROM chat_messages cm 
                 WHERE cm.conversation_id = c.id 
                   AND cm.sender_id != :mySuid::bigint 
                   AND cm.deleted_at IS NULL
                ), 0
              )::int AS unread_count
           FROM chat_conversations c
           JOIN users u ON u.suid = (
             CASE WHEN c.user_low_id = :mySuid::bigint THEN c.user_high_id ELSE c.user_low_id END
           )
           WHERE (c.user_low_id = :mySuid::bigint OR c.user_high_id = :mySuid::bigint)
             AND c.last_message_id IS NOT NULL
           ORDER BY c.last_message_at DESC NULLS LAST`,
          { mySuid: mySuidNum }
        )
        rows = result.rows || []
      } catch (dbErr) {
        console.warn('[CHAT] Raw query in conversations failed, attempting Lucid fallback:', dbErr)
        try {
          const convList = await ChatConversation.query()
            .where('user_low_id', mySuid as any)
            .orWhere('user_high_id', mySuid as any)
            .whereNotNull('last_message_id')
            .preload('lowUser')
            .preload('highUser')
            .orderBy('last_message_at', 'desc')

          rows = convList.map((c) => {
            const isLow = String(c.userLowId) === mySuid
            const otherUser = isLow ? c.highUser : c.lowUser
            return {
              id: c.id,
              other_user_id: otherUser?.suid,
              other_user_name: otherUser?.name,
              other_user_avatar: otherUser?.avatar,
              other_user_role_code: otherUser?.roleCode,
              last_message_preview: c.lastMessagePreview,
              last_message_at: c.lastMessageAt ? (c.lastMessageAt as any).toISO?.() || String(c.lastMessageAt) : null,
              unread_count: 0,
            }
          })
        } catch (fallbackErr) {
          console.warn('[CHAT] Lucid fallback in conversations failed:', fallbackErr)
          rows = []
        }
      }

      return response.ok({
        success: true,
        data: rows.map((row: any) => ({
          id: String(row.id),
          other_user: {
            suid: String(row.other_user_id),
            name: row.other_user_name || `User #${row.other_user_id}`,
            avatar: row.other_user_avatar || null,
            role_code: row.other_user_role_code || 'User',
            nickname: null,
          },
          last_message_preview: row.last_message_preview,
          last_message_at: row.last_message_at ? new Date(row.last_message_at).toISOString() : null,
          unread_count: Number(row.unread_count || 0),
          other_last_read_message_id: null,
        })),
      })
    } catch (err: any) {
      console.error('[CHAT ERROR] conversations endpoint error:', err)
      return response.ok({ success: true, data: [] })
    }
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
    try {
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
      try {
        const existingMsg = await ChatMessage.query()
          .where('sender_id', mySuid)
          .where('client_id', effectiveClientId)
          .first()

        if (existingMsg) {
          return response.ok({ success: true, data: serializeMsg(existingMsg) })
        }
      } catch (e) {
        console.warn('[CHAT] Idempotency check error:', e)
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
            created_at: now.toISO(),
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
    } catch (err: any) {
      console.error('[CHAT ERROR] store failed:', err)
      return response.badRequest({
        success: false,
        message: err.message || 'Failed to send message',
      })
    }
  }

  /**
   * GET /chat/:convKey/messages
   */
  async convMessages({ auth, params, response }: HttpContext) {
    try {
      const me = auth.getUserOrFail()
      const mySuid = String(me.suid)
      const convKey = String(params.convKey || '').trim()

      if (convKey.startsWith('dm_')) {
        const parts = convKey.replace(/^dm_/, '').split('__')
        const peerSuid = parts.find((p) => p !== mySuid) || parts[0]
        if (peerSuid) {
          return this.peerMessages({ auth, params: { peerId: peerSuid }, response } as any)
        }
      }

      if (convKey.startsWith('group_')) {
        await ensureGroupMessagesTable()
        const groupId = Number(convKey.replace(/^group_/, ''))
        if (!groupId || isNaN(groupId)) {
          return response.ok({ success: true, data: [] })
        }

        const rows = await db.rawQuery(
          `SELECT gm.id, gm.group_id, gm.sender_id, gm.body, gm.client_id, gm.created_at,
                  u.name AS sender_name, u.avatar AS sender_avatar
           FROM group_messages gm
           JOIN users u ON u.suid = gm.sender_id
           WHERE gm.group_id = :groupId
             AND gm.deleted_at IS NULL
           ORDER BY gm.id ASC`,
          { groupId }
        )

        return response.ok({
          success: true,
          data: (rows.rows || []).map((row: any) => ({
            id: String(row.id),
            group_id: row.group_id,
            conversation_id: convKey,
            sender_id: String(row.sender_id),
            sender_suid: String(row.sender_id),
            sender_name: row.sender_name || `User #${row.sender_id}`,
            sender_avatar: row.sender_avatar || null,
            body: row.body,
            text: row.body,
            client_id: row.client_id || '',
            created_at: new Date(row.created_at).toISOString(),
            time: new Date(row.created_at).toISOString(),
            deleted: false,
          })),
        })
      }

      return response.ok({ success: true, data: [] })
    } catch (err) {
      console.warn('[CHAT] convMessages error:', err)
      return response.ok({ success: true, data: [] })
    }
  }

  /**
   * POST /chat/:convKey/messages
   */
  async convPostMessage({ auth, params, request, response }: HttpContext) {
    try {
      const me = auth.getUserOrFail()
      const mySuid = String(me.suid)
      const convKey = String(params.convKey || '').trim()

      if (convKey.startsWith('dm_')) {
        const parts = convKey.replace(/^dm_/, '').split('__')
        const peerSuid = parts.find((p) => p !== mySuid) || parts[0]
        if (peerSuid) {
          const body = request.input('text') || request.input('body')
          const clientId = request.input('client_id')
          request.updateBody({ to_user_id: peerSuid, body, client_id: clientId })
          return this.store({ auth, request, response } as any)
        }
      }

      if (convKey.startsWith('group_')) {
        await ensureGroupMessagesTable()
        const groupId = Number(convKey.replace(/^group_/, ''))
        if (!groupId || isNaN(groupId)) {
          return response.badRequest({ success: false, message: 'Invalid group ID.' })
        }

        const groupRes = await db.rawQuery(
          `SELECT group_id, group_name, member_ids, created_by FROM groups WHERE group_id = :groupId LIMIT 1`,
          { groupId }
        )
        const group = groupRes.rows[0]
        if (!group) {
          return response.notFound({ success: false, message: 'Group not found.' })
        }

        const memberIds: number[] = Array.isArray(group.member_ids) ? group.member_ids.map(Number) : []
        const isMember = memberIds.includes(Number(mySuid)) || me.roleCode === 'SUPER_ADMIN'
        if (!isMember) {
          return response.forbidden({ success: false, message: 'You are not a member of this group.' })
        }

        const body = String(request.input('text') || request.input('body') || '').trim()
        if (!body) {
          return response.badRequest({ success: false, message: 'Message body cannot be empty.' })
        }
        const clientId = String(request.input('client_id') || '').trim() || null

        const insertRes = await db.rawQuery(
          `INSERT INTO group_messages (group_id, sender_id, body, client_id, created_at)
           VALUES (:groupId, :senderId, :body, :clientId, NOW())
           RETURNING id, group_id, sender_id, body, client_iad, created_at`,
          {
            groupId,
            senderId: mySuid,
            body,
            clientId,
          }
        )
        const row = insertRes.rows[0]
        const serializedGroupMsg = {
          id: String(row.id),
          group_id: groupId,
          conversation_id: convKey,
          sender_id: String(row.sender_id),
          sender_suid: String(row.sender_id),
          sender_name: me.name,
          sender_avatar: me.avatar || null,
          body: row.body,
          text: row.body,
          client_id: row.client_id || clientId || '',
          created_at: new Date(row.created_at).toISOString(),
          time: new Date(row.created_at).toISOString(),
          deleted: false,
        }

        const preview = body.length > 120 ? body.slice(0, 117) + '...' : body
        const broadcastTargets = Array.from(new Set([...memberIds, Number(mySuid)]))

        for (const targetId of broadcastTargets) {
          const targetSuid = String(targetId)
          try {
            await transmit.broadcast(`chat/${targetSuid}`, {
              event: 'group.message.created',
              group_id: groupId,
              group_name: group.group_name,
              message: serializedGroupMsg,
              from_user: {
                suid: mySuid,
                name: me.name,
                avatar: me.avatar,
              },
            })
            if (targetSuid !== mySuid) {
              await transmit.broadcast(`notifications/${targetSuid}`, {
                type: 'group_chat',
                title: `${group.group_name}: ${me.name}`,
                message: preview,
                link: `/dashboard/community?groupId=${groupId}`,
                is_read: false,
                created_at: serializedGroupMsg.created_at,
                data: {
                  group_id: groupId,
                },
              })
              await db.table('notifications').insert({
                user_id: targetSuid,
                actor_id: mySuid,
                type: 'group_chat',
                title: `${group.group_name}: ${me.name}`,
                message: preview,
                link: `/dashboard/community?groupId=${groupId}`,
                is_read: false,
                created_at: serializedGroupMsg.created_at,
              })
            }
          } catch (bErr) {
            console.warn(`[CHAT] Broadcast to group member ${targetSuid} failed:`, bErr)
          }
        }

        return response.ok({ success: true, data: serializedGroupMsg })
      }

      return response.ok({ success: true })
    } catch (err) {
      console.warn('[CHAT] convPostMessage error:', err)
      return response.badRequest({ success: false, message: 'Failed to send message.' })
    }
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
