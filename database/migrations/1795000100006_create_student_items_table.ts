import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_items'

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
      table.integer('current_level_no').notNullable().defaultTo(1)
      table.decimal('total_points', 10, 2).notNullable().defaultTo(0)
      table
        .bigInteger('assigned_by')
        .nullable()
        .references('suid')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('started_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['student_suid', 'item_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
