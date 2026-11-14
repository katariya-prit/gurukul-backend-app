import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lesson_submissions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('item_id')
        .nullable()
        .references('id')
        .inTable('functionality_items')
        .onDelete('SET NULL')
      table.jsonb('rubric_snapshot').nullable()
      table.jsonb('criteria_scores').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('item_id')
      table.dropColumn('rubric_snapshot')
      table.dropColumn('criteria_scores')
    })
  }
}
