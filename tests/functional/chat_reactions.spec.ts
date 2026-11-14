import { randomUUID } from 'node:crypto'
import { mock } from 'node:test'
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'
import transmit from '@adonisjs/transmit/services/main'
import ChatConversation from '#models/chat_conversation'
import ChatMessage from '#models/chat_message'
import ChatMessageReaction from '#models/chat_message_reaction'
import User from '#models/user'
import UserBlock from '#models/user_block'

type ReactionBroadcast = {
  channel: string
  payload: Record<string, unknown>
}

type DmFixture = {
  sender: User
  peer: User
  outsider: User
  message: ChatMessage
  convKey: string
  cleanup: () => Promise<void>
}

type GroupFixture = {
  member: User
  peer: User
  groupId: number
  messageId: string
  clientId: string
  cleanup: () => Promise<void>
}

async function captureBroadcasts<T>(
  run: (broadcasts: ReactionBroadcast[]) => Promise<T>
): Promise<T> {
  const broadcasts: ReactionBroadcast[] = []
  mock.method(transmit, 'broadcast', (channel: string, payload: unknown) => {
    broadcasts.push({
      channel,
      payload: payload as Record<string, unknown>,
    })
  })

  try {
    return await run(broadcasts)
  } finally {
    mock.restoreAll()
  }
}

function dmKey(firstSuid: string, secondSuid: string): string {
  return `dm_${[firstSuid, secondSuid].sort().join('__')}`
}

async function createDmFixture(): Promise<DmFixture> {
  const sender = await User.findByOrFail('username', 'super-admin')
  const candidates = await User.query()
    .where('status', 'APPROVED')
    .whereNot('suid', String(sender.suid))
    .whereNot('role_code', 'STUDENT')

  let peer: User | undefined
  for (const candidate of candidates) {
    const block = await UserBlock.query()
      .where((query) => {
        query.where('blocker_id', String(sender.suid)).where('blocked_id', String(candidate.suid))
      })
      .orWhere((query) => {
        query.where('blocker_id', String(candidate.suid)).where('blocked_id', String(sender.suid))
      })
      .first()
    if (!block) {
      peer = candidate
      break
    }
  }
  if (!peer) throw new Error('An unblocked approved chat peer is required for this test')

  const outsider = await User.query()
    .where('status', 'APPROVED')
    .whereNot('suid', String(sender.suid))
    .whereNot('suid', String(peer.suid))
    .first()
  if (!outsider) throw new Error('A third approved user is required for this test')

  const senderId = BigInt(String(sender.suid))
  const peerId = BigInt(String(peer.suid))
  const lowId = senderId < peerId ? senderId : peerId
  const highId = senderId < peerId ? peerId : senderId
  let conversation = await ChatConversation.query()
    .where('user_low_id', lowId.toString())
    .where('user_high_id', highId.toString())
    .first()
  let createdConversation = false
  if (!conversation) {
    conversation = await ChatConversation.create({
      userLowId: lowId,
      userHighId: highId,
    })
    createdConversation = true
  }

  const message = await ChatMessage.create({
    conversationId: conversation.id,
    senderId: peer.suid,
    body: 'Reaction integration test',
    clientId: randomUUID(),
  })

  return {
    sender,
    peer,
    outsider,
    message,
    convKey: dmKey(String(sender.suid), String(peer.suid)),
    cleanup: async () => {
      await ChatMessageReaction.query()
        .where('scope', 'dm')
        .where('message_id', String(message.id))
        .delete()
      await message.delete()
      if (createdConversation) await conversation.delete()
    },
  }
}

async function createGroupFixture(
  memberType: 'STUDENT' | 'NON_STUDENT' = 'STUDENT'
): Promise<GroupFixture> {
  let memberQuery = User.query().where('status', 'APPROVED')
  if (memberType === 'STUDENT') memberQuery = memberQuery.where('role_code', 'STUDENT')
  else {
    memberQuery = memberQuery.whereNot('role_code', 'STUDENT').whereNot('role_code', 'SUPER_ADMIN')
  }
  const member = await memberQuery.first()
  if (!member) throw new Error('An approved student is required for the group test')

  const peer = await User.query()
    .where('status', 'APPROVED')
    .whereNot('suid', String(member.suid))
    .whereNot('role_code', 'SUPER_ADMIN')
    .first()
  if (!peer) throw new Error('An approved group peer is required for the group test')

  const insertedGroups = await db
    .table('groups')
    .insert({
      group_name: `Reaction test ${randomUUID()}`,
      member_ids: [member.suid, peer.suid],
      created_by: member.suid,
    })
    .returning('group_id')
  const groupId = Number(insertedGroups[0].group_id)
  const clientId = randomUUID()
  const insertedMessages = await db
    .table('group_messages')
    .insert({
      group_id: groupId,
      sender_id: peer.suid,
      body: 'Group reaction integration test',
      client_id: clientId,
    })
    .returning('id')
  const messageId = String(insertedMessages[0].id)

  return {
    member,
    peer,
    groupId,
    messageId,
    clientId,
    cleanup: async () => {
      await ChatMessageReaction.query()
        .where('scope', 'group')
        .where('message_id', messageId)
        .delete()
      await db.from('group_messages').where('id', messageId).delete()
      await db.from('groups').where('group_id', groupId).delete()
    },
  }
}

test.group('Chat Reactions API', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('saves and broadcasts a DM reaction and returns it in peer messages', async ({
    client,
    assert,
  }) => {
    const fixture = await createDmFixture()

    try {
      await captureBroadcasts(async (broadcasts) => {
        const response = await client
          .put('/chat/reactions')
          .loginAs(fixture.sender)
          .json({
            conv_key: fixture.convKey,
            message_id: String(fixture.message.id),
            emoji: '👍',
          })

        response.assertStatus(200)
        const body = response.body() as {
          success: boolean
          data: { message_id: string; client_id: string; reactions: Record<string, string> }
        }
        assert.isTrue(body.success)
        assert.equal(body.data.message_id, String(fixture.message.id))
        assert.equal(body.data.client_id, fixture.message.clientId)
        assert.deepEqual(body.data.reactions, { [String(fixture.sender.suid)]: '👍' })
        assert.equal(broadcasts.length, 2)

        const ownBroadcast = broadcasts.find(
          (broadcast) => broadcast.channel === `chat/${String(fixture.sender.suid)}`
        )
        const peerBroadcast = broadcasts.find(
          (broadcast) => broadcast.channel === `chat/${String(fixture.peer.suid)}`
        )
        assert.equal(ownBroadcast?.payload['peer_suid'], String(fixture.peer.suid))
        assert.equal(peerBroadcast?.payload['peer_suid'], String(fixture.sender.suid))
        assert.equal(peerBroadcast?.payload['event'], 'message.reaction')
      })

      const peerMessages = await client
        .get(`/chat/peer/${String(fixture.sender.suid)}/messages`)
        .loginAs(fixture.peer)
      peerMessages.assertStatus(200)
      const listed = (peerMessages.body() as { data: Array<Record<string, unknown>> }).data.find(
        (message) => message['id'] === String(fixture.message.id)
      )
      assert.deepEqual(listed?.['reactions'], { [String(fixture.sender.suid)]: '👍' })

      const conversationMessages = await client
        .get(`/chat/conversations/${String(fixture.message.conversationId)}/messages`)
        .loginAs(fixture.peer)
      conversationMessages.assertStatus(200)
      const conversationMessage = (
        conversationMessages.body() as { data: Array<Record<string, unknown>> }
      ).data.find((message) => message['id'] === String(fixture.message.id))
      assert.deepEqual(conversationMessage?.['reactions'], { [String(fixture.sender.suid)]: '👍' })
    } finally {
      await fixture.cleanup()
    }
  })

  test('replaces, removes, and idempotently sets the same reaction', async ({ client, assert }) => {
    const fixture = await createDmFixture()

    try {
      await captureBroadcasts(async (broadcasts) => {
        const requestReaction = (emoji: string | null) =>
          client
            .put('/chat/reactions')
            .loginAs(fixture.sender)
            .json({
              conv_key: fixture.convKey,
              message_id: String(fixture.message.id),
              emoji,
            })

        const first = await requestReaction('👍')
        const replaced = await requestReaction('❤️')
        const repeated = await requestReaction('❤️')
        first.assertStatus(200)
        replaced.assertStatus(200)
        repeated.assertStatus(200)
        assert.equal(
          await ChatMessageReaction.query()
            .where('scope', 'dm')
            .where('message_id', String(fixture.message.id))
            .where('user_id', String(fixture.sender.suid))
            .count('* as total')
            .then((result) => Number(result[0].$extras.total)),
          1
        )

        const removed = await requestReaction(null)
        removed.assertStatus(200)
        const removedBody = removed.body() as {
          data: { reactions: Record<string, string> }
        }
        assert.deepEqual(removedBody.data.reactions, {})
        assert.equal(broadcasts[broadcasts.length - 1].payload['emoji'], null)
        assert.deepEqual(broadcasts[broadcasts.length - 1].payload['reactions'], {})
      })
    } finally {
      await fixture.cleanup()
    }
  })

  test('resolves by client_id and rejects missing identifiers or invalid emoji', async ({
    client,
    assert,
  }) => {
    const fixture = await createDmFixture()

    try {
      const byClientId = await client.put('/chat/reactions').loginAs(fixture.sender).json({
        conv_key: fixture.convKey,
        client_id: fixture.message.clientId,
        emoji: '👍',
      })
      byClientId.assertStatus(200)

      const missing = await client
        .put('/chat/reactions')
        .loginAs(fixture.sender)
        .json({ conv_key: fixture.convKey, emoji: '👍' })
      missing.assertStatus(422)
      assert.equal(
        (missing.body() as { message?: string }).message,
        'message_id or client_id is required'
      )

      for (const emoji of ['hello', '👍❤️']) {
        const invalid = await client
          .put('/chat/reactions')
          .loginAs(fixture.sender)
          .json({
            conv_key: fixture.convKey,
            message_id: String(fixture.message.id),
            emoji,
          })
        invalid.assertStatus(422)
      }
    } finally {
      await fixture.cleanup()
    }
  })

  test('rejects unauthorized, blocked, and unknown DM reactions', async ({ client, assert }) => {
    const fixture = await createDmFixture()

    try {
      const unauthenticated = await client.put('/chat/reactions').json({
        conv_key: fixture.convKey,
        message_id: String(fixture.message.id),
        emoji: '👍',
      })
      unauthenticated.assertStatus(401)

      const outsider = await client
        .put('/chat/reactions')
        .loginAs(fixture.outsider)
        .json({
          conv_key: fixture.convKey,
          message_id: String(fixture.message.id),
          emoji: '👍',
        })
      outsider.assertStatus(403)

      const student = await User.query()
        .where('status', 'APPROVED')
        .where('role_code', 'STUDENT')
        .first()
      if (!student) throw new Error('An approved student is required for this test')
      const studentDm = await client
        .put('/chat/reactions')
        .loginAs(student)
        .json({
          conv_key: dmKey(String(student.suid), String(fixture.peer.suid)),
          message_id: String(fixture.message.id),
          emoji: '👍',
        })
      studentDm.assertStatus(403)

      let createdBlock = false
      const block = await UserBlock.query()
        .where('blocker_id', String(fixture.peer.suid))
        .where('blocked_id', String(fixture.sender.suid))
        .first()
      if (!block) {
        await UserBlock.create({
          blockerId: fixture.peer.suid,
          blockedId: fixture.sender.suid,
        })
        createdBlock = true
      }

      try {
        const blocked = await client
          .put('/chat/reactions')
          .loginAs(fixture.sender)
          .json({
            conv_key: fixture.convKey,
            message_id: String(fixture.message.id),
            emoji: '👍',
          })
        blocked.assertStatus(403)
        assert.equal(
          (blocked.body() as { message?: string }).message,
          'Reaction could not be delivered.'
        )
      } finally {
        if (createdBlock) {
          await UserBlock.query()
            .where('blocker_id', String(fixture.peer.suid))
            .where('blocked_id', String(fixture.sender.suid))
            .delete()
        }
      }

      const unknownMessage = await client.put('/chat/reactions').loginAs(fixture.sender).json({
        conv_key: fixture.convKey,
        message_id: '999999999999999999',
        emoji: '👍',
      })
      unknownMessage.assertStatus(404)
    } finally {
      await fixture.cleanup()
    }
  })

  test('group reactions broadcast to members and super admins only', async ({ client, assert }) => {
    const fixture = await createGroupFixture('NON_STUDENT')

    try {
      await captureBroadcasts(async (broadcasts) => {
        const response = await client
          .put('/chat/reactions')
          .loginAs(fixture.member)
          .json({
            conv_key: `group_${fixture.groupId}`,
            message_id: fixture.messageId,
            emoji: '❤️',
          })
        response.assertStatus(200)

        const admins = await User.query().where('role_code', 'SUPER_ADMIN').select('suid')
        const expectedRecipients = new Set([
          String(fixture.member.suid),
          String(fixture.peer.suid),
          ...admins.map((admin) => String(admin.suid)),
        ])
        assert.deepEqual(
          new Set(broadcasts.map((broadcast) => broadcast.channel.replace('chat/', ''))),
          expectedRecipients
        )
        assert.isTrue(
          broadcasts.every((broadcast) => broadcast.payload['group_id'] === fixture.groupId)
        )
      })

      const messages = await client
        .get(`/chat/group_${fixture.groupId}/messages`)
        .loginAs(fixture.member)
      messages.assertStatus(200)
      const groupMessage = (messages.body() as { data: Array<Record<string, unknown>> }).data.find(
        (message) => message['id'] === fixture.messageId
      )
      assert.deepEqual(groupMessage?.['reactions'], { [String(fixture.member.suid)]: '❤️' })

      const outsider = await User.query()
        .where('status', 'APPROVED')
        .whereNot('suid', String(fixture.member.suid))
        .whereNot('suid', String(fixture.peer.suid))
        .whereNot('role_code', 'SUPER_ADMIN')
        .first()
      if (!outsider) throw new Error('An approved non-member user is required for this test')
      const denied = await client
        .put('/chat/reactions')
        .loginAs(outsider)
        .json({
          conv_key: `group_${fixture.groupId}`,
          message_id: fixture.messageId,
          emoji: '👍',
        })
      denied.assertStatus(403)
    } finally {
      await fixture.cleanup()
    }
  })

  test('rate limits the 21st reaction change within ten seconds', async ({ client, assert }) => {
    const fixture = await createGroupFixture()

    try {
      await captureBroadcasts(async () => {
        let lastStatus = 0
        for (let index = 0; index < 21; index++) {
          const response = await client
            .put('/chat/reactions')
            .loginAs(fixture.member)
            .json({
              conv_key: `group_${fixture.groupId}`,
              message_id: fixture.messageId,
              emoji: index % 2 === 0 ? '👍' : '❤️',
            })
          lastStatus = response.status()
          if (index < 20) response.assertStatus(200)
        }
        assert.equal(lastStatus, 429)
      })
    } finally {
      await fixture.cleanup()
    }
  })

  test('unknown API routes return a JSON 404 response', async ({ client, assert }) => {
    const response = await client.get('/unknown-chat-reaction-route')

    response.assertStatus(404)
    assert.deepEqual(response.body(), {
      success: false,
      message: 'Resource not found',
    })
  })
})
