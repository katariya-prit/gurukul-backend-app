import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lessons'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('functionality_id')
        .nullable()
        .references('id')
        .inTable('functionalities')
        .onDelete('SET NULL')
      table
        .integer('item_id')
        .nullable()
        .references('id')
        .inTable('functionality_items')
        .onDelete('SET NULL')
      table.integer('rubric_version').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('functionality_id')
      table.dropColumn('item_id')
      table.dropColumn('rubric_version')
    })
  }
}
