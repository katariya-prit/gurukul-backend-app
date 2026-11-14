import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import FunctionalityItem from '#models/functionality_item'
import StudentItemProgress from '#models/student_item_progress'
import User from '#models/user'

export default class StudentItem extends BaseModel {
  public static table = 'student_items'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'student_suid' })
  declare studentSuid: bigint

  @column({ columnName: 'item_id' })
  declare itemId: number

  @column({ columnName: 'current_level_no' })
  declare currentLevelNo: number

  @column({ columnName: 'total_points' })
  declare totalPoints: number

  @column({ columnName: 'assigned_by' })
  declare assignedBy: bigint | null

  @column.dateTime({ columnName: 'started_at' })
  declare startedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'studentSuid', localKey: 'suid' })
  declare student: BelongsTo<typeof User>

  @belongsTo(() => FunctionalityItem, { foreignKey: 'itemId' })
  declare item: BelongsTo<typeof FunctionalityItem>

  @belongsTo(() => User, { foreignKey: 'assignedBy', localKey: 'suid' })
  declare assigner: BelongsTo<typeof User>

  @hasMany(() => StudentItemProgress, {
    foreignKey: 'itemId',
    localKey: 'itemId',
  })
  declare progressRecords: HasMany<typeof StudentItemProgress>
}
