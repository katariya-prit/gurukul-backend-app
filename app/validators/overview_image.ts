import vine from '@vinejs/vine'

export const VALID_SECTIONS = ['heroSlider', 'featureImage', 'smartInfrastructure'] as const

export const createOverviewValidator = vine.compile(
  vine.object({
    section: vine.enum(VALID_SECTIONS),
    url: vine.string().trim().minLength(1),
    publicId: vine.string().trim().minLength(1),
    title: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
  })
)

export const updateOverviewMetadataValidator = vine.compile(
  vine.object({
    title: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
  })
)