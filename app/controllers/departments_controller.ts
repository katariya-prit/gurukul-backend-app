import type { HttpContext } from '@adonisjs/core/http'
import Department from '#models/department'
import User from '#models/user'
import { createDepartmentValidator, updateDepartmentValidator } from '#validators/department'
import DepartmentFunctionalityService from '#services/department_functionality_service'

const deptFuncService = new DepartmentFunctionalityService()

export default class DepartmentsController {
  public async index({ response, auth }: HttpContext) {
    try {
      const currentUser = auth.getUserOrFail()
      const query = Department.query().preload('departmentHead').orderBy('department_id', 'asc')

      let departments: Department[]

      if (currentUser.roleCode === 'SUPER_ADMIN') {
        departments = await query
      } else if (
        ['HEAD100', 'SECHEAD101', 'STUDENT'].includes(currentUser.roleCode) &&
        currentUser.departmentId
      ) {
        departments = await query.where('department_id', currentUser.departmentId)
      } else {
        return response.forbidden({
          success: false,
          message: 'You cannot view departments outside your assigned scope.',
        })
      }

      const deptIds = departments.map((d) => d.departmentId)
      const funcMap = await deptFuncService.getEnabledCountForDepartments(deptIds)

      const formatted = departments.map((dept) => {
        const json = dept.toJSON()
        const funcEntry = funcMap.get(dept.departmentId)
        return {
          ...json,
          id: dept.departmentId,
          department_id: dept.departmentId,
          departmentHeadName: dept.departmentHead?.name ?? null,
          functionalityCount: funcEntry?.count ?? 0,
          functionalities: funcEntry?.items ?? [],
        }
      })

      return response.status(200).json({
        success: true,
        message: 'All departments fetched successfully.',
        data: formatted,
      })
    } catch (error: unknown) {
      const e = error as Error
      return response.status(500).json({ success: false, message: e.message || 'Internal Server Error' })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createDepartmentValidator)

      const newDept = await Department.create({
        departmentName: payload.departmentName,
        departmentHeadId: payload.departmentHeadId ?? null,
        description: payload.description ?? '',
      })

      const json = newDept.toJSON()

      return response.status(201).json({
        success: true,
        message: 'Department created successfully!',
        data: {
          ...json,
          id: newDept.departmentId,
          department_id: newDept.departmentId,
          departmentId: newDept.departmentId,
          functionalityCount: 0,
          functionalities: [],
        },
      })
    } catch (error: unknown) {
      const e = error as NodeJS.ErrnoException & { messages?: unknown }
      if (e.code === '23505') {
        return response.status(400).json({ success: false, message: 'Department ID or name already exists.' })
      }
      if (e.code === '23503') {
        return response.status(400).json({ success: false, message: 'Selected Department Head does not exist.' })
      }
      if (e.messages) {
        return response.status(422).json({ success: false, message: 'Validation failed', errors: e.messages })
      }
      return response.status(500).json({ success: false, message: e.message || 'Internal Server Error' })
    }
  }

  public async show({ params, response, auth }: HttpContext) {
    try {
      const deptId = Number(params.id)
      if (!deptId) {
        return response.status(400).json({ success: false, message: 'Invalid ID' })
      }

      const department = await Department.query()
        .where('department_id', deptId)
        .preload('departmentHead')
        .first()

      if (!department) {
        return response.status(404).json({ success: false, message: 'Department not found.' })
      }

      const currentUser = auth.getUserOrFail()
      if (
        currentUser.roleCode !== 'SUPER_ADMIN' &&
        (!['HEAD100', 'SECHEAD101', 'STUDENT'].includes(currentUser.roleCode) ||
          deptId !== Number(currentUser.departmentId))
      ) {
        return response.forbidden({
          success: false,
          message: 'You cannot view departments outside your assigned scope.',
        })
      }

      const funcMap = await deptFuncService.getEnabledCountForDepartments([deptId])
      const funcEntry = funcMap.get(deptId)
      const json = department.toJSON()

      return response.status(200).json({
        success: true,
        data: {
          ...json,
          id: department.departmentId,
          department_id: department.departmentId,
          departmentHeadName: department.departmentHead?.name ?? null,
          functionalityCount: funcEntry?.count ?? 0,
          functionalities: funcEntry?.items ?? [],
        },
      })
    } catch (error: unknown) {
      const e = error as Error
      return response.status(500).json({ success: false, message: e.message || 'Internal Server Error' })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const departmentId = Number(params.id)
      if (!departmentId) {
        return response.status(400).json({ success: false, message: 'Invalid ID' })
      }

      const department = await Department.find(departmentId)
      if (!department) {
        return response.status(404).json({ success: false, message: 'Department not found.' })
      }

      const payload = await request.validateUsing(updateDepartmentValidator)

      department.merge({
        departmentName: payload.departmentName ?? department.departmentName,
        departmentHeadId:
          payload.departmentHeadId !== undefined ? payload.departmentHeadId : department.departmentHeadId,
        description: payload.description !== undefined ? payload.description : department.description,
      })

      await department.save()

      const funcMap = await deptFuncService.getEnabledCountForDepartments([departmentId])
      const funcEntry = funcMap.get(departmentId)
      const json = department.toJSON()

      return response.status(200).json({
        success: true,
        message: 'Department updated successfully.',
        data: {
          ...json,
          id: department.departmentId,
          department_id: department.departmentId,
          departmentId: department.departmentId,
          functionalityCount: funcEntry?.count ?? 0,
          functionalities: funcEntry?.items ?? [],
        },
      })
    } catch (error: unknown) {
      const e = error as NodeJS.ErrnoException & { messages?: unknown; code?: string }
      if (e.code === '23505') {
        return response.status(400).json({ success: false, message: 'Department name already exists.' })
      }
      if (e.code === '23503') {
        return response.status(400).json({ success: false, message: 'Selected Department Head does not exist.' })
      }
      if (e.messages) {
        return response.status(422).json({ success: false, message: 'Validation failed', errors: e.messages })
      }
      return response.status(500).json({ success: false, message: e.message || 'Internal Server Error' })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const deptId = Number(params.id)
      if (!deptId) {
        return response.status(400).json({ success: false, message: 'Invalid ID' })
      }

      const department = await Department.find(deptId)
      if (!department) {
        return response.status(404).json({ success: false, message: 'Department not found.' })
      }

      await department.delete()

      return response.status(200).json({
        success: true,
        message: 'Department deleted successfully.',
        data: department,
      })
    } catch (error: unknown) {
      const e = error as Error
      return response.status(500).json({ success: false, message: e.message || 'Internal Server Error' })
    }
  }

  public async usersByDepartment({ params, response, auth }: HttpContext) {
    try {
      const deptId = Number(params.id)
      if (!deptId) {
        return response.status(400).json({ success: false, message: 'Invalid Department ID' })
      }

      const currentUser = auth.getUserOrFail()
      const canView =
        currentUser.roleCode === 'SUPER_ADMIN' ||
        (currentUser.roleCode === 'HEAD100' && deptId === Number(currentUser.departmentId)) ||
        (currentUser.roleCode === 'SECHEAD101' &&
          deptId === Number(currentUser.departmentId) &&
          Number(currentUser.sectionId) > 0)

      if (!canView) {
        return response.forbidden({
          success: false,
          message: 'You cannot view users outside your assigned scope.',
        })
      }

      const query = User.query()
        .select('suid', 'avatar', 'name', 'username', 'departmentId', 'sectionId', 'roleCode')
        .where('departmentId', deptId)

      if (currentUser.roleCode === 'SECHEAD101') {
        query.where('sectionId', currentUser.sectionId!)
      }

      const users = await query

      return response.status(200).json({ success: true, data: users })
    } catch (error: unknown) {
      const e = error as Error
      return response.status(500).json({ success: false, message: e.message || 'Internal Server Error' })
    }
  }
}
