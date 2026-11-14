import db from '@adonisjs/lucid/services/db'
import ChatMessageReaction from '#models/chat_message_reaction'

export type ReactionScope = 'dm' | 'group'

export async function loadReactionMap(
  scope: ReactionScope,
  messageIds: (string | number)[]
): Promise<Map<string, Record<string, string>>> {
  const reactions = new Map<string, Record<string, string>>()
  if (messageIds.length === 0) return reactions

  const rows = await ChatMessageReaction.query()
    .where('scope', scope)
    .whereIn('message_id', messageIds)
    .select('message_id', 'user_id', 'emoji')

  for (const row of rows) {
    const messageId = String(row.messageId)
    const messageReactions = reactions.get(messageId) ?? {}
    messageReactions[String(row.userId)] = row.emoji
    reactions.set(messageId, messageReactions)
  }

  return reactions
}

export async function setReaction({
  scope,
  messageId,
  userSuid,
  emoji,
}: {
  scope: ReactionScope
  messageId: string | number
  userSuid: string
  emoji: string | null
}): Promise<Record<string, string>> {
  if (emoji === null || emoji === '') {
    await ChatMessageReaction.query()
      .where('scope', scope)
      .where('message_id', messageId)
      .where('user_id', userSuid)
      .delete()
  } else {
    await db
      .table('chat_message_reactions')
      .insert({
        scope,
        message_id: messageId,
        user_id: userSuid,
        emoji,
      })
      .onConflict(['scope', 'message_id', 'user_id'])
      .merge({
        emoji,
        updated_at: new Date().toISOString(),
      })
  }

  const reactionMap = await loadReactionMap(scope, [messageId])
  return reactionMap.get(String(messageId)) ?? {}
}
