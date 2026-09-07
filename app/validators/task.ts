import vine from '@vinejs/vine'

export const createTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    description: vine.string().trim().optional().nullable(),
    assignedTo: vine.number(),
    assignedBy: vine.number().optional().nullable(),
    sectionId: vine.number().optional().nullable(),
    departmentId: vine.number().optional().nullable(),
    status: vine.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).optional(),
    dueDate: vine.date().optional().nullable(),
  })
)

export const updateTaskValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    description: vine.string().trim().optional().nullable(),
    assignedTo: vine.number().optional(),
    sectionId: vine.number().optional().nullable(),
    departmentId: vine.number().optional().nullable(),
    status: vine.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).optional(),
    dueDate: vine.date().optional().nullable(),
  })
)