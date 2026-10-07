import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Department from './department.js'

export default class Section extends BaseModel {
    public static table = 'sections'

    @column({ isPrimary: true, columnName: 'section_id' })
    declare sectionId: number

    @column()
    declare name: string

    @column({ columnName: 'department_id' })
    declare departmentId: number

    @column({ columnName: 'section_head_id' })
    declare sectionHeadId: number | null

    @column()
    declare description: string | null

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    @belongsTo(() => Department, {
        foreignKey: 'departmentId',
    })
    declare department: BelongsTo<typeof Department>
}