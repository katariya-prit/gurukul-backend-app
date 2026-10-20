import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OverviewImage extends BaseModel {
  public static table = 'overview_images'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare section: 'heroSlider' | 'featureImage' | 'smartInfrastructure'

  @column()
  declare url: string

  @column()
  declare publicId: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}