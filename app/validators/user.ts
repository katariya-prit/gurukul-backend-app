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

// 🔴 NEW — User update mate
export const updateUserValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).maxLength(255).optional(),
        username: vine.string().trim().minLength(1).maxLength(100).optional(),
        roleCode: vine.string().trim().minLength(1).maxLength(100).optional(),
        bod: vine.date().optional(),
        joiningDate: vine.date().optional(),
        // 🔒 Niche na be fields fakt SUPER_ADMIN j use kari shake (Controller ma check thay chhe)
        password: vine.string().minLength(6).optional(),
        suid: vine.number().positive().optional(),
    })
)