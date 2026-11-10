import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'group_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table.integer('group_id').notNullable().references('group_id').inTable('groups').onDelete('CASCADE')
      table.bigInteger('sender_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.text('body').notNullable()
      table.string('client_id', 120).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.index(['group_id', 'id'])
      table.index(['sender_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
