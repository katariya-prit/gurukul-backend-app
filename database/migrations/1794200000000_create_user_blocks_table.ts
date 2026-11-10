import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_blocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('blocker_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.bigInteger('blocked_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['blocker_id', 'blocked_id'])
      table.index(['blocker_id'])
      table.index(['blocked_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
