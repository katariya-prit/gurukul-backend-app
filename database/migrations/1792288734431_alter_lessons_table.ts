import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lessons'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('thumbnail_url').nullable()
      table.string('thumbnail_public_id').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('thumbnail_url')
      table.dropColumn('thumbnail_public_id')
    })
  }
}