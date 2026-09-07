import vine from '@vinejs/vine'

export const createOverviewImageValidator = vine.compile(
  vine.object({
    section: vine.enum(['heroSlider', 'featureImage', 'smartInfrastructure'] as const),
    url: vine.string().trim().minLength(1),
    publicId: vine.string().trim().minLength(1),
    title: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
  })
)

export const updateOverviewImageValidator = vine.compile(
  vine.object({
    section: vine.enum(['heroSlider', 'featureImage', 'smartInfrastructure'] as const).optional(),
    url: vine.string().trim().minLength(1).optional(),
    publicId: vine.string().trim().minLength(1).optional(),
    title: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
  })
)