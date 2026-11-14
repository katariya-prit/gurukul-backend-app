import vine from '@vinejs/vine'

const rubricCriteriaRule = vine.createRule((value, _, field) => {
  if (!Array.isArray(value)) return
  const keys = new Set<string>()
  let weightSum = 0
  for (const c of value as Array<{ key: string; label: string; weight: number; maxPoints: number }>) {
    if (keys.has(c.key)) {
      field.report('Criterion keys must be unique', 'unique_keys', field)
      return
    }
    keys.add(c.key)
    weightSum += Number(c.weight || 0)
    if (c.maxPoints < 0) {
      field.report('Criterion maxPoints must be greater than or equal to 0', 'min_points', field)
      return
    }
  }
  if (weightSum !== 100) {
    field.report('Rubric weights must sum exactly to 100', 'weight_sum', field)
  }
})

const levelRules = vine.createRule((value, _, field) => {
  if (!Array.isArray(value) || value.length === 0) {
    field.report('At least one level is required', 'levels_required', field)
    return
  }
  const levelNos = new Set<number>()
  let prevMinPoints = -1
  const sorted = [...(value as Array<{ levelNo: number; name: string; minPoints: number; promoteMode: string }>)]
  sorted.sort((a, b) => a.levelNo - b.levelNo)
  for (let i = 0; i < sorted.length; i++) {
    const lvl = sorted[i]
    if (levelNos.has(lvl.levelNo)) {
      field.report('Level numbers must be unique', 'unique_level_no', field)
      return
    }
    levelNos.add(lvl.levelNo)
    if (i === 0 && lvl.minPoints !== 0) {
      field.report('First level minPoints must be 0', 'first_level_zero', field)
      return
    }
    if (lvl.minPoints <= prevMinPoints && i > 0) {
      field.report('Level minPoints must be strictly increasing', 'increasing_min_points', field)
      return
    }
    prevMinPoints = lvl.minPoints
  }
})

export const createFunctionalityValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(150),
    key: vine.string().trim().minLength(1).maxLength(100),
    description: vine.string().trim().nullable().optional(),
    icon: vine.string().trim().nullable().optional(),
    themeColor: vine.string().trim().nullable().optional(),
    evaluatorType: vine.enum(['ai', 'teacher', 'both']),
    isActive: vine.boolean().optional(),
  })
)

export const updateFunctionalityValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(150).optional(),
    key: vine.string().trim().minLength(1).maxLength(100).optional(),
    description: vine.string().trim().nullable().optional(),
    icon: vine.string().trim().nullable().optional(),
    themeColor: vine.string().trim().nullable().optional(),
    evaluatorType: vine.enum(['ai', 'teacher', 'both']).optional(),
    isActive: vine.boolean().optional(),
  })
)

export const activeToggleValidator = vine.compile(
  vine.object({
    isActive: vine.boolean(),
  })
)

export const departmentAssignmentValidator = vine.compile(
  vine.object({
    functionalityId: vine.number().positive().optional(),
    departmentId: vine.number().positive().optional(),
    itemLabel: vine.string().trim().minLength(1).maxLength(50).optional(),
    isEnabled: vine.boolean().optional(),
  })
)

export const bulkDepartmentAssignmentValidator = vine.compile(
  vine.object({
    departments: vine.array(
      vine.object({
        departmentId: vine.number().positive(),
        itemLabel: vine.string().trim().minLength(1).maxLength(50),
        isEnabled: vine.boolean(),
      })
    ),
  })
)

export const bulkFunctionalityAssignmentValidator = vine.compile(
  vine.object({
    functionalities: vine.array(
      vine.object({
        functionalityId: vine.number().positive(),
        itemLabel: vine.string().trim().minLength(1).maxLength(50),
        isEnabled: vine.boolean(),
      })
    ),
  })
)

export const createItemValidator = vine.compile(
  vine.object({
    departmentId: vine.number().positive(),
    name: vine.string().trim().minLength(1).maxLength(150),
    icon: vine.string().trim().nullable().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateItemValidator = vine.compile(
  vine.object({
    departmentId: vine.number().positive().optional(),
    name: vine.string().trim().minLength(1).maxLength(150).optional(),
    icon: vine.string().trim().nullable().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const saveRubricValidator = vine.compile(
  vine.object({
    criteria: vine
      .array(
        vine.object({
          key: vine.string().trim().minLength(1).maxLength(100),
          label: vine.string().trim().minLength(1).maxLength(150),
          weight: vine.number().min(0).max(100),
          maxPoints: vine.number().min(0),
        })
      )
      .use(rubricCriteriaRule()),
    maxPoints: vine.number().min(0).optional(),
  })
)

export const saveLevelsValidator = vine.compile(
  vine.object({
    levels: vine
      .array(
        vine.object({
          levelNo: vine.number().positive(),
          name: vine.string().trim().minLength(1).maxLength(100),
          minPoints: vine.number().min(0),
          promoteMode: vine.enum(['auto', 'manual']),
        })
      )
      .use(levelRules()),
  })
)

export const savePermissionsValidator = vine.compile(
  vine.object({
    roleCodes: vine.array(vine.string().trim()).optional(),
    sectionIds: vine.array(vine.number().positive()).optional(),
    userSuids: vine.array(vine.number().positive()).optional(),
  })
)

export const enrollStudentsValidator = vine.compile(
  vine.object({
    studentSuids: vine.array(vine.number().positive()),
    enrolled: vine.boolean().optional(),
  })
)

export const createWidgetValidator = vine.compile(
  vine.object({
    functionalityId: vine.number().positive(),
    itemId: vine.number().positive().nullable().optional(),
    widgetType: vine.enum(['levelBadge', 'progressRing', 'recentMarks', 'growthChart', 'itemStats']),
    title: vine.string().trim().minLength(1).maxLength(150),
    config: vine.record(vine.any()),
    roles: vine.array(vine.string().trim()).optional(),
    sortOrder: vine.number().optional(),
    isActive: vine.boolean().optional(),
  })
)

export const updateWidgetValidator = vine.compile(
  vine.object({
    functionalityId: vine.number().positive().optional(),
    itemId: vine.number().positive().nullable().optional(),
    widgetType: vine.enum(['levelBadge', 'progressRing', 'recentMarks', 'growthChart', 'itemStats']).optional(),
    title: vine.string().trim().minLength(1).maxLength(150).optional(),
    config: vine.record(vine.any()).optional(),
    roles: vine.array(vine.string().trim()).optional(),
    sortOrder: vine.number().optional(),
    isActive: vine.boolean().optional(),
  })
)
