import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'department_functionalities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('department_id')
        .notNullable()
        .references('department_id')
        .inTable('departments')
        .onDelete('CASCADE')
      table
        .integer('functionality_id')
        .notNullable()
        .references('id')
        .inTable('functionalities')
        .onDelete('CASCADE')
      table.string('item_label', 50).notNullable().defaultTo('Item')
      table.boolean('is_enabled').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['department_id', 'functionality_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
