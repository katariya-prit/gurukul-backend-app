import vine from '@vinejs/vine'

export const lessonGrowthQueryValidator = vine.compile(
  vine.object({
    scope: vine.enum(['user', 'section', 'department', 'all'] as const),
    id: vine.number().positive().optional(),
    period: vine.enum(['week', 'month'] as const).optional(),
  })
)