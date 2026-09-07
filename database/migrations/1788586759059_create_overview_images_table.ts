import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'overview_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('section', 50).notNullable()
      table.text('url').notNullable()
      table.string('public_id', 255).notNullable()
      table.text('title').notNullable().defaultTo('')
      table.text('description').notNullable().defaultTo('')
      table.timestamp('created_at').defaultTo(this.now())
    })

    this.schema.raw(`
      ALTER TABLE overview_images
      ADD CONSTRAINT overview_images_section_check
      CHECK (section IN ('heroSlider', 'featureImage', 'smartInfrastructure'));

      CREATE INDEX idx_overview_images_section ON overview_images(section);
    `)
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}