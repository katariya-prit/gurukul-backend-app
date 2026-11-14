import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'chat_message_reactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('scope', 10).notNullable()
      table.bigInteger('message_id').notNullable()
      table
        .bigInteger('user_id')
        .notNullable()
        .references('suid')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('emoji', 32).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['scope', 'message_id', 'user_id'])
      table.index(['scope', 'message_id'])
      table.check("scope IN ('dm', 'group')", [], 'chat_message_reactions_scope_check')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
