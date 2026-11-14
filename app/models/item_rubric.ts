import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import FunctionalityItem from '#models/functionality_item'
import User from '#models/user'

export interface RubricCriterion {
  key: string
  label: string
  weight: number
  maxPoints: number
}

export default class ItemRubric extends BaseModel {
  public static table = 'item_rubrics'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'item_id' })
  declare itemId: number

  @column()
  declare version: number

  @column({
    prepare: (value: RubricCriterion[] | null) => JSON.stringify(value ?? []),
    consume: (value: unknown) => {
      if (typeof value === 'string') {
        return JSON.parse(value) as RubricCriterion[]
      }

      return (value ?? []) as RubricCriterion[]
    },
  })
  declare criteria: RubricCriterion[]

  @column({ columnName: 'max_points' })
  declare maxPoints: number

  @column({ columnName: 'is_current' })
  declare isCurrent: boolean

  @column({ columnName: 'created_by' })
  declare createdBy: bigint | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => FunctionalityItem, { foreignKey: 'itemId' })
  declare item: BelongsTo<typeof FunctionalityItem>

  @belongsTo(() => User, { foreignKey: 'createdBy', localKey: 'suid' })
  declare creator: BelongsTo<typeof User>
}
