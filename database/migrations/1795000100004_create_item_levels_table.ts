import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'item_levels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('item_id')
        .notNullable()
        .references('id')
        .inTable('functionality_items')
        .onDelete('CASCADE')
      table.integer('level_no').notNullable()
      table.string('name', 100).notNullable()
      table.integer('min_points').notNullable()
      table.string('promote_mode', 10).notNullable().defaultTo('auto')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['item_id', 'level_no'])
    })

    this.schema.raw(`
      ALTER TABLE item_levels
      ADD CONSTRAINT item_levels_promote_mode_check
      CHECK (promote_mode IN ('auto', 'manual'));
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
