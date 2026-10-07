import vine from '@vinejs/vine'

export const dashboardStatsValidator = vine.compile(
  vine.object({
    role: vine.string().trim(),
    range: vine.enum(['week', 'month']).optional(),
    departmentId: vine.number().optional(),
    sectionId: vine.number().optional(),
    suid: vine.number().optional(),
  })
)