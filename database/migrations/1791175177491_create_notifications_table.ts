import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('type', 50).notNullable()
      table.string('title', 255).notNullable()
      table.text('message').notNullable()
      table.string('target_role', 100).nullable()
      table.integer('related_id').nullable()
      table.boolean('is_read').notNullable().defaultTo(false)
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}