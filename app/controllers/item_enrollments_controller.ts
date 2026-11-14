import type { HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import EnrollmentService, { ForbiddenError } from '#services/enrollment_service'
import { enrollStudentsValidator } from '#validators/functionality'
import { ValidationError } from '#services/item_service'

export default class ItemEnrollmentsController {
  private service = new EnrollmentService()

  public async enrollment({ params, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const itemId = Number(params.itemId || params.id)
      const data = await this.service.getEnrollment(user, itemId)

      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async updateEnrollment({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const itemId = Number(params.itemId || params.id)
      const payload = await request.validateUsing(enrollStudentsValidator)

      if (typeof payload.enrolled === 'boolean') {
        const data = await this.service.updateEnrollment(user, itemId, payload.studentSuids, payload.enrolled)
        return response.status(200).json({
          success: true,
          message: payload.enrolled ? 'Students enrolled successfully.' : 'Students unenrolled successfully.',
          data,
        })
      }

      const result = await this.service.enrollStudents(user, itemId, payload.studentSuids)
      return response.status(200).json({
        success: true,
        message: 'Enrollment updated successfully.',
        data: result,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async enrollments({ params, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const itemId = Number(params.itemId || params.id)
      const data = await this.service.getEnrollments(user, itemId)

      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async eligibleStudents({ params, request, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const itemId = Number(params.itemId || params.id)
      const search = request.input('search')
      const sectionId = request.input('sectionId') ? Number(request.input('sectionId')) : undefined

      const data = await this.service.getEligibleStudents(user, itemId, search, sectionId)
      return response.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async destroy({ params, response, auth }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const itemId = Number(params.itemId || params.id)
      const studentSuid = Number(params.studentSuid)

      const success = await this.service.deleteEnrollment(user, itemId, studentSuid)
      if (!success) {
        return response.status(404).json({
          success: false,
          message: 'Enrollment record was not found.',
        })
      }

      return response.status(200).json({
        success: true,
        message: 'Student unenrolled successfully.',
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  private handleError(response: HttpContext['response'], error: unknown) {
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return response.status(422).json({
        success: false,
        message: error.messages[0]?.message || 'Invalid input data.',
        errors: error.messages,
      })
    }

    if (error instanceof ForbiddenError) {
      return response.status(error.status).json({
        success: false,
        message: error.message,
      })
    }

    if (error instanceof ValidationError) {
      return response.status(error.status).json({
        success: false,
        message: error.message,
      })
    }

    const message = error instanceof Error ? error.message : 'Server error occurred.'
    return response.status(500).json({
      success: false,
      message,
    })
  }
}
