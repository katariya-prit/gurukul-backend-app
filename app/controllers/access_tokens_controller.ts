import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

export default class AccessTokensController {
  async store({ request, response, auth }: HttpContext) {
    let payload: { username: string; password: string }

    try {
      payload = await request.validateUsing(loginValidator)
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.status(422).json({
          success: false,
          message: error.messages[0]?.message || 'Invalid input',
          errors: error.messages,
        })
      }

      return response.status(422).json({
        success: false,
        message: 'Invalid input',
      })
    }

    try {
      const user = await User.verifyCredentials(payload.username, payload.password)

      if (user.status !== 'APPROVED') {
        return response.status(403).json({
          success: false,
          message: 'Your account is not approved yet',
        })
      }

      await user.load('role')
      await auth.use('web').login(user)

      return response.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          suid: user.suid,
          avatar: user.avatar,
          name: user.name,
          username: user.username,
          bod: user.bod,
          joiningDate: user.joiningDate,
          status: user.status,
          departmentId: user.departmentId,
          sectionId: user.sectionId,
          standardId: user.standardId,
          roleCode: user.roleCode,
          roleName: user.role?.roleName ?? null,
          permissions: user.role?.permissions ?? {},
        },
      })
    } catch (err) {
      console.error('Login error:', err)
      return response.status(401).json({
        success: false,
        message: 'Invalid username or password',
      })
    }
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()

    return response.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  }
}