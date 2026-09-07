import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'daily_darshan'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title', 255).notNullable()
      table.string('image_url', 500).notNullable()
      table.text('description').nullable()
      table.date('date').notNullable().defaultTo(this.now())
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })

    this.schema.raw(`CREATE INDEX idx_daily_darshan_date ON daily_darshan(date);`)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}