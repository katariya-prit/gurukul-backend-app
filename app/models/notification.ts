import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Notification extends BaseModel {
  public static table = 'notifications'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: string

  @column()
  declare title: string

  @column()
  declare message: string

  @column({ columnName: 'target_role' })
  declare targetRole: string | null

  @column({ columnName: 'related_id' })
  declare relatedId: number | null

  @column({ columnName: 'is_read' })
  declare isRead: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime
}