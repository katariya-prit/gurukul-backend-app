import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ChatMessageReaction extends BaseModel {
  static table = 'chat_message_reactions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare scope: 'dm' | 'group'

  @column({ columnName: 'message_id' })
  declare messageId: bigint | number

  @column({ columnName: 'user_id' })
  declare userId: bigint | number

  @column()
  declare emoji: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}
