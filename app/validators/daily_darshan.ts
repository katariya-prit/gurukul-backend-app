import vine from '@vinejs/vine'

export const createDailyDarshanValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    imageUrl: vine.string().trim().minLength(1).maxLength(500),
    description: vine.string().trim().optional().nullable(),
    date: vine.date().optional(),
  })
)

export const updateDailyDarshanValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255).optional(),
    imageUrl: vine.string().trim().minLength(1).maxLength(500).optional(),
    description: vine.string().trim().optional().nullable(),
    date: vine.date().optional(),
  })
)