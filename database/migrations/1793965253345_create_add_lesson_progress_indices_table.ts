import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(
      'CREATE INDEX IF NOT EXISTS idx_lesson_submissions_student_lesson ON lesson_submissions (student_id, lesson_id)'
    )
    this.schema.raw(
      'CREATE INDEX IF NOT EXISTS idx_lesson_submissions_created_at ON lesson_submissions (created_at)'
    )
    this.schema.raw(
      'CREATE INDEX IF NOT EXISTS idx_lessons_date_start ON lessons (date_start)'
    )
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS idx_lesson_submissions_student_lesson')
    this.schema.raw('DROP INDEX IF EXISTS idx_lesson_submissions_created_at')
    this.schema.raw('DROP INDEX IF EXISTS idx_lessons_date_start')
  }
}