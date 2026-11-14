import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Department from '#models/department'
import Functionality from '#models/functionality'
import ItemLevel from '#models/item_level'
import ItemPermission from '#models/item_permission'
import ItemRubric from '#models/item_rubric'
import StudentItem from '#models/student_item'
import StudentItemProgress from '#models/student_item_progress'

export default class FunctionalityItem extends BaseModel {
  public static table = 'functionality_items'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'functionality_id' })
  declare functionalityId: number

  @column({ columnName: 'department_id' })
  declare departmentId: number

  @column()
  declare name: string

  @column({ columnName: 'icon' })
  declare icon: string | null

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Functionality, { foreignKey: 'functionalityId' })
  declare functionality: BelongsTo<typeof Functionality>

  @belongsTo(() => Department, { foreignKey: 'departmentId' })
  declare department: BelongsTo<typeof Department>

  @hasMany(() => ItemRubric, {
    foreignKey: 'itemId',
    localKey: 'id',
  })
  declare rubrics: HasMany<typeof ItemRubric>

  @hasMany(() => ItemLevel, {
    foreignKey: 'itemId',
    localKey: 'id',
  })
  declare levels: HasMany<typeof ItemLevel>

  @hasMany(() => ItemPermission, {
    foreignKey: 'itemId',
    localKey: 'id',
  })
  declare permissions: HasMany<typeof ItemPermission>

  @hasMany(() => StudentItem, {
    foreignKey: 'itemId',
    localKey: 'id',
  })
  declare studentItems: HasMany<typeof StudentItem>

  @hasMany(() => StudentItemProgress, {
    foreignKey: 'itemId',
    localKey: 'id',
  })
  declare progressRecords: HasMany<typeof StudentItemProgress>
}
