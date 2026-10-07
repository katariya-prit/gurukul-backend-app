import vine from '@vinejs/vine'

export const progressIdParamValidator = vine.compile(
  vine.object({
    id: vine.number(),
  })
)

export const progressSuidParamValidator = vine.compile(
  vine.object({
    suid: vine.number(),
  })
)