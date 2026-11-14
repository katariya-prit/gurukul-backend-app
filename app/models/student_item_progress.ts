import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import FunctionalityItem from '#models/functionality_item'
import LessonSubmission from '#models/lesson_submission'
import User from '#models/user'

export default class StudentItemProgress extends BaseModel {
  public static table = 'student_item_progress'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'student_suid' })
  declare studentSuid: bigint

  @column({ columnName: 'item_id' })
  declare itemId: number

  @column({ columnName: 'submission_id' })
  declare submissionId: number | null

  @column()
  declare points: number

  @column({ columnName: 'level_no_at_time' })
  declare levelNoAtTime: number

  @column.dateTime({ autoCreate: true, columnName: 'recorded_at' })
  declare recordedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'studentSuid', localKey: 'suid' })
  declare student: BelongsTo<typeof User>

  @belongsTo(() => FunctionalityItem, { foreignKey: 'itemId' })
  declare item: BelongsTo<typeof FunctionalityItem>

  @belongsTo(() => LessonSubmission, { foreignKey: 'submissionId' })
  declare submission: BelongsTo<typeof LessonSubmission>
}
