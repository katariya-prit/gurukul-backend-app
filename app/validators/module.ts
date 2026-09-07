import vine from '@vinejs/vine'

export const createModuleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100),
    moduleCode: vine.string().trim().minLength(1).maxLength(100),
    description: vine.string().trim().optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)

export const updateModuleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(100).optional(),
    moduleCode: vine.string().trim().minLength(1).maxLength(100).optional(),
    description: vine.string().trim().optional().nullable(),
    isActive: vine.boolean().optional(),
  })
)