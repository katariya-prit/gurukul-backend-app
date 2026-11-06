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

  @column({ columnName: 'user_id' })
  declare userId: bigint | number | null

  @column({ columnName: 'actor_id' })
  declare actorId: bigint | number | null

  @column({ columnName: 'route_key' })
  declare routeKey: string | null

  @column({ columnName: 'entity_type' })
  declare entityType: string | null

  @column({ columnName: 'entity_id' })
  declare entityId: string | null

  @column()
  declare link: string | null

  @column()
  declare meta: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime
}
