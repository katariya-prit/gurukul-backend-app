import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'dashboard_widgets'

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
        .integer('item_id')
        .nullable()
        .references('id')
        .inTable('functionality_items')
        .onDelete('CASCADE')
      table.string('widget_type', 50).notNullable()
      table.string('title', 150).notNullable()
      table.jsonb('config').notNullable().defaultTo('{}')
      table.jsonb('roles').notNullable().defaultTo('[]')
      table.integer('sort_order').notNullable().defaultTo(0)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    this.schema.raw(`
      ALTER TABLE dashboard_widgets
      ADD CONSTRAINT dashboard_widgets_widget_type_check
      CHECK (widget_type IN ('levelBadge', 'progressRing', 'recentMarks', 'growthChart', 'itemStats'));
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
