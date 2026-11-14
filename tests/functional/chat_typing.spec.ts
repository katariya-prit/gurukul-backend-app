import { mock } from 'node:test'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import transmit from '@adonisjs/transmit/services/main'
import User from '#models/user'
import UserBlock from '#models/user_block'

type TypingBroadcast = {
  channel: string
  payload: Record<string, unknown>
}

async function captureBroadcasts<T>(
  run: (broadcasts: TypingBroadcast[]) => Promise<T>
): Promise<T> {
  const broadcasts: TypingBroadcast[] = []

  mock.method(transmit, 'broadcast', async (channel: string, payload: unknown) => {
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

async function findApprovedPeers(sender: User, count: number): Promise<User[]> {
  return User.query().where('status', 'APPROVED').whereNot('suid', String(sender.suid)).limit(count)
}

function dmKey(firstSuid: string, secondSuid: string): string {
  return `dm_${[firstSuid, secondSuid].sort().join('__')}`
}

test.group('Chat Typing API', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('DM broadcasts the authenticated sender to the recipient channel', async ({
    client,
    assert,
  }) => {
    const sender = await User.findByOrFail('username', 'super-admin')
    const peers = await findApprovedPeers(sender, 1)
    const recipient = peers[0]
    if (!recipient) throw new Error('An approved chat recipient is required for this test')

    await captureBroadcasts(async (broadcasts) => {
      const response = await client
        .post('/chat/typing')
        .loginAs(sender)
        .json({
          conv_key: dmKey(String(sender.suid), String(recipient.suid)),
          to_suids: [String(recipient.suid)],
          typing: true,
        })

      response.assertStatus(200)
      assert.deepEqual(response.body(), { success: true })
      assert.equal(broadcasts.length, 1)
      assert.equal(broadcasts[0].channel, `chat/${String(recipient.suid)}`)
      assert.deepEqual(broadcasts[0].payload['from_user'], {
        suid: String(sender.suid),
        name: sender.name,
        avatar: sender.avatar ?? null,
      })
      assert.isTrue(broadcasts[0].payload['typing'] as boolean)
    })
  })

  test('group broadcasts to other recipients only', async ({ client, assert }) => {
    const sender = await User.findByOrFail('username', 'super-admin')
    const peers = await findApprovedPeers(sender, 2)
    const first = peers[0]
    const second = peers[1]
    if (!first || !second)
      throw new Error('Two approved chat recipients are required for this test')

    await captureBroadcasts(async (broadcasts) => {
      const response = await client
        .post('/chat/typing')
        .loginAs(sender)
        .json({
          conv_key: 'group_1',
          to_suids: [String(first.suid), String(second.suid), String(sender.suid)],
          typing: true,
        })

      response.assertStatus(200)
      assert.deepEqual(
        broadcasts.map((broadcast) => broadcast.channel).sort(),
        [`chat/${String(first.suid)}`, `chat/${String(second.suid)}`].sort()
      )
      assert.notInclude(
        broadcasts.map((broadcast) => broadcast.channel),
        `chat/${String(sender.suid)}`
      )
    })
  })

  test('typing false is broadcast with typing false', async ({ client, assert }) => {
    const sender = await User.findByOrFail('username', 'super-admin')
    const peers = await findApprovedPeers(sender, 1)
    const recipient = peers[0]
    if (!recipient) throw new Error('An approved chat recipient is required for this test')

    await captureBroadcasts(async (broadcasts) => {
      const response = await client
        .post('/chat/typing')
        .loginAs(sender)
        .json({
          conv_key: 'group_11',
          to_suids: [String(recipient.suid)],
          typing: false,
        })

      response.assertStatus(200)
      assert.equal(broadcasts.length, 1)
      assert.equal(broadcasts[0].payload['event'], 'typing')
      assert.isFalse(broadcasts[0].payload['typing'] as boolean)
    })
  })

  test('requires authentication and rejects invalid bodies', async ({ client, assert }) => {
    const unauthenticated = await client.post('/chat/typing').json({
      conv_key: 'group_1',
      to_suids: ['2'],
      typing: true,
    })
    unauthenticated.assertStatus(401)

    const sender = await User.findByOrFail('username', 'super-admin')
    const invalid = await client
      .post('/chat/typing')
      .loginAs(sender)
      .json({ conv_key: 'invalid', to_suids: ['2'], typing: true })

    invalid.assertStatus(422)
    const invalidBody = invalid.body() as { success: boolean; message?: string }
    assert.isFalse(invalidBody.success)
    assert.isString(invalidBody.message)
  })

  test('self-only recipient list succeeds without broadcasting', async ({ client, assert }) => {
    const sender = await User.findByOrFail('username', 'super-admin')

    await captureBroadcasts(async (broadcasts) => {
      const response = await client
        .post('/chat/typing')
        .loginAs(sender)
        .json({
          conv_key: 'group_12',
          to_suids: [String(sender.suid)],
          typing: true,
        })

      response.assertStatus(200)
      assert.deepEqual(response.body(), { success: true })
      assert.equal(broadcasts.length, 0)
    })
  })

  test('does not notify recipients who blocked the sender', async ({ client, assert }) => {
    const sender = await User.findByOrFail('username', 'super-admin')
    const peers = await findApprovedPeers(sender, 1)
    const recipient = peers[0]
    if (!recipient) throw new Error('An approved chat recipient is required for this test')

    let createdBlock = false
    const existingBlock = await UserBlock.query()
      .where('blocker_id', String(recipient.suid))
      .where('blocked_id', String(sender.suid))
      .first()
    if (!existingBlock) {
      await UserBlock.create({
        blockerId: recipient.suid,
        blockedId: sender.suid,
      })
      createdBlock = true
    }

    try {
      await captureBroadcasts(async (broadcasts) => {
        const response = await client
          .post('/chat/typing')
          .loginAs(sender)
          .json({
            conv_key: dmKey(String(sender.suid), String(recipient.suid)),
            to_suids: [String(recipient.suid)],
            typing: true,
          })

        response.assertStatus(200)
        assert.equal(broadcasts.length, 0)
      })
    } finally {
      if (createdBlock) {
        await UserBlock.query()
          .where('blocker_id', String(recipient.suid))
          .where('blocked_id', String(sender.suid))
          .delete()
      }
    }
  })

  test('ignores student DM typing', async ({ client, assert }) => {
    const sender = await User.query()
      .where('role_code', 'STUDENT')
      .where('status', 'APPROVED')
      .first()
    if (!sender) throw new Error('An approved student is required for this test')

    const peers = await findApprovedPeers(sender, 1)
    const recipient = peers[0]
    if (!recipient) throw new Error('An approved chat recipient is required for this test')

    await captureBroadcasts(async (broadcasts) => {
      const response = await client
        .post('/chat/typing')
        .loginAs(sender)
        .json({
          conv_key: dmKey(String(sender.suid), String(recipient.suid)),
          to_suids: [String(recipient.suid)],
          typing: true,
        })

      response.assertStatus(200)
      assert.equal(broadcasts.length, 0)
    })
  })

  test('rate limits repeated typing true broadcasts for one conversation', async ({
    client,
    assert,
  }) => {
    const sender = await User.findByOrFail('username', 'super-admin')
    const peers = await findApprovedPeers(sender, 1)
    const recipient = peers[0]
    if (!recipient) throw new Error('An approved chat recipient is required for this test')

    await captureBroadcasts(async (broadcasts) => {
      const body = {
        conv_key: `group_${Date.now()}`,
        to_suids: [String(recipient.suid)],
        typing: true,
      }
      const first = await client.post('/chat/typing').loginAs(sender).json(body)
      const second = await client.post('/chat/typing').loginAs(sender).json(body)

      first.assertStatus(200)
      second.assertStatus(200)
      assert.equal(broadcasts.length, 1)
    })
  })

  test('unknown API routes return JSON 404 responses', async ({ client, assert }) => {
    const response = await client.get('/unknown-chat-route')

    response.assertStatus(404)
    assert.deepEqual(response.body(), {
      success: false,
      message: 'Resource not found',
    })
  })
})
