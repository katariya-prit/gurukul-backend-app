import env from '#start/env'

export function redisConnectionOptions() {
  const connectionString = env.get('REDIS_URL')
  if (!connectionString) {
    return { host: '127.0.0.1', port: 6379, lazyConnect: true }
  }

  const url = new URL(connectionString)
  const database = url.pathname.replace(/^\//, '')
  return {
    host: url.hostname,
    port: Number(url.port || (url.protocol === 'rediss:' ? 6380 : 6379)),
    ...(url.username ? { username: decodeURIComponent(url.username) } : {}),
    ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
    ...(database ? { db: Number(database) } : {}),
    ...(url.protocol === 'rediss:' ? { tls: {} } : {}),
    lazyConnect: true,
  }
}
