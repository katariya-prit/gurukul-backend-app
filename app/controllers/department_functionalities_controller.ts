import type { HttpContext } from '@adonisjs/core/http'
import DepartmentFunctionalityService, {
  NotFoundError,
  ValidationError,
} from '#services/department_functionality_service'
import { syncDepartmentFunctionalitiesValidator } from '#validators/department_functionality'
import { errors as vineErrors } from '@vinejs/vine'

export default class DepartmentFunctionalitiesController {
  private service = new DepartmentFunctionalityService()

  public async list({ params, response }: HttpContext) {
    try {
      const departmentId = Number(params.departmentId)
      if (!departmentId) {
        return response.status(400).json({ success: false, message: 'Invalid department ID.' })
      }

      const data = await this.service.listForDepartment(departmentId)
      return response.status(200).json({ success: true, data })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  public async sync({ params, request, response }: HttpContext) {
    try {
      const departmentId = Number(params.departmentId)
      if (!departmentId) {
        return response.status(400).json({ success: false, message: 'Invalid department ID.' })
      }

      const payload = await request.validateUsing(syncDepartmentFunctionalitiesValidator)
      const result = await this.service.sync(departmentId, payload.functionalities)

      return response.status(200).json({
        success: true,
        message: 'Functionalities updated successfully.',
        data: result.data,
        meta: { enabledCount: result.enabledCount },
      })
    } catch (error) {
      return this.handleError(response, error)
    }
  }

  private handleError(response: HttpContext['response'], error: unknown) {
    if (error instanceof NotFoundError) {
      return response.status(404).json({ success: false, message: error.message })
    }
    if (error instanceof ValidationError) {
      return response.status(422).json({ success: false, message: error.message })
    }
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      const first = error.messages?.[0]
      const message =
        typeof first === 'object' && first !== null && 'message' in first
          ? String(first.message)
          : 'Validation failed.'
      return response.status(422).json({ success: false, message })
    }
    const e = error as Error
    return response.status(500).json({ success: false, message: e.message || 'Internal server error.' })
  }
}
