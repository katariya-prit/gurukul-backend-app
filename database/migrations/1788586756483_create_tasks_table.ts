import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('task_id').primary()
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table
        .integer('assigned_to')
        .notNullable()
        .references('suid')
        .inTable('users')
        .onDelete('CASCADE')
      table.integer('assigned_by').nullable()
      table
        .integer('section_id')
        .nullable()
        .references('section_id')
        .inTable('sections')
        .onDelete('CASCADE')
      table
        .integer('department_id')
        .nullable()
        .references('department_id')
        .inTable('departments')
        .onDelete('CASCADE')
      table.string('status', 20).defaultTo('PENDING')
      table.date('due_date').nullable()
      table.timestamp('completed_at').nullable()
      table.timestamp('created_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}