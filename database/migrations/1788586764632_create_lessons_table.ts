import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lessons'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('lesson_id').primary()
      table.string('lesson_title', 255).notNullable()
      table.string('lesson_type', 20).notNullable()
      table.text('media_url').nullable()
      table.string('media_public_id', 255).nullable()
      table.text('description').nullable()
      table
        .integer('department_id')
        .nullable()
        .references('department_id')
        .inTable('departments')
        .onDelete('SET NULL')
      table.date('date_start').notNullable()
      table.date('date_end').notNullable()
      table.integer('progress_points').defaultTo(50)
      table
        .bigInteger('created_by')
        .nullable()
        .references('suid')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('role_code', 100).nullable()
      table.string('assign_scope', 20).notNullable().defaultTo('all')
      table
        .integer('assign_department_id')
        .nullable()
        .references('department_id')
        .inTable('departments')
        .onDelete('CASCADE')
      table
        .integer('assign_section_id')
        .nullable()
        .references('section_id')
        .inTable('sections')
        .onDelete('CASCADE')
      table
        .bigInteger('assign_student_id')
        .nullable()
        .references('suid')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('assign_group_id')
        .nullable()
        .references('group_id')
        .inTable('groups')
        .onDelete('CASCADE')
      table.boolean('assign_head_only').defaultTo(false)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })

    this.schema.raw(`
      ALTER TABLE lessons ADD CONSTRAINT lessons_lesson_type_check
        CHECK (lesson_type IN ('video','audio','image','document'));
      ALTER TABLE lessons ADD CONSTRAINT lessons_assign_scope_check
        CHECK (assign_scope IN ('all','department','section','student','group'));

      CREATE INDEX idx_lessons_created_by ON lessons(created_by);
      CREATE INDEX idx_lessons_assign_scope ON lessons(assign_scope);
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}