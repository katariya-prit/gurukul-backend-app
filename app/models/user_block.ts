import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class UserBlock extends BaseModel {
  static table = 'user_blocks'

  @column({ isPrimary: true })
  declare id: bigint | number

  @column({ columnName: 'blocker_id' })
  declare blockerId: bigint | number

  @column({ columnName: 'blocked_id' })
  declare blockedId: bigint | number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'blockerId', localKey: 'suid' })
  declare blocker: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'blockedId', localKey: 'suid' })
  declare blocked: BelongsTo<typeof User>
}
