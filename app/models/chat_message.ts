import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ChatConversation from '#models/chat_conversation'
import User from '#models/user'

export default class ChatMessage extends BaseModel {
  static table = 'chat_messages'

  @column({ isPrimary: true })
  declare id: bigint | number

  @column({ columnName: 'conversation_id' })
  declare conversationId: bigint | number

  @column({ columnName: 'sender_id' })
  declare senderId: bigint | number

  @column()
  declare body: string

  @column({ columnName: 'client_id' })
  declare clientId: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'deleted_at' })
  declare deletedAt: DateTime | null

  @belongsTo(() => ChatConversation, { foreignKey: 'conversationId' })
  declare conversation: BelongsTo<typeof ChatConversation>

  @belongsTo(() => User, { foreignKey: 'senderId', localKey: 'suid' })
  declare sender: BelongsTo<typeof User>
}