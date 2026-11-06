import vine from '@vinejs/vine'

export const dashboardStatsValidator = vine.compile(
  vine.object({
    range: vine.enum(['week', 'month']).optional(),
  })
)
