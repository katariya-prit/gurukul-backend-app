import vine from '@vinejs/vine'

export const createQuoteValidator = vine.compile(
  vine.object({
    type: vine.enum(['activity', 'event'] as const),
    imageUrl: vine.string().trim().minLength(1),
    publicId: vine.string().trim().minLength(1),
    title: vine.string().trim().optional(),
    description: vine.string().trim().optional().nullable(),
    eventDate: vine.date(),
    name: vine.string().trim().minLength(1),
    displayStartDate: vine.date().optional().nullable(),
    displayEndDate: vine.date().optional().nullable(),
    eventStartDate: vine.date().optional().nullable(),
    eventEndDate: vine.date().optional().nullable(),
    isApproved: vine.enum(['Approved', 'Rejected', 'Pending'] as const).optional(),
    status: vine.enum(['Active', 'Inactive'] as const).optional(),
    addToHero: vine.enum(['Yes', 'No'] as const).optional(),
  })
)

export const updateQuoteValidator = vine.compile(
  vine.object({
    type: vine.enum(['activity', 'event'] as const).optional(),
    imageUrl: vine.string().trim().minLength(1).optional(),
    publicId: vine.string().trim().minLength(1).optional(),
    title: vine.string().trim().optional(),
    description: vine.string().trim().optional().nullable(),
    eventDate: vine.date().optional(),
    name: vine.string().trim().minLength(1).optional(),
    displayStartDate: vine.date().optional().nullable(),
    displayEndDate: vine.date().optional().nullable(),
    eventStartDate: vine.date().optional().nullable(),
    eventEndDate: vine.date().optional().nullable(),
    isApproved: vine.enum(['Approved', 'Rejected', 'Pending'] as const).optional(),
    status: vine.enum(['Active', 'Inactive'] as const).optional(),
    addToHero: vine.enum(['Yes', 'No'] as const).optional(),
  })
)