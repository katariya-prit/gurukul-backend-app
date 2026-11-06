import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Department from '#models/department'
import { createSectionValidator, updateSectionValidator } from '#validators/section'

export default class SectionsController {
  async index({ response, auth }: HttpContext) {
    try {
      const currentUser = auth.getUserOrFail()
      const query = Section.query().preload('department').orderBy('section_id', 'asc')

      if (currentUser.roleCode === 'SUPER_ADMIN') {
        return response.ok({ success: true, data: await query })
      }

      if (
        !['HEAD100', 'SECHEAD101', 'STUDENT'].includes(currentUser.roleCode) ||
        !currentUser.departmentId ||
        (['SECHEAD101', 'STUDENT'].includes(currentUser.roleCode) && !currentUser.sectionId)
      ) {
        return response.forbidden({
          success: false,
          message: 'You cannot view sections outside your assigned scope.',
        })
      }

      query.where('departmentId', currentUser.departmentId)
      if (['SECHEAD101', 'STUDENT'].includes(currentUser.roleCode)) {
        query.where('sectionId', currentUser.sectionId!)
      }

      const sections = await query
      return response.ok({ success: true, data: sections })
    } catch (error: any) {
      return response.internalServerError({
        success: false,
        message: error.message || 'Internal Server Error',
      })
    }
  }

  async show({ params, response, auth }: HttpContext) {
    const section = await Section.query()
      .where('section_id', params.id)
      .preload('department')
      .first()

    if (!section) {
      return response.notFound({ success: false, message: 'Section not found' })
    }

    const currentUser = auth.getUserOrFail()
    const canView =
      currentUser.roleCode === 'SUPER_ADMIN' ||
      (currentUser.roleCode === 'HEAD100' &&
        Number(section.departmentId) === Number(currentUser.departmentId)) ||
      (['SECHEAD101', 'STUDENT'].includes(currentUser.roleCode) &&
        Number(section.sectionId) === Number(currentUser.sectionId))

    if (!canView) {
      return response.forbidden({
        success: false,
        message: 'You cannot view sections outside your assigned scope.',
      })
    }

    return response.ok({ success: true, data: section })
  }

  async byDepartment({ params, response, auth }: HttpContext) {
    try {
      const departmentId = Number(params.departmentId)
      const currentUser = auth.getUserOrFail()
      const canView =
        currentUser.roleCode === 'SUPER_ADMIN' ||
        (['HEAD100', 'SECHEAD101', 'STUDENT'].includes(currentUser.roleCode) &&
          departmentId === Number(currentUser.departmentId) &&
          (!['SECHEAD101', 'STUDENT'].includes(currentUser.roleCode) ||
            Boolean(currentUser.sectionId)))

      if (!canView) {
        return response.forbidden({
          success: false,
          message: 'You cannot view sections outside your assigned scope.',
        })
      }

      const query = Section.query().where('departmentId', departmentId).preload('department')
      if (['SECHEAD101', 'STUDENT'].includes(currentUser.roleCode)) {
        query.where('sectionId', currentUser.sectionId!)
      }
      const sections = await query

      return response.ok({ success: true, data: sections })
    } catch (error: any) {
      return response.badRequest({
        success: false,
        message: error.message || 'Failed to fetch sections',
      })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createSectionValidator)

      const department = await Department.find(payload.departmentId)
      if (!department) {
        return response.badRequest({
          success: false,
          message: 'Department ID માન્ય નથી.',
        })
      }

      const section = await Section.create({
        name: payload.name,
        departmentId: payload.departmentId,
        description: payload.description ?? null,
        sectionHeadId: payload.sectionHeadId ?? null,
      })

      return response.created({
        success: true,
        message: 'Section created successfully',
        data: section,
      })
    } catch (error: any) {
      return response.badRequest({
        success: false,
        message: error.messages ?? error.message ?? 'Failed to create section',
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const section = await Section.find(params.id)
      if (!section) {
        return response.notFound({ success: false, message: 'Section not found' })
      }

      const payload = await request.validateUsing(updateSectionValidator)

      if (payload.departmentId !== undefined) {
        const department = await Department.find(payload.departmentId)
        if (!department) {
          return response.badRequest({
            success: false,
            message: 'Department ID માન્ય નથી.',
          })
        }
        section.departmentId = payload.departmentId
      }

      if (payload.name !== undefined) {
        section.name = payload.name
      }

      if (payload.description !== undefined) {
        section.description = payload.description
      }

      if (payload.sectionHeadId !== undefined) {
        section.sectionHeadId = payload.sectionHeadId
      }

      await section.save()

      return response.ok({
        success: true,
        message: 'Section updated successfully',
        data: section,
      })
    } catch (error: any) {
      return response.badRequest({
        success: false,
        message: error.messages ?? error.message ?? 'Failed to update section',
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    const section = await Section.find(params.id)
    if (!section) {
      return response.notFound({ success: false, message: 'Section not found' })
    }

    await section.delete()

    return response.ok({ success: true, message: 'Section deleted successfully' })
  }
}
