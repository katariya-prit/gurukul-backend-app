import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'item_rubrics'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('item_id')
        .notNullable()
        .references('id')
        .inTable('functionality_items')
        .onDelete('CASCADE')
      table.integer('version').notNullable()
      table.jsonb('criteria').notNullable().defaultTo('[]')
      table.integer('max_points').notNullable()
      table.boolean('is_current').notNullable().defaultTo(false)
      table
        .bigInteger('created_by')
        .nullable()
        .references('suid')
        .inTable('users')
        .onDelete('SET NULL')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['item_id', 'version'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
