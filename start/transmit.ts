import transmit from '@adonisjs/transmit/services/main'

async function checkChannelAuth(ctx: any, targetUserId: string, channelName: string): Promise<boolean> {
  try {
    let user = ctx.auth.use('api').user ?? ctx.auth.use('web').user
    if (!user) {
      try {
        user = await ctx.auth.use('api').authenticate()
      } catch {
        try {
          user = await ctx.auth.use('web').authenticate()
        } catch {
          // Unauthenticated
        }
      }
    }

    if (!user) {
      console.warn(`[Transmit Auth 401] Unauthorized subscription attempt to channel "${channelName}/${targetUserId}"`)
      return false
    }

    const mySuid = user.suid !== undefined ? String(user.suid) : ''
    const myId = user.id !== undefined ? String(user.id) : ''
    const allowed = mySuid === String(targetUserId) || myId === String(targetUserId)

    if (allowed) {
      console.log(`[Transmit Auth 200] User "${user.name}" (suid: ${mySuid}) authorized for "${channelName}/${targetUserId}"`)
    } else {
      console.warn(`[Transmit Auth 403] User "${user.name}" (suid: ${mySuid}) denied access to "${channelName}/${targetUserId}"`)
    }

    return allowed
  } catch (err) {
    console.error(`[Transmit Auth Error] Exception verifying auth for "${channelName}/${targetUserId}":`, err)
    return false
  }
}

transmit.authorize<{ userId: string }>('notifications/:userId', async (ctx, { userId }) => {
  return checkChannelAuth(ctx, userId, 'notifications')
})

transmit.authorize<{ userId: string }>('chat/:userId', async (ctx, { userId }) => {
  return checkChannelAuth(ctx, userId, 'chat')
})
