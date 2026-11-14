import vine from '@vinejs/vine'

const noDuplicateFunctionalityIds = vine.createRule((value, _, field) => {
  if (!Array.isArray(value)) return
  const seen = new Set<number>()
  for (const item of value as Array<{ functionalityId: number }>) {
    const id = Number(item.functionalityId)
    if (seen.has(id)) {
      field.report('Duplicate functionality in request', 'duplicate_functionality_id', field)
      return
    }
    seen.add(id)
  }
})

export const syncDepartmentFunctionalitiesValidator = vine.compile(
  vine.object({
    functionalities: vine
      .array(
        vine.object({
          functionalityId: vine.number().positive().withoutDecimals(),
          isEnabled: vine.boolean(),
          itemLabel: vine.string().trim().maxLength(50).optional(),
        })
      )
      .maxLength(100)
      .use(noDuplicateFunctionalityIds()),
  })
)
