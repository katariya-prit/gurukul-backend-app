import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class UserContact extends BaseModel {
  static table = 'user_contacts'

  @column({ isPrimary: true })
  declare id: bigint | number

  @column({ columnName: 'owner_id' })
  declare ownerId: bigint | number

  @column({ columnName: 'contact_id' })
  declare contactId: bigint | number

  @column()
  declare nickname: string | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime
}