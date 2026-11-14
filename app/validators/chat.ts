import vine from '@vinejs/vine'

const uniqueTypingRecipientsRule = vine.createRule((value, _, field) => {
  if (!Array.isArray(value)) return

  const recipients = value as string[]
  if (new Set(recipients).size !== recipients.length) {
    field.report('Recipients must be unique', 'unique_recipients', field)
  }
})

const reactionIdentifierRule = vine.createRule((value, _, field) => {
  const payload = value as { message_id?: string; client_id?: string }
  if (!payload.message_id && !payload.client_id) {
    field.report('message_id or client_id is required', 'reaction_identifier_required', field)
  }
})

const reactionEmojiRule = vine.createRule((value, _, field) => {
  if (value === null || value === undefined || value === '') return

  const emoji = value as string
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
  const graphemes = Array.from(segmenter.segment(emoji))
  if (graphemes.length !== 1 || !/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u.test(emoji)) {
    field.report('emoji must be a single emoji', 'invalid_reaction_emoji', field)
  }
})

export const lookupUserValidator = vine.compile(
  vine.object({
    suid: vine.string().trim().regex(/^\d+$/),
  })
)

export const createContactValidator = vine.compile(
  vine.object({
    user_id: vine.string().trim().regex(/^\d+$/),
    nickname: vine.string().trim().maxLength(60).optional(),
  })
)

export const updateContactValidator = vine.compile(
  vine.object({
    nickname: vine.string().trim().maxLength(60).nullable().optional(),
  })
)

export const sendMessageValidator = vine.compile(
  vine.object({
    to_user_id: vine.string().trim().regex(/^\d+$/),
    body: vine.string().trim().minLength(1).maxLength(2000),
    client_id: vine.string().trim().optional(),
  })
)

export const markReadValidator = vine.compile(
  vine.object({
    up_to_message_id: vine.string().trim().regex(/^\d+$/),
  })
)

export const blockUserValidator = vine.compile(
  vine.object({
    user_id: vine.string().trim().regex(/^\d+$/),
  })
)

export const typingValidator = vine.compile(
  vine.object({
    conv_key: vine
      .string()
      .trim()
      .maxLength(100)
      .regex(/^(group_\d+|dm_.+)$/),
    to_suids: vine
      .array(vine.string().trim().minLength(1))
      .minLength(1)
      .maxLength(100)
      .use(uniqueTypingRecipientsRule()),
    typing: vine.boolean(),
  })
)

export const reactionValidator = vine.compile(
  vine
    .object({
      conv_key: vine
        .string()
        .trim()
        .regex(/^(dm_\d+__\d+|group_\d+)$/),
      message_id: vine.string().trim().regex(/^\d+$/).optional(),
      client_id: vine.string().trim().maxLength(120).optional(),
      emoji: vine.string().trim().maxLength(32).nullable().optional().use(reactionEmojiRule()),
    })
    .use(reactionIdentifierRule())
)
