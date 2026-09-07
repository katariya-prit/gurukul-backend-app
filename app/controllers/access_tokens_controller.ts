import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'

export default class AccessTokensController {
  async store({ request, response }: HttpContext) {
    // Step 1: Validate input shape — these errors ARE specific
    // (e.g. "username field is required"), since they don't leak
    // anything about whether an account exists.
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

    // Step 2: Verify credentials — errors here stay GENERIC on purpose.
    // Never reveal whether it was the username or the password that
    // was wrong; that would let an attacker enumerate valid usernames.
    try {
      const user = await User.verifyCredentials(payload.username, payload.password)

      if (user.status !== 'APPROVED') {
        return response.status(403).json({
          success: false,
          message: 'Your account is not approved yet',
        })
      }

      await user.load('role')

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '7 days',
      })

      return response.status(200).json({
        success: true,
        message: 'Login successful',
        token: token.value!.release(),
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
      // access_tokens_controller.ts ma
    } catch (err) {
      console.error('Login error:', err)  // ← TEMPORARY, debug mate
      return response.status(401).json({
        success: false,
        message: 'Invalid username or password',
      })
    }
  }

  async destroy({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    return response.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  }
}