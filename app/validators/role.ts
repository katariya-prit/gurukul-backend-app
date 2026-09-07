import vine from '@vinejs/vine'

export const createRoleValidator = vine.compile(
  vine.object({
    roleCode: vine.string().trim().minLength(1).maxLength(100),
    roleName: vine.string().trim().minLength(1).maxLength(100),
    description: vine.string().trim().optional().nullable(),
    // Flexible JSON permissions object, e.g. { "LIBRARY": { "read": true } }
    permissions: vine.object({}).allowUnknownProperties().optional(),
  })
)

export const updateRoleValidator = vine.compile(
  vine.object({
    roleName: vine.string().trim().minLength(1).maxLength(100).optional(),
    description: vine.string().trim().optional().nullable(),
    permissions: vine.object({}).allowUnknownProperties().optional(),
  })
)