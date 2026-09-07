import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auth_access_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .bigInteger('tokenable_id')
        .unsigned()
        .notNullable()
        .references('suid')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type').notNullable()
      table.string('name').nullable()
      table.string('hash').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.timestamp('expires_at', { useTz: true }).nullable()
      table.index(['tokenable_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}