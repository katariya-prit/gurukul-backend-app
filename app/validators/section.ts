import vine from '@vinejs/vine'

export const createSectionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255),
    departmentId: vine.number(),
    sectionHeadId: vine.number().optional().nullable(),
    description: vine.string().trim().optional().nullable(),
  })
)

export const updateSectionValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(255).optional(),
    departmentId: vine.number().optional(),
    sectionHeadId: vine.number().optional().nullable(),
    description: vine.string().trim().optional().nullable(),
  })
)