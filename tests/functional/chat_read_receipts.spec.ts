import { randomUUID } from 'node:crypto'
import { mock } from 'node:test'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import transmit from '@adonisjs/transmit/services/main'
import { DateTime } from 'luxon'
import ChatConversation from '#models/chat_conversation'
import ChatMessage from '#models/chat_message'
import ChatRead from '#models/chat_read'
import User from '#models/user'
import UserBlock from '#models/user_block'

type ReadBroadcast = {
  channel: string
  payload: Record<string, unknown>
}

type ReadFixture = {
  sender: User
  reader: User
  conversation: ChatConversation
  messages: ChatMessage[]
  readerMessage: ChatMessage | null
  convKey: string
}

type ReadApiResponse = {
  assertStatus: (status: number) => void
  body: () => unknown
}

type ReadApiRequest = {
  loginAs: (user: User) => ReadApiRequest
  json: (body: { up_to_message_id: string }) => Promise<ReadApiResponse>
}

type ReadApiClient = {
  post: (url: string) => ReadApiRequest
}

async function captureBroadcasts<T>(run: (broadcasts: ReadBroadcast[]) => Promise<T>): Promise<T> {
  const broadcasts: ReadBroadcast[] = []
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

async function createFixture(options?: {
  readerUsername?: string
  peerMessageCount?: number
  includeReaderMessage?: boolean
}): Promise<ReadFixture> {
  const sender = await User.findByOrFail('username', 'super-admin')
  const reader = await User.findByOrFail('username', options?.readerUsername ?? 'tirth')
  const senderId = BigInt(String(sender.suid))
  const readerId = BigInt(String(reader.suid))
  const lowId = senderId < readerId ? senderId : readerId
  const highId = senderId < readerId ? readerId : senderId
  const conversation = await ChatConversation.create({
    userLowId: lowId,
    userHighId: highId,
  })
  const messages: ChatMessage[] = []

  for (let index = 0; index < (options?.peerMessageCount ?? 3); index++) {
    const message = await ChatMessage.create({
      conversationId: conversation.id,
      senderId: sender.suid,
      body: `Read receipt message ${index + 1}`,
      clientId: randomUUID(),
    })
    messages.push(message)
  }

  let readerMessage: ChatMessage | null = null
  if (options?.includeReaderMessage) {
    readerMessage = await ChatMessage.create({
      conversationId: conversation.id,
      senderId: reader.suid,
      body: 'Reader message',
      clientId: randomUUID(),
    })
  }

  const lastMessage = readerMessage ?? messages[messages.length - 1]
  if (lastMessage) {
    conversation.lastMessageId = lastMessage.id
    conversation.lastMessageAt = DateTime.now()
    conversation.lastMessagePreview = lastMessage.body
    await conversation.save()
  }

  return {
    sender,
    reader,
    conversation,
    messages,
    readerMessage,
    convKey: `dm_${[String(sender.suid), String(reader.suid)].sort().join('__')}`,
  }
}

async function readPeer(
  client: ReadApiClient,
  reader: User,
  peerSuid: string,
  upToMessageId: string
) {
  return client
    .post(`/chat/peer/${peerSuid}/read`)
    .loginAs(reader)
    .json({ up_to_message_id: upToMessageId })
}

function assertReadBroadcasts(
  assert: {
    equal: (actual: unknown, expected: unknown) => void
    match: (value: string, regex: RegExp) => void
  },
  broadcasts: ReadBroadcast[],
  fixture: ReadFixture,
  upToMessageId: string
) {
  assert.equal(broadcasts.length, 2)
  const peerBroadcast = broadcasts.find(
    (broadcast) => broadcast.channel === `chat/${String(fixture.sender.suid)}`
  )
  const readerBroadcast = broadcasts.find(
    (broadcast) => broadcast.channel === `chat/${String(fixture.reader.suid)}`
  )
  assert.equal(peerBroadcast?.payload['event'], 'conversation.read')
  assert.equal(peerBroadcast?.payload['conversation_id'], String(fixture.conversation.id))
  assert.equal(peerBroadcast?.payload['conv_key'], fixture.convKey)
  assert.equal(peerBroadcast?.payload['reader_id'], String(fixture.reader.suid))
  assert.equal(peerBroadcast?.payload['peer_suid'], String(fixture.reader.suid))
  assert.equal(peerBroadcast?.payload['up_to_message_id'], upToMessageId)
  assert.equal(readerBroadcast?.payload['peer_suid'], String(fixture.sender.suid))
  assert.match(String(peerBroadcast?.payload['read_at']), /^\d{4}-\d\d-\d\dT/)
  assert.match(String(readerBroadcast?.payload['read_at']), /^\d{4}-\d\d-\d\dT/)
}

test.group('Chat Read Receipts API', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('peer read advances the receipt and broadcasts to both users', async ({
    client,
    assert,
  }) => {
    const fixture = await createFixture()
    const messageId = String(fixture.messages[1].id)

    await captureBroadcasts(async (broadcasts) => {
      const response = await readPeer(
        client,
        fixture.reader,
        String(fixture.sender.suid),
        messageId
      )
      response.assertStatus(200)
      const body = response.body() as {
        success: boolean
        data: {
          changed: boolean
          conversation_id: string
          up_to_message_id: string
          read_at: string
        }
      }

      assert.isTrue(body.success)
      assert.isTrue(body.data.changed)
      assert.equal(body.data.conversation_id, String(fixture.conversation.id))
      assert.equal(body.data.up_to_message_id, messageId)
      assert.match(body.data.read_at, /^\d{4}-\d\d-\d\dT/)
      assertReadBroadcasts(assert, broadcasts, fixture, messageId)
    })

    const read = await ChatRead.query()
      .where('conversation_id', String(fixture.conversation.id))
      .where('user_id', String(fixture.reader.suid))
      .first()
    assert.isNotNull(read)
    assert.equal(String(read!.lastReadMessageId), messageId)
  })

  test('repeated and lower reads do not change the receipt or broadcast', async ({
    client,
    assert,
  }) => {
    const fixture = await createFixture()
    const messageId = String(fixture.messages[1].id)
    const lowerMessageId = String(fixture.messages[0].id)

    await captureBroadcasts(async (broadcasts) => {
      const first = await readPeer(client, fixture.reader, String(fixture.sender.suid), messageId)
      first.assertStatus(200)
      assert.isTrue((first.body() as { data: { changed: boolean } }).data.changed)

      const firstRow = await ChatRead.query()
        .where('conversation_id', String(fixture.conversation.id))
        .where('user_id', String(fixture.reader.suid))
        .firstOrFail()
      const originalUpdatedAt = firstRow.updatedAt.toISO()

      const repeated = await readPeer(
        client,
        fixture.reader,
        String(fixture.sender.suid),
        messageId
      )
      repeated.assertStatus(200)
      assert.isFalse((repeated.body() as { data: { changed: boolean } }).data.changed)

      const lower = await readPeer(
        client,
        fixture.reader,
        String(fixture.sender.suid),
        lowerMessageId
      )
      lower.assertStatus(200)
      assert.isFalse((lower.body() as { data: { changed: boolean } }).data.changed)
      assert.equal(broadcasts.length, 2)

      const finalRow = await ChatRead.query()
        .where('conversation_id', String(fixture.conversation.id))
        .where('user_id', String(fixture.reader.suid))
        .firstOrFail()
      assert.equal(String(finalRow.lastReadMessageId), messageId)
      assert.equal(finalRow.updatedAt.toISO(), originalUpdatedAt)
    })
  })

  test('read requests clamp to peer messages and ignore conversations without peer messages', async ({
    client,
    assert,
  }) => {
    const fixture = await createFixture({ includeReaderMessage: true })
    const expectedMessageId = String(fixture.messages[fixture.messages.length - 1].id)
    const ownMessageId = String(fixture.readerMessage!.id)

    const clamped = await readPeer(
      client,
      fixture.reader,
      String(fixture.sender.suid),
      ownMessageId
    )
    clamped.assertStatus(200)
    const clampedBody = clamped.body() as {
      data: { changed: boolean; up_to_message_id: string }
    }
    assert.isTrue(clampedBody.data.changed)
    assert.equal(clampedBody.data.up_to_message_id, expectedMessageId)

    const beyondPeerMessages = await readPeer(
      client,
      fixture.reader,
      String(fixture.sender.suid),
      String(BigInt(ownMessageId) + 100n)
    )
    beyondPeerMessages.assertStatus(200)
    assert.isFalse((beyondPeerMessages.body() as { data: { changed: boolean } }).data.changed)

    const emptyFixture = await createFixture({
      readerUsername: 'shyambhai',
      peerMessageCount: 0,
      includeReaderMessage: true,
    })
    const emptyRead = await readPeer(
      client,
      emptyFixture.reader,
      String(emptyFixture.sender.suid),
      String(emptyFixture.readerMessage!.id)
    )
    emptyRead.assertStatus(200)
    assert.deepEqual(emptyRead.body(), { success: true, data: { changed: false } })
    assert.isNull(
      await ChatRead.query()
        .where('conversation_id', String(emptyFixture.conversation.id))
        .where('user_id', String(emptyFixture.reader.suid))
        .first()
    )
  })

  test('requires authentication, numeric peer IDs, and an existing conversation', async ({
    client,
    assert,
  }) => {
    const fixture = await createFixture()
    const unauthenticated = await client
      .post(`/chat/peer/${String(fixture.sender.suid)}/read`)
      .json({ up_to_message_id: String(fixture.messages[0].id) })
    unauthenticated.assertStatus(401)

    const nonNumeric = await client
      .post('/chat/peer/not-a-number/read')
      .loginAs(fixture.reader)
      .json({ up_to_message_id: String(fixture.messages[0].id) })
    nonNumeric.assertStatus(422)

    const noConversation = await client
      .post('/chat/peer/999999999/read')
      .loginAs(fixture.reader)
      .json({ up_to_message_id: String(fixture.messages[0].id) })
    noConversation.assertStatus(404)
    assert.deepEqual(noConversation.body(), {
      success: false,
      message: 'Conversation not found.',
    })

    const peerMessages = await client.get('/chat/peer/999999999/messages').loginAs(fixture.reader)
    peerMessages.assertStatus(200)
    assert.deepEqual(peerMessages.body(), { success: true, data: [], meta: null })
  })

  test('conversation unread counts and peer message metadata use read state', async ({
    client,
    assert,
  }) => {
    const fixture = await createFixture()
    const secondMessageId = String(fixture.messages[1].id)

    const readTwo = await readPeer(
      client,
      fixture.reader,
      String(fixture.sender.suid),
      secondMessageId
    )
    readTwo.assertStatus(200)

    const readerConversations = await client.get('/chat/conversations').loginAs(fixture.reader)
    readerConversations.assertStatus(200)
    const readerConversation = (
      readerConversations.body() as {
        data: Array<Record<string, unknown>>
      }
    ).data.find((row) => row['id'] === String(fixture.conversation.id))
    assert.isDefined(readerConversation)
    assert.equal(readerConversation!['unread_count'], 1)
    assert.equal(readerConversation!['my_last_read_message_id'], secondMessageId)

    const senderConversations = await client.get('/chat/conversations').loginAs(fixture.sender)
    senderConversations.assertStatus(200)
    const senderConversation = (
      senderConversations.body() as {
        data: Array<Record<string, unknown>>
      }
    ).data.find((row) => row['id'] === String(fixture.conversation.id))
    assert.isDefined(senderConversation)
    assert.equal(senderConversation!['other_last_read_message_id'], secondMessageId)

    const peerMessages = await client
      .get(`/chat/peer/${String(fixture.reader.suid)}/messages`)
      .loginAs(fixture.sender)
    peerMessages.assertStatus(200)
    const peerMessagesBody = peerMessages.body() as {
      data: Array<Record<string, unknown>>
      meta: {
        conversation_id: string
        my_last_read_message_id: string | null
        peer_last_read_message_id: string | null
        peer_last_read_at: string | null
      }
    }
    assert.equal(peerMessagesBody.data.length, fixture.messages.length)
    assert.equal(peerMessagesBody.meta.conversation_id, String(fixture.conversation.id))
    assert.isNull(peerMessagesBody.meta.my_last_read_message_id)
    assert.equal(peerMessagesBody.meta.peer_last_read_message_id, secondMessageId)
    assert.match(String(peerMessagesBody.meta.peer_last_read_at), /^\d{4}-\d\d-\d\dT/)

    const readAll = await readPeer(
      client,
      fixture.reader,
      String(fixture.sender.suid),
      String(fixture.messages[2].id)
    )
    readAll.assertStatus(200)
    const allReadConversations = await client.get('/chat/conversations').loginAs(fixture.reader)
    allReadConversations.assertStatus(200)
    const allReadConversation = (
      allReadConversations.body() as {
        data: Array<Record<string, unknown>>
      }
    ).data.find((row) => row['id'] === String(fixture.conversation.id))
    assert.isDefined(allReadConversation)
    assert.equal(allReadConversation!['unread_count'], 0)
  })

  test('the original conversation read endpoint remains compatible and broadcasts read metadata', async ({
    client,
    assert,
  }) => {
    const fixture = await createFixture()
    const messageId = String(fixture.messages[1].id)

    await captureBroadcasts(async (broadcasts) => {
      const response = await client
        .post(`/chat/conversations/${String(fixture.conversation.id)}/read`)
        .loginAs(fixture.reader)
        .json({ up_to_message_id: messageId })
      response.assertStatus(200)
      assert.deepEqual(response.body(), { success: true })
      assertReadBroadcasts(assert, broadcasts, fixture, messageId)
    })
  })

  test('blocking either direction saves the read but suppresses the peer broadcast', async ({
    client,
    assert,
  }) => {
    const first = await createFixture({ readerUsername: 'tirth' })
    const second = await createFixture({ readerUsername: 'shyambhai' })
    await UserBlock.create({
      blockerId: first.sender.suid,
      blockedId: first.reader.suid,
    })
    await UserBlock.create({
      blockerId: second.reader.suid,
      blockedId: second.sender.suid,
    })

    await captureBroadcasts(async (broadcasts) => {
      const firstResponse = await readPeer(
        client,
        first.reader,
        String(first.sender.suid),
        String(first.messages[0].id)
      )
      const secondResponse = await readPeer(
        client,
        second.reader,
        String(second.sender.suid),
        String(second.messages[0].id)
      )
      firstResponse.assertStatus(200)
      secondResponse.assertStatus(200)
      assert.isTrue((firstResponse.body() as { data: { changed: boolean } }).data.changed)
      assert.isTrue((secondResponse.body() as { data: { changed: boolean } }).data.changed)
      assert.deepEqual(
        broadcasts.map((broadcast) => broadcast.channel).sort(),
        [`chat/${String(first.reader.suid)}`, `chat/${String(second.reader.suid)}`].sort()
      )
    })

    assert.isNotNull(
      await ChatRead.query()
        .where('conversation_id', String(first.conversation.id))
        .where('user_id', String(first.reader.suid))
        .first()
    )
    assert.isNotNull(
      await ChatRead.query()
        .where('conversation_id', String(second.conversation.id))
        .where('user_id', String(second.reader.suid))
        .first()
    )
  })
})
