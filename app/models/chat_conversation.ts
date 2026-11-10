import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import ChatMessage from '#models/chat_message'
import User from '#models/user'

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

  @belongsTo(() => User, { foreignKey: 'userLowId', localKey: 'suid' })
  declare lowUser: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'userHighId', localKey: 'suid' })
  declare highUser: BelongsTo<typeof User>
}