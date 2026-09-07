import vine from '@vinejs/vine'

export const createLessonValidator = vine.compile(
  vine.object({
    lessonTitle: vine.string().trim().minLength(1).maxLength(255),
    lessonType: vine.enum(['video', 'audio', 'image', 'document'] as const),
    mediaUrl: vine.string().trim().optional().nullable(),
    mediaPublicId: vine.string().trim().optional().nullable(),
    description: vine.string().trim().optional().nullable(),
    departmentId: vine.number().optional().nullable(),
    dateStart: vine.date(),
    dateEnd: vine.date(),
    progressPoints: vine.number().optional(),
    roleCode: vine.string().trim().optional().nullable(),
    assignScope: vine
      .enum(['all', 'department', 'section', 'student', 'group'] as const)
      .optional(),
    assignDepartmentId: vine.number().optional().nullable(),
    assignSectionId: vine.number().optional().nullable(),
    assignStudentId: vine.number().optional().nullable(),
    assignGroupId: vine.number().optional().nullable(),
    assignHeadOnly: vine.boolean().optional(),
  })
)

export const updateLessonValidator = vine.compile(
  vine.object({
    lessonTitle: vine.string().trim().minLength(1).maxLength(255).optional(),
    lessonType: vine.enum(['video', 'audio', 'image', 'document'] as const).optional(),
    mediaUrl: vine.string().trim().optional().nullable(),
    mediaPublicId: vine.string().trim().optional().nullable(),
    description: vine.string().trim().optional().nullable(),
    departmentId: vine.number().optional().nullable(),
    dateStart: vine.date().optional(),
    dateEnd: vine.date().optional(),
    progressPoints: vine.number().optional(),
    roleCode: vine.string().trim().optional().nullable(),
    assignScope: vine
      .enum(['all', 'department', 'section', 'student', 'group'] as const)
      .optional(),
    assignDepartmentId: vine.number().optional().nullable(),
    assignSectionId: vine.number().optional().nullable(),
    assignStudentId: vine.number().optional().nullable(),
    assignGroupId: vine.number().optional().nullable(),
    assignHeadOnly: vine.boolean().optional(),
  })
)