import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import AssistantMessage from '#models/assistant_message'

export default class AssistantThread extends BaseModel {
  static table = 'assistant_threads'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'user_id' })
  declare userId: bigint | number

  @column()
  declare title: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @hasMany(() => AssistantMessage, { foreignKey: 'threadId' })
  declare messages: HasMany<typeof AssistantMessage>
}