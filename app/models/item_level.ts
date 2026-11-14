import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import FunctionalityItem from '#models/functionality_item'

export default class ItemLevel extends BaseModel {
  public static table = 'item_levels'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'item_id' })
  declare itemId: number

  @column({ columnName: 'level_no' })
  declare levelNo: number

  @column()
  declare name: string

  @column({ columnName: 'min_points' })
  declare minPoints: number

  @column({ columnName: 'promote_mode' })
  declare promoteMode: 'auto' | 'manual'

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => FunctionalityItem, { foreignKey: 'itemId' })
  declare item: BelongsTo<typeof FunctionalityItem>
}
