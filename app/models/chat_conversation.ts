import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ChatMessage from '#models/chat_message'

export default class ChatConversation extends BaseModel {
  static table = 'chat_conversations'

  @column({ isPrimary: true })
  declare id: bigint | number

  @column({ columnName: 'user_low_id' })
  declare userLowId: bigint | number

  @column({ columnName: 'user_high_id' })
  declare userHighId: bigint | number

  @column({ columnName: 'last_message_id' })
  declare lastMessageId: bigint | number | null

  @column.dateTime({ columnName: 'last_message_at' })
  declare lastMessageAt: DateTime | null

  @column({ columnName: 'last_message_preview' })
  declare lastMessagePreview: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @hasMany(() => ChatMessage, { foreignKey: 'conversationId' })
  declare messages: HasMany<typeof ChatMessage>
}