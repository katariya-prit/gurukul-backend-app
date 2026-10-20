import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Department from '#models/department'
import User from '#models/user'

export default class Lesson extends BaseModel {
    public static table = 'lessons'

    @column({ isPrimary: true, columnName: 'lesson_id' })
    declare lessonId: number

    @column({ columnName: 'lesson_title' })
    declare lessonTitle: string

    @column({ columnName: 'lesson_type' })
    declare lessonType: string

    @column({ columnName: 'media_url' })
    declare mediaUrl: string | null

    @column({ columnName: 'media_public_id' })
    declare mediaPublicId: string | null

    @column({ columnName: 'thumbnail_url' })
    declare thumbnailUrl: string | null

    @column({ columnName: 'thumbnail_public_id' })
    declare thumbnailPublicId: string | null

    @column()
    declare description: string | null

    @column({ columnName: 'department_id' })
    declare departmentId: number | null

    @column.date({ columnName: 'date_start' })
    declare dateStart: DateTime

    @column.date({ columnName: 'date_end' })
    declare dateEnd: DateTime

    @column({ columnName: 'progress_points' })
    declare progressPoints: number

    @column({ columnName: 'created_by' })
    declare createdBy: number | null

    @column({ columnName: 'role_code' })
    declare roleCode: string | null

    @column({ columnName: 'assign_scope' })
    declare assignScope: string

    @column({ columnName: 'assign_department_id' })
    declare assignDepartmentId: number | null

    @column({ columnName: 'assign_section_id' })
    declare assignSectionId: number | null

    @column({ columnName: 'assign_student_id' })
    declare assignStudentId: number | null

    @column({ columnName: 'assign_group_id' })
    declare assignGroupId: number | null

    @column({ columnName: 'assign_head_only' })
    declare assignHeadOnly: boolean

    @column.dateTime({ autoCreate: true, columnName: 'created_at' })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
    declare updatedAt: DateTime

    @belongsTo(() => Department, { foreignKey: 'departmentId' })
    declare department: BelongsTo<typeof Department>

    @belongsTo(() => User, { foreignKey: 'createdBy' })
    declare creator: BelongsTo<typeof User>
}