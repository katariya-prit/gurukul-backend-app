import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.bigInteger('user_id').nullable().index()
      table.bigInteger('actor_id').nullable()
      table.string('route_key', 255).nullable()
      table.string('entity_type', 100).nullable()
      table.string('entity_id', 255).nullable()
      table.string('link', 2048).nullable()
      table.jsonb('meta').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('user_id')
      table.dropColumn('actor_id')
      table.dropColumn('route_key')
      table.dropColumn('entity_type')
      table.dropColumn('entity_id')
      table.dropColumn('link')
      table.dropColumn('meta')
    })
  }
}
