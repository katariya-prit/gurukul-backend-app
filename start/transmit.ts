import transmit from '@adonisjs/transmit/services/main'

transmit.authorize<{ userId: string }>('notifications/:userId', async (ctx, { userId }) => {
  await ctx.auth.check()
  return String(ctx.auth.user?.suid) === userId
})

transmit.authorize<{ userId: string }>('chat/:userId', async (ctx, { userId }) => {
  await ctx.auth.check()
  return String(ctx.auth.user?.suid) === userId
})
