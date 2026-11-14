import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'functionality_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('functionality_id')
        .notNullable()
        .references('id')
        .inTable('functionalities')
        .onDelete('CASCADE')
      table
        .integer('department_id')
        .notNullable()
        .references('department_id')
        .inTable('departments')
        .onDelete('CASCADE')
      table.string('name', 150).notNullable()
      table.string('icon', 50).nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['department_id', 'functionality_id', 'name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
