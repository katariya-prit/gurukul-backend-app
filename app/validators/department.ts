import vine from '@vinejs/vine'

export const createDepartmentValidator = vine.compile(
  vine.object({
    departmentName: vine.string().trim().minLength(1).maxLength(255),
    departmentHeadId: vine.number().positive().optional(),
    description: vine.string().trim().optional(),
  })
)

export const updateDepartmentValidator = vine.compile(
  vine.object({
    departmentName: vine.string().trim().minLength(1).maxLength(255).optional(),
    departmentHeadId: vine.number().positive().nullable().optional(),
    description: vine.string().trim().nullable().optional(),
  })
)