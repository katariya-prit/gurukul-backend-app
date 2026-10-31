import transmit from '@adonisjs/transmit/services/main'

transmit.authorize<{ roleCode: string }>('notifications/:roleCode', (ctx, { roleCode }) => {
  return ctx.auth.user?.roleCode === roleCode
})