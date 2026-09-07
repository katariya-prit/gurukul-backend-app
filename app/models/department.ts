import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Department extends BaseModel {
  public static table = 'departments'

  @column({ isPrimary: true })
  declare departmentId: number

  @column()
  declare departmentName: string

  @column()
  declare departmentHeadId: number | null

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Department Head (User) relation - department_head_id -> users.suid
  @belongsTo(() => User, {
    foreignKey: 'departmentHeadId',
    localKey: 'suid',
  })
  declare departmentHead: BelongsTo<typeof User>

  // Users belonging to this department (users.department_id -> departments.department_id)
  @hasMany(() => User, {
    foreignKey: 'departmentId',
    localKey: 'departmentId',
  })
  declare users: HasMany<typeof User>
}