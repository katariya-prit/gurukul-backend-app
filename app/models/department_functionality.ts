import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Department from '#models/department'
import Functionality from '#models/functionality'

export default class DepartmentFunctionality extends BaseModel {
  public static table = 'department_functionalities'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'department_id' })
  declare departmentId: number

  @column({ columnName: 'functionality_id' })
  declare functionalityId: number

  @column({ columnName: 'item_label' })
  declare itemLabel: string

  @column({ columnName: 'is_enabled' })
  declare isEnabled: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Department, { foreignKey: 'departmentId' })
  declare department: BelongsTo<typeof Department>

  @belongsTo(() => Functionality, { foreignKey: 'functionalityId' })
  declare functionality: BelongsTo<typeof Functionality>
}
