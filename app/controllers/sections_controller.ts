import type { HttpContext } from '@adonisjs/core/http'
import Section from '#models/section'
import Department from '#models/department'
import { createSectionValidator, updateSectionValidator } from '#validators/section'

export default class SectionsController {
  /**
   * બધા sections લિસ્ટ કરો (Department info સાથે)
   */
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

  /**
   * Single section by ID
   */
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

  /**
   * Department પ્રમાણે sections
   */
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

  /**
   * નવું Section બનાવો
   */
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

  /**
   * Section update કરો
   */
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

  /**
   * Section delete કરો
   */
  async destroy({ params, response }: HttpContext) {
    const section = await Section.find(params.id)
    if (!section) {
      return response.notFound({ success: false, message: 'Section not found' })
    }

    await section.delete()

    return response.ok({ success: true, message: 'Section deleted successfully' })
  }
}   