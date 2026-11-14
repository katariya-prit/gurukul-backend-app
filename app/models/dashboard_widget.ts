import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Functionality from '#models/functionality'
import FunctionalityItem from '#models/functionality_item'

export type DashboardWidgetType =
  | 'levelBadge'
  | 'progressRing'
  | 'recentMarks'
  | 'growthChart'
  | 'itemStats'

export type WidgetConfig = Record<string, unknown>

export default class DashboardWidget extends BaseModel {
  public static table = 'dashboard_widgets'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'functionality_id' })
  declare functionalityId: number

  @column({ columnName: 'item_id' })
  declare itemId: number | null

  @column({ columnName: 'widget_type' })
  declare widgetType: DashboardWidgetType

  @column()
  declare title: string

  @column({
    prepare: (value: WidgetConfig | null) => JSON.stringify(value ?? {}),
    consume: (value: unknown) => {
      if (typeof value === 'string') {
        return JSON.parse(value) as WidgetConfig
      }

      return (value ?? {}) as WidgetConfig
    },
  })
  declare config: WidgetConfig

  @column({
    prepare: (value: string[] | null) => JSON.stringify(value ?? []),
    consume: (value: unknown) => {
      if (typeof value === 'string') {
        return JSON.parse(value) as string[]
      }

      return (value ?? []) as string[]
    },
  })
  declare roles: string[]

  @column({ columnName: 'sort_order' })
  declare sortOrder: number

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Functionality, { foreignKey: 'functionalityId' })
  declare functionality: BelongsTo<typeof Functionality>

  @belongsTo(() => FunctionalityItem, { foreignKey: 'itemId' })
  declare item: BelongsTo<typeof FunctionalityItem>
}
