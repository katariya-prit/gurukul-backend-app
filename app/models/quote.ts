
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Quote extends BaseModel {
  static table = 'quotes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: 'activity' | 'event'

  @column({ columnName: 'image_url' })
  declare imageUrl: string

  @column({ columnName: 'public_id' })
  declare publicId: string | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column.date({ columnName: 'event_date' })
  declare eventDate: DateTime

  @column()
  declare name: string | null

  @column.date({ columnName: 'display_start_date' })
  declare displayStartDate: DateTime | null

  @column.date({ columnName: 'display_end_date' })
  declare displayEndDate: DateTime | null

  @column.date({ columnName: 'event_start_date' })
  declare eventStartDate: DateTime | null

  @column.date({ columnName: 'event_end_date' })
  declare eventEndDate: DateTime | null

  @column()
  declare isApproved: 'Approved' | 'Rejected' | 'Pending'

  @column()
  declare status: 'Active' | 'Inactive'

  @column({ columnName: 'add_to_hero' })
  declare addToHero: 'Yes' | 'No'

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime
}
