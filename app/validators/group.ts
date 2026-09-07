import vine from '@vinejs/vine'

export const createGroupValidator = vine.compile(
  vine.object({
    groupName: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().optional().nullable(),
    memberIds: vine.array(vine.number()).minLength(1),
  })
)

export const updateGroupValidator = vine.compile(
  vine.object({
    groupName: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().optional().nullable(),
    memberIds: vine.array(vine.number()).minLength(1).optional(),
  })
)