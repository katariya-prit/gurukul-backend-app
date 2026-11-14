import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import FunctionalityItem from '#models/functionality_item'
import Role from '#models/role'
import Section from '#models/section'
import User from '#models/user'

export default class ItemPermission extends BaseModel {
  public static table = 'item_permissions'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'item_id' })
  declare itemId: number

  @column({ columnName: 'role_code' })
  declare roleCode: string | null

  @column({ columnName: 'section_id' })
  declare sectionId: number | null

  @column({ columnName: 'user_suid' })
  declare userSuid: bigint | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => FunctionalityItem, { foreignKey: 'itemId' })
  declare item: BelongsTo<typeof FunctionalityItem>

  @belongsTo(() => Role, { foreignKey: 'roleCode', localKey: 'roleCode' })
  declare role: BelongsTo<typeof Role>

  @belongsTo(() => Section, { foreignKey: 'sectionId' })
  declare section: BelongsTo<typeof Section>

  @belongsTo(() => User, { foreignKey: 'userSuid', localKey: 'suid' })
  declare user: BelongsTo<typeof User>
}
