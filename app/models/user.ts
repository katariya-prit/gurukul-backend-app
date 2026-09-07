import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Role from '#models/role'

export default class User extends compose(
  UserSchema,
  withAuthFinder(hash, {
    uids: ['username'],
    passwordColumnName: 'password',
  })
) {
  static accessTokens = DbAccessTokensProvider.forModel(User)

  declare currentAccessToken?: AccessToken

  // roles.role_code is the primary key (not "id"), so both
  // foreignKey and localKey are set to roleCode explicitly.
  @belongsTo(() => Role, {
    foreignKey: 'roleCode',
    localKey: 'roleCode',
  })
  declare role: BelongsTo<typeof Role>
}