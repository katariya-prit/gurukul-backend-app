import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lesson_submissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('submission_id').primary()
      table
        .integer('lesson_id')
        .notNullable()
        .references('lesson_id')
        .inTable('lessons')
        .onDelete('CASCADE')
      table
        .bigInteger('student_id')
        .notNullable()
        .references('suid')
        .inTable('users')
        .onDelete('CASCADE')
      table.text('media_url').notNullable()
      table.string('media_public_id', 255).notNullable()
      table.string('source', 20).notNullable()
      table.string('ai_status', 20).notNullable().defaultTo('pending')
      table.double('ai_percent').nullable()
      table.double('ai_points').nullable()
      table.jsonb('ai_result').nullable()
      table.text('ai_error').nullable()
      table.text('skip_reason').nullable()
      table.boolean('needs_review').notNullable().defaultTo(false)
      table.double('teacher_points').nullable()
      table.text('teacher_feedback').nullable()
      table.double('final_points').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['lesson_id', 'student_id'])
    })

    this.schema.raw(`
      ALTER TABLE lesson_submissions ADD CONSTRAINT lesson_submissions_source_check
        CHECK (source IN ('upload', 'recorded', 'live'));
      ALTER TABLE lesson_submissions ADD CONSTRAINT lesson_submissions_ai_status_check
        CHECK (ai_status IN ('pending', 'processing', 'done', 'failed', 'skipped'));
      CREATE INDEX idx_lesson_submissions_student ON lesson_submissions(student_id, created_at DESC);
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
