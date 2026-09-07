import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sections'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('section_id').primary()
      table.string('name', 255).notNullable()
      table
        .integer('department_id')
        .notNullable()
        .references('department_id')
        .inTable('departments')
        .onDelete('CASCADE')
      table
        .bigInteger('section_head_id')
        .nullable()
        .references('suid')
        .inTable('users')
        .onDelete('SET NULL')
      table.text('description').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}