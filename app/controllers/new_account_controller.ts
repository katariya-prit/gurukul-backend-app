import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

const ROLE_FIELD_REQUIREMENTS: Record<string, string[]> = {
    SUPER_ADMIN: [],
    HEAD100: ['departmentId'],
    SECHEAD101: ['departmentId', 'sectionId'],
    STUDENT: ['departmentId', 'sectionId', 'standardId'],
}

export default class NewAccountController {
    async store({ request, response }: HttpContext) {
        try {
            const data = await request.validateUsing(signupValidator)

            const requiredForRole =
                ROLE_FIELD_REQUIREMENTS[data.roleCode] || []

            const roleMissing: string[] = []

            if (
                requiredForRole.includes('departmentId') &&
                !data.departmentId
            ) {
                roleMissing.push('departmentId')
            }

            if (
                requiredForRole.includes('sectionId') &&
                !data.sectionId
            ) {
                roleMissing.push('sectionId')
            }

            if (
                requiredForRole.includes('standardId') &&
                !data.standardId
            ) {
                roleMissing.push('standardId')
            }

            if (roleMissing.length > 0) {
                return response.status(400).json({
                    success: false,
                    message: `"${data.roleCode}" role માટે આ fields જરૂરી છે: ${roleMissing.join(', ')}`,
                })
            }

            const status =
                data.username === 'super-admin'
                    ? 'APPROVED'
                    : data.status || 'PENDING'

            const user = await User.create({
                suid: data.suid,
                avatar: data.avatar,
                name: data.name,
                username: data.username,
                password: data.password,
                bod: data.bod,
                departmentId: data.departmentId || null,
                sectionId: data.sectionId || null,
                standardId: data.standardId || null,
                roleCode: data.roleCode,
                joiningDate: data.joiningDate,
                status,
            })

            const token = await User.accessTokens.create(user)

            return response.status(201).json({
                success: true,
                message: 'User created successfully',
                token: token.value!.release(),
                data: {
                    suid: user.suid,
                    avatar: user.avatar,
                    name: user.name,
                    username: user.username,
                    bod: user.bod,
                    departmentId: user.departmentId,
                    sectionId: user.sectionId,
                    standardId: user.standardId,
                    roleCode: user.roleCode,
                    joiningDate: user.joiningDate,
                    status: user.status,
                },
            })
        } catch (error: any) {
            if (error.code === '23505') {
                return response.status(400).json({
                    success: false,
                    message: 'Username or SUID already exists',
                })
            }

            // 🎯 Validation errors ne detail sathe return karo
            if (error.messages) {
                return response.status(422).json({
                    success: false,
                    message: 'Validation failure',
                    errors: error.messages,
                })
            }

            return response.status(400).json({
                success: false,
                message: error.message || 'Failed to create user',
            })
        }
    }
}