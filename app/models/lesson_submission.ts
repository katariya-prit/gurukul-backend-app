import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import FunctionalityItem from '#models/functionality_item'
import Lesson from '#models/lesson'
import User from '#models/user'

export interface AiCriterion {
  key: string
  score: number
  comment: string
}

export interface AiResult {
  criteria: AiCriterion[]
  summary: string
  strengths: string[]
  improvements: string[]
  confidence: number
  flags: string[]
}

export interface RubricSnapshot {
  version: number
  maxPoints: number
  criteria: Array<{
    key: string
    label: string
    weight: number
    maxPoints: number
  }>
}

export default class LessonSubmission extends BaseModel {
  static table = 'lesson_submissions'

  @column({ isPrimary: true, columnName: 'submission_id' })
  declare submissionId: number

  @column({ columnName: 'lesson_id' })
  declare lessonId: number

  @column({ columnName: 'student_id' })
  declare studentId: number | bigint

  @column({ columnName: 'item_id' })
  declare itemId: number | null

  @column({ columnName: 'media_url' })
  declare mediaUrl: string

  @column({ columnName: 'media_public_id' })
  declare mediaPublicId: string

  @column()
  declare source: 'upload' | 'recorded' | 'live'

  @column({ columnName: 'ai_status' })
  declare aiStatus: 'pending' | 'processing' | 'done' | 'failed' | 'skipped'

  @column({ columnName: 'ai_percent' })
  declare aiPercent: number | null

  @column({ columnName: 'ai_points' })
  declare aiPoints: number | null

  @column({ columnName: 'ai_result' })
  declare aiResult: AiResult | null

  @column({
    columnName: 'rubric_snapshot',
    prepare: (value: RubricSnapshot | null) => JSON.stringify(value ?? null),
    consume: (value: unknown) => {
      if (typeof value === 'string') {
        return JSON.parse(value) as RubricSnapshot
      }

      return value as RubricSnapshot | null
    },
  })
  declare rubricSnapshot: RubricSnapshot | null

  @column({
    columnName: 'criteria_scores',
    prepare: (value: Record<string, number> | null) => JSON.stringify(value ?? {}),
    consume: (value: unknown) => {
      if (typeof value === 'string') {
        return JSON.parse(value) as Record<string, number>
      }

      return (value ?? {}) as Record<string, number>
    },
  })
  declare criteriaScores: Record<string, number> | null

  @column({ columnName: 'ai_error' })
  declare aiError: string | null

  @column({ columnName: 'skip_reason' })
  declare skipReason: string | null

  @column({ columnName: 'needs_review' })
  declare needsReview: boolean

  @column({ columnName: 'teacher_points' })
  declare teacherPoints: number | null

  @column({ columnName: 'teacher_feedback' })
  declare teacherFeedback: string | null

  @column({ columnName: 'final_points' })
  declare finalPoints: number | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Lesson, { foreignKey: 'lessonId' })
  declare lesson: BelongsTo<typeof Lesson>

  @belongsTo(() => FunctionalityItem, { foreignKey: 'itemId' })
  declare item: BelongsTo<typeof FunctionalityItem>

  @belongsTo(() => User, { foreignKey: 'studentId', localKey: 'suid' })
  declare student: BelongsTo<typeof User>
}
