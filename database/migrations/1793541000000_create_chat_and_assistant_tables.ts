import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('user_contacts', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('owner_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.bigInteger('contact_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.string('nickname', 60).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['owner_id', 'contact_id'])
      table.index(['owner_id'])
    })

    this.schema.createTable('chat_conversations', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('user_low_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.bigInteger('user_high_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.bigInteger('last_message_id').nullable()
      table.timestamp('last_message_at', { useTz: true }).nullable()
      table.string('last_message_preview', 120).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.unique(['user_low_id', 'user_high_id'])
      table.index(['user_low_id'])
      table.index(['user_high_id'])
      table.index(['last_message_at'])
      table.check('user_low_id < user_high_id', [], 'chat_conversations_user_order_check')
    })

    this.schema.createTable('chat_messages', (table) => {
      table.bigIncrements('id').primary()
      table.bigInteger('conversation_id').notNullable().references('id').inTable('chat_conversations').onDelete('CASCADE')
      table.bigInteger('sender_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.text('body').notNullable()
      table.uuid('client_id').notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.unique(['sender_id', 'client_id'])
      table.index(['conversation_id', 'id'])
    })

    this.schema.createTable('chat_reads', (table) => {
      table.bigInteger('conversation_id').notNullable().references('id').inTable('chat_conversations').onDelete('CASCADE')
      table.bigInteger('user_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.bigInteger('last_read_message_id').nullable().references('id').inTable('chat_messages').onDelete('SET NULL')
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.primary(['conversation_id', 'user_id'])
      table.unique(['conversation_id', 'user_id'])
      table.index(['conversation_id'])
      table.index(['user_id'])
    })

    this.schema.createTable('assistant_threads', (table) => {
      table.uuid('id').primary()
      table.bigInteger('user_id').notNullable().references('suid').inTable('users').onDelete('CASCADE')
      table.string('title', 120).notNullable().defaultTo('New chat')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['user_id'])
    })

    this.schema.createTable('assistant_messages', (table) => {
      table.uuid('id').primary()
      table.uuid('thread_id').notNullable().references('id').inTable('assistant_threads').onDelete('CASCADE')
      table.string('role', 20).notNullable()
      table.text('content').notNullable()
      table.string('status', 20).notNullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.index(['thread_id'])
      table.check("role IN ('user', 'assistant')", [], 'assistant_messages_role_check')
      table.check("status IN ('complete', 'streaming', 'error', 'stopped')", [], 'assistant_messages_status_check')
    })
  }

  async down() {
    this.schema.dropTable('assistant_messages')
    this.schema.dropTable('assistant_threads')
    this.schema.dropTable('chat_reads')
    this.schema.dropTable('chat_messages')
    this.schema.dropTable('chat_conversations')
    this.schema.dropTable('user_contacts')
  }
}