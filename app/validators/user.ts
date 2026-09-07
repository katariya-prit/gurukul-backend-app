import vine from '@vinejs/vine'

export const signupValidator = vine.compile(
    vine.object({
        suid: vine.number().positive(),
        avatar: vine.string().trim().optional(),
        name: vine.string().trim().minLength(1).maxLength(255),
        username: vine.string().trim().minLength(1).maxLength(100),
        password: vine.string().minLength(6),
        bod: vine.date(),
        departmentId: vine.number().positive().nullable().optional(),
        sectionId: vine.number().positive().nullable().optional(),
        standardId: vine.number().positive().nullable().optional(),
        roleCode: vine.string().trim().minLength(1).maxLength(100),
        joiningDate: vine.date(),
        status: vine.enum(['PENDING', 'APPROVED']).optional(),
    })
)

export const loginValidator = vine.compile(
    vine.object({
        username: vine.string().trim().minLength(1),

        password: vine.string().minLength(1),
    })
)