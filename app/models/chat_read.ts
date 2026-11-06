import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ChatRead extends BaseModel {
  static table = 'chat_reads'

  @column({ isPrimary: true, columnName: 'conversation_id' })
  declare conversationId: bigint | number

  @column({ isPrimary: true, columnName: 'user_id' })
  declare userId: bigint | number

  @column({ columnName: 'last_read_message_id' })
  declare lastReadMessageId: bigint | number | null

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime
}