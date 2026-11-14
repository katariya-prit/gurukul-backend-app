import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_item_progress'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .bigInteger('student_suid')
        .notNullable()
        .references('suid')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('item_id')
        .notNullable()
        .references('id')
        .inTable('functionality_items')
        .onDelete('CASCADE')
      table
        .integer('submission_id')
        .nullable()
        .references('submission_id')
        .inTable('lesson_submissions')
        .onDelete('SET NULL')
      table.decimal('points', 10, 2).notNullable()
      table.integer('level_no_at_time').notNullable()
      table.timestamp('recorded_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.raw(`
      CREATE INDEX idx_student_item_progress_lookup
      ON student_item_progress (student_suid, item_id, recorded_at);
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
