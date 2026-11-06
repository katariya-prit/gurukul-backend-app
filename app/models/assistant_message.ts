import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import AssistantThread from '#models/assistant_thread'

export default class AssistantMessage extends BaseModel {
  static table = 'assistant_messages'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'thread_id' })
  declare threadId: string

  @column()
  declare role: 'user' | 'assistant'

  @column()
  declare content: string

  @column()
  declare status: 'complete' | 'streaming' | 'error' | 'stopped'

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @belongsTo(() => AssistantThread, { foreignKey: 'threadId' })
  declare thread: BelongsTo<typeof AssistantThread>
}