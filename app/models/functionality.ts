import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import DepartmentFunctionality from '#models/department_functionality'
import DashboardWidget from '#models/dashboard_widget'
import FunctionalityItem from '#models/functionality_item'

export default class Functionality extends BaseModel {
  public static table = 'functionalities'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column({ columnName: 'icon' })
  declare icon: string | null

  @column({ columnName: 'theme_color' })
  declare themeColor: string | null

  @column({ columnName: 'evaluator_type' })
  declare evaluatorType: 'ai' | 'teacher' | 'both'

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @hasMany(() => DepartmentFunctionality, {
    foreignKey: 'functionalityId',
    localKey: 'id',
  })
  declare departmentAssignments: HasMany<typeof DepartmentFunctionality>

  @hasMany(() => FunctionalityItem, {
    foreignKey: 'functionalityId',
    localKey: 'id',
  })
  declare items: HasMany<typeof FunctionalityItem>

  @hasMany(() => DashboardWidget, {
    foreignKey: 'functionalityId',
    localKey: 'id',
  })
  declare widgets: HasMany<typeof DashboardWidget>
}
