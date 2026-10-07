import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Department from '#models/department'
import { createSectionValidator, updateSectionValidator } from '#validators/section'

export default class SectionsController {
  async index({ response }: HttpContext) {
    try {
      const sections = await Section.query()
        .preload('department')
        .orderBy('section_id', 'asc')

      return response.ok({ success: true, data: sections })
    } catch (error: any) {
      return response.internalServerError({
        success: false,
        message: error.message || 'Internal Server Error',
      })
    }
  }

  async show({ params, response }: HttpContext) {
    const section = await Section.query()
      .where('section_id', params.id)
      .preload('department')
      .first()

    if (!section) {
      return response.notFound({ success: false, message: 'Section not found' })
    }

    return response.ok({ success: true, data: section })
  }

  async byDepartment({ params, response }: HttpContext) {
    try {
      const sections = await Section.query()
        .where('department_id', params.departmentId)
        .preload('department')

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