import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import transmit from '@adonisjs/transmit/services/main'
import { errors } from '@vinejs/vine'
import ChatConversation from '#models/chat_conversation'
import ChatMessage from '#models/chat_message'
import User from '#models/user'
import UserBlock from '#models/user_block'
import { ensureGroupMessagesTable } from '#controllers/chat_messages_controller'
import { loadReactionMap, setReaction } from '#services/chat_reaction_service'
import { reactionValidator } from '#validators/chat'

const reactionRateLimits = new Map<string, number[]>()
const reactionRateLimitCleanup = setInterval(() => {
  const expiredBefore = Date.now() - 10_000
  for (const [userSuid, timestamps] of reactionRateLimits) {
    const activeTimestamps = timestamps.filter((timestamp) => timestamp > expiredBefore)
    if (activeTimestamps.length === 0) reactionRateLimits.delete(userSuid)
    else reactionRateLimits.set(userSuid, activeTimestamps)
  }
}, 60_000)

reactionRateLimitCleanup.unref()

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default class ChatReactionsController {
  async set({ auth, request, response }: HttpContext) {
    const me = auth.getUserOrFail()

    try {
      const payload = await request.validateUsing(reactionValidator)
      const mySuid = String(me.suid)
      const scope = payload.conv_key.startsWith('dm_') ? 'dm' : 'group'
      let messageId: string
      let clientId: string | null
      let conversationId: string | undefined
      let groupId: number | undefined
      let recipients: string[]
      let dmPeerSuid: string | undefined

      if (scope === 'dm') {
        const participants = payload.conv_key.slice(3).split('__')
        if (
          participants.length !== 2 ||
          participants[0] === participants[1] ||
          !participants.includes(mySuid)
        ) {
          return response.forbidden({
            success: false,
            message: 'Not allowed to react to this chat.',
          })
        }
        if (me.roleCode === 'STUDENT') {
          return response.forbidden({
            success: false,
            message: 'Not allowed to react to this chat.',
          })
        }

        const peerSuid = participants.find((participant) => participant !== mySuid)
        if (!peerSuid) {
          return response.forbidden({
            success: false,
            message: 'Not allowed to react to this chat.',
          })
        }
        dmPeerSuid = peerSuid

        const blocked = await UserBlock.query()
          .where((query) => {
            query.where('blocker_id', mySuid).where('blocked_id', peerSuid)
          })
          .orWhere((query) => {
            query.where('blocker_id', peerSuid).where('blocked_id', mySuid)
          })
          .first()
        if (blocked) {
          return response.forbidden({
            success: false,
            message: 'Reaction could not be delivered.',
          })
        }

        const myId = BigInt(mySuid)
        const peerId = BigInt(peerSuid)
        const conversation = await ChatConversation.query()
          .where('user_low_id', myId < peerId ? myId.toString() : peerId.toString())
          .where('user_high_id', myId < peerId ? peerId.toString() : myId.toString())
          .first()
        if (!conversation) {
          return response.notFound({ success: false, message: 'Message not found.' })
        }
        conversationId = String(conversation.id)

        let message: ChatMessage | null = null
        if (payload.message_id) {
          message = await ChatMessage.query()
            .where('id', payload.message_id)
            .where('conversation_id', String(conversation.id))
            .whereNull('deleted_at')
            .first()
        } else if (payload.client_id && uuidRegex.test(payload.client_id)) {
          message = await ChatMessage.query()
            .where('client_id', payload.client_id)
            .where('conversation_id', String(conversation.id))
            .whereNull('deleted_at')
            .first()
        }
        if (!message) {
          return response.notFound({ success: false, message: 'Message not found.' })
        }

        messageId = String(message.id)
        clientId = message.clientId
        recipients = [mySuid, dmPeerSuid]
      } else {
        const rawGroupId = payload.conv_key.slice('group_'.length)
        const parsedGroupId = Number(rawGroupId)
        if (!Number.isSafeInteger(parsedGroupId) || parsedGroupId < 1) {
          return response.notFound({ success: false, message: 'Message not found.' })
        }
        groupId = parsedGroupId
        await ensureGroupMessagesTable()

        const groupResult = await db.rawQuery(
          'SELECT member_ids FROM groups WHERE group_id = :groupId LIMIT 1',
          { groupId }
        )
        const group = groupResult.rows[0] as { member_ids?: (string | number)[] } | undefined
        if (!group) {
          return response.notFound({ success: false, message: 'Message not found.' })
        }

        const memberSuids = Array.isArray(group.member_ids)
          ? group.member_ids.map((suid) => String(suid))
          : []
        if (!memberSuids.includes(mySuid) && me.roleCode !== 'SUPER_ADMIN') {
          return response.forbidden({
            success: false,
            message: 'Not allowed to react to this chat.',
          })
        }

        let message: { id: string | number; client_id: string | null } | undefined
        if (payload.message_id) {
          const result = await db.rawQuery(
            `SELECT id, client_id
             FROM group_messages
             WHERE id = :messageId AND group_id = :groupId AND deleted_at IS NULL
             LIMIT 1`,
            { messageId: payload.message_id, groupId }
          )
          message = result.rows[0]
        } else if (payload.client_id) {
          const result = await db.rawQuery(
            `SELECT id, client_id
             FROM group_messages
             WHERE client_id = :clientId AND group_id = :groupId AND deleted_at IS NULL
             LIMIT 1`,
            { clientId: payload.client_id, groupId }
          )
          message = result.rows[0]
        }
        if (!message) {
          return response.notFound({ success: false, message: 'Message not found.' })
        }

        messageId = String(message.id)
        clientId = message.client_id
        const adminUsers = await User.query().where('role_code', 'SUPER_ADMIN').select('suid')
        recipients = Array.from(
          new Set([...memberSuids, mySuid, ...adminUsers.map((user) => String(user.suid))])
        )
      }

      const emoji = payload.emoji || null
      const existingReactions = await loadReactionMap(scope, [messageId])
      const previousEmoji = existingReactions.get(messageId)?.[mySuid]
      const changed = emoji ? previousEmoji !== emoji : previousEmoji !== undefined
      if (changed) {
        const now = Date.now()
        const recentChanges = (reactionRateLimits.get(mySuid) ?? []).filter(
          (timestamp) => timestamp > now - 10_000
        )
        if (recentChanges.length >= 20) {
          return response.tooManyRequests({
            success: false,
            message: 'Too many reactions, slow down.',
          })
        }
        reactionRateLimits.set(mySuid, [...recentChanges, now])
      }

      const reactions = await setReaction({
        scope,
        messageId,
        userSuid: mySuid,
        emoji,
      })
      const eventBase = {
        event: 'message.reaction',
        conv_key: payload.conv_key,
        kind: scope,
        message_id: messageId,
        client_id: clientId,
        user_suid: mySuid,
        emoji,
        reactions,
        from_user: {
          suid: mySuid,
          name: me.name,
          avatar: me.avatar ?? null,
        },
      }

      let broadcasts: Promise<void>[]
      if (scope === 'dm') {
        const peerSuid = dmPeerSuid
        const currentConversationId = conversationId
        if (!peerSuid || !currentConversationId) {
          throw new Error('DM reaction context is incomplete')
        }
        broadcasts = recipients.map(async (recipientSuid) => {
          transmit.broadcast(`chat/${recipientSuid}`, {
            ...eventBase,
            peer_suid: recipientSuid === mySuid ? peerSuid : mySuid,
            conversation_id: currentConversationId,
          })
        })
      } else {
        const currentGroupId = groupId
        if (currentGroupId === undefined) throw new Error('Group reaction context is incomplete')
        broadcasts = recipients.map(async (recipientSuid) => {
          transmit.broadcast(`chat/${recipientSuid}`, {
            ...eventBase,
            group_id: currentGroupId,
          })
        })
      }
      const broadcastResults = await Promise.allSettled(broadcasts)
      for (const result of broadcastResults) {
        if (result.status === 'rejected') {
          logger.warn({ err: result.reason }, 'Chat reaction broadcast failed')
        }
      }

      return response.ok({
        success: true,
        data: {
          message_id: messageId,
          client_id: clientId,
          conv_key: payload.conv_key,
          reactions,
        },
      })
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.unprocessableEntity({
          success: false,
          message: error.messages.map((item: { message: string }) => item.message).join(' '),
        })
      }

      logger.warn({ err: error }, 'Could not save chat reaction')
      return response.internalServerError({
        success: false,
        message: 'Could not save reaction.',
      })
    }
  }
}
