import vine from '@vinejs/vine'

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
    to_user_id: vine.string().trim().regex(/^\d+$/),
  })
)
