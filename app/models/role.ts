import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

type RolePermissions = Record<
  string,
  { view: boolean; create: boolean; edit: boolean; delete: boolean }
>

export default class Role extends BaseModel {
  static table = 'roles'

  @column({ isPrimary: true })
  declare roleCode: string

  @column()
  declare roleName: string

  @column()
  declare description: string | null

  @column()
  declare permissions: RolePermissions

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}