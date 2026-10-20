import type { HttpContext } from '@adonisjs/core/http'
import Department from '#models/department'
import User from '#models/user'
import { createDepartmentValidator, updateDepartmentValidator } from '#validators/department'

export default class DepartmentsController {
    // GET /departments
    public async index({ response }: HttpContext) {
        try {
            const departments = await Department.query()
                .preload('departmentHead')
                .orderBy('department_id', 'asc')

            const formatted = departments.map((dept) => {
                const json = dept.toJSON()
                return {
                    ...json,
                    departmentHeadName: dept.departmentHead?.name || null,
                }
            })

            return response.status(200).json({
                success: true,
                message: 'All departments fetched successfully.',
                data: formatted,
            })
        } catch (error: any) {
            return response.status(500).json({ success: false, message: error.message || 'Internal Server Error' })
        }
    }

    // POST /departments/create
    public async store({ request, response }: HttpContext) {
        console.log('✅ store reached, body:', request.body())
        try {
            const payload = await request.validateUsing(createDepartmentValidator)

            const newDept = await Department.create({
                departmentName: payload.departmentName,
                departmentHeadId: payload.departmentHeadId ?? null,
                description: payload.description ?? '',
            })

            return response.status(201).json({
                success: true,
                message: 'Department created successfully!',
                data: newDept,
            })
        } catch (error: any) {
            if (error.code === '23505') {
                return response.status(400).json({
                    success: false,
                    message: 'Department ID or name already exists.',
                })
            }
            if (error.code === '23503') {
                return response.status(400).json({ success: false, message: 'Selected Department Head does not exist.' })
            }
            if (error.messages) {
                return response.status(422).json({ success: false, message: 'Validation failed', errors: error.messages })
            }
            return response.status(500).json({ success: false, message: error.message || 'Internal Server Error' })
        }
    }

    // GET /departments/:id
    public async show({ params, response }: HttpContext) {
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

            const json = department.toJSON()
            return response.status(200).json({
                success: true,
                data: {
                    ...json,
                    departmentHeadName: department.departmentHead?.name || null,
                },
            })
        } catch (error: any) {
            return response.status(500).json({ success: false, message: error.message || 'Internal Server Error' })
        }
    }

    // PUT /departments/:id
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

            return response.status(200).json({
                success: true,
                message: 'Department updated successfully.',
                data: department,
            })
        } catch (error: any) {
            if (error.code === '23505') {
                return response.status(400).json({ success: false, message: 'Department name already exists.' })
            }
            if (error.code === '23503') {
                return response.status(400).json({ success: false, message: 'Selected Department Head does not exist.' })
            }
            if (error.messages) {
                return response.status(422).json({ success: false, message: 'Validation failed', errors: error.messages })
            }
            // 🎯 FIX: pehla 404 hatu, have 500 (unexpected error ne "not found" na kaho)
            return response.status(500).json({ success: false, message: error.message || 'Internal Server Error' })
        }
    }

    // DELETE /departments/delete/:id
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
        } catch (error: any) {
            return response.status(500).json({ success: false, message: error.message || 'Internal Server Error' })
        }
    }

    // GET /departments/:id/users
    public async usersByDepartment({ params, response }: HttpContext) {
        try {
            const deptId = Number(params.id)
            if (!deptId) {
                return response.status(400).json({ success: false, message: 'Invalid Department ID' })
            }

            // 🎯 FIX: DB column name (department_id) vaparyu, baki badhi queries sathe consistent
            const users = await User.query().where('department_id', deptId)

            return response.status(200).json({ success: true, data: users })
        } catch (error: any) {
            return response.status(500).json({ success: false, message: error.message || 'Internal Server Error' })
        }
    }
}