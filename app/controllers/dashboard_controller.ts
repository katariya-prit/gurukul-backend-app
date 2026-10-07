import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { dashboardStatsValidator } from '#validators/dashboard'

type Range = 'week' | 'month'
type TrendPoint = { label: string; value: number }

const getDateTrunc = (range: Range) => (range === 'week' ? 'day' : 'week')
const getIntervalClause = (range: Range) => (range === 'week' ? '7 days' : '30 days')

const allowedTables = new Set(['departments', 'users', 'roles'])
const allowedDateColumns = new Set(['created_at'])

async function getCumulativeTrend(
  table: string,
  dateColumn: string,
  range: Range,
  extraWhereClause?: string,
  extraParams: unknown[] = []
): Promise<TrendPoint[]> {
  if (!allowedTables.has(table) || !allowedDateColumns.has(dateColumn)) {
    throw new Error('Invalid dashboard trend source')
  }

  const days = range === 'week' ? 7 : 30
  const whereClause = extraWhereClause ? `AND ${extraWhereClause}` : ''

  const result = await db.rawQuery(
    `WITH date_scaffold AS (
         SELECT generate_series(
             CURRENT_DATE - INTERVAL '${days - 1} days',
             CURRENT_DATE,
             INTERVAL '1 day'
         )::date AS day
     )
     SELECT TO_CHAR(scaffold.day, 'DD Mon') AS label,
            (
                SELECT COUNT(*)
                FROM ${table} source
                WHERE source.${dateColumn} < scaffold.day + INTERVAL '1 day'
                ${whereClause}
            )::text AS value
     FROM date_scaffold scaffold
     ORDER BY scaffold.day ASC`,
    extraParams
  )

  const rows = result.rows as { label: string; value: string }[]
  return rows.map((row) => ({ label: row.label, value: Number(row.value) }))
}

const formatChartRows = (rows: { bucket: string; value: string }[]) =>
  rows.map((r) => ({
    label: new Date(r.bucket).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    value: Number(r.value),
  }))

export default class DashboardController {
  async stats({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(dashboardStatsValidator, {
        data: request.qs(),
      })

      const range: Range = payload.range ?? 'month'
      const { role, departmentId, sectionId, suid } = payload

      let data

      switch (role) {
        case 'SUPER_ADMIN':
          data = await this.getSuperAdminStats(range)
          break

        case 'STUDENT':
          if (!suid) {
            return response.badRequest({ success: false, message: 'suid જરૂરી છે.' })
          }
          data = await this.getStudentStats(suid)
          break

        default:
          if (sectionId) {
            data = await this.getSectionHeadStats(sectionId, range)
          } else if (departmentId) {
            data = await this.getDepartmentHeadStats(departmentId, range)
          } else {
            return response.badRequest({
              success: false,
              message: 'આ role માટે departmentId અથવા sectionId જરૂરી છે.',
            })
          }
      }

      return response.ok({ success: true, data })
    } catch (error: any) {
      if (error.messages) {
        return response.badRequest({ success: false, message: error.messages })
      }
      return response.internalServerError({
        success: false,
        message: error.message || 'Dashboard data fetch failed',
      })
    }
  }

  private async getSuperAdminStats(range: Range) {
    const [deptCount, userCount, roleCount, pendingCount] = await Promise.all([
      db.rawQuery(`SELECT COUNT(*)::int AS count FROM departments`),
      db.rawQuery(`SELECT COUNT(*)::int AS count FROM users WHERE status = 'APPROVED'`),
      db.rawQuery(`SELECT COUNT(*)::int AS count FROM roles`),
      db.rawQuery(`SELECT COUNT(*)::int AS count FROM users WHERE status = 'PENDING'`),
    ])

    const [departmentTrend, approvedUserTrend, roleTrend, pendingUserTrend, growth] = await Promise.all([
      getCumulativeTrend('departments', 'created_at', range),
      getCumulativeTrend('users', 'created_at', range, 'source.status = ?', ['APPROVED']),
      getCumulativeTrend('roles', 'created_at', range),
      getCumulativeTrend('users', 'created_at', range, 'source.status = ?', ['PENDING']),
      getCumulativeTrend('users', 'created_at', range),
    ])

    const roleDistribution = await db.rawQuery(
      `SELECT r.role_code, r.role_name, COUNT(u.suid)::int AS user_count
       FROM roles r
       LEFT JOIN users u ON u.role_code = r.role_code
       GROUP BY r.role_code, r.role_name
       ORDER BY user_count DESC`
    )

    const logs = await db.rawQuery(
      `(SELECT 'user'::text AS type, suid::text AS id,
               name || ' (' || role_code || ') joined as ' || status AS message,
               created_at
        FROM users)
       UNION ALL
       (SELECT 'department'::text AS type, department_id::text AS id,
               'New department created: ' || department_name AS message,
               created_at
        FROM departments)
       UNION ALL
       (SELECT 'section'::text AS type, section_id::text AS id,
               'New section created: ' || name AS message,
               created_at
        FROM sections)
       ORDER BY created_at DESC
       LIMIT 8`
    )

    return {
      cards: [
        { label: 'Total Departments', value: deptCount.rows[0].count, subLabel: 'Active Modules', trend: departmentTrend },
        { label: 'Total Active Users', value: userCount.rows[0].count, subLabel: 'Verified Accounts', trend: approvedUserTrend },
        { label: 'Total System Roles', value: roleCount.rows[0].count, subLabel: 'Configured Permissions', trend: roleTrend },
        { label: 'Pending Approvals', value: pendingCount.rows[0].count, subLabel: 'Awaiting review', trend: pendingUserTrend },
      ],
      chart: growth,
      roleDistribution: roleDistribution.rows.map((r: any) => ({
        roleCode: r.role_code,
        roleName: r.role_name,
        userCount: r.user_count,
      })),
      userStatus: {
        approved: userCount.rows[0].count,
        pending: pendingCount.rows[0].count,
      },
      logs: logs.rows.map((l: any) => ({
        id: `${l.type}-${l.id}`,
        message: l.message,
        timestamp: l.created_at,
      })),
    }
  }

  private async getDepartmentHeadStats(departmentId: number, range: Range) {
    const trunc = getDateTrunc(range)
    const interval = getIntervalClause(range)

    const [sectionCount, studentCount] = await Promise.all([
      db.rawQuery(`SELECT COUNT(*)::int AS count FROM sections WHERE department_id = ?`, [departmentId]),
      db.rawQuery(
        `SELECT COUNT(*)::int AS count FROM users WHERE department_id = ? AND role_code = 'STUDENT'`,
        [departmentId]
      ),
    ])

    const growth = await db.rawQuery(
      `SELECT DATE_TRUNC('${trunc}', created_at) AS bucket, COUNT(*)::text AS value
       FROM users
       WHERE department_id = ? AND created_at >= NOW() - INTERVAL '${interval}'
       GROUP BY bucket ORDER BY bucket ASC`,
      [departmentId]
    )

    return {
      cards: [
        { label: 'My Sections', value: sectionCount.rows[0].count, subLabel: 'Under this department' },
        { label: 'My Students', value: studentCount.rows[0].count, subLabel: 'Enrolled students' },
      ],
      chart: formatChartRows(growth.rows),
    }
  }

  private async getSectionHeadStats(sectionId: number, range: Range) {
    const trunc = getDateTrunc(range)
    const interval = getIntervalClause(range)

    const studentCount = await db.rawQuery(
      `SELECT COUNT(*)::int AS count FROM users WHERE section_id = ? AND role_code = 'STUDENT'`,
      [sectionId]
    )

    const growth = await db.rawQuery(
      `SELECT DATE_TRUNC('${trunc}', created_at) AS bucket, COUNT(*)::text AS value
       FROM users
       WHERE section_id = ? AND created_at >= NOW() - INTERVAL '${interval}'
       GROUP BY bucket ORDER BY bucket ASC`,
      [sectionId]
    )

    return {
      cards: [{ label: 'My Students', value: studentCount.rows[0].count, subLabel: 'In this section' }],
      chart: formatChartRows(growth.rows),
    }
  }

  private async getStudentStats(suid: number) {
    const user = await db.rawQuery(`SELECT joining_date FROM users WHERE suid = ?`, [suid])
    const joiningDate = user.rows[0]?.joining_date

    const daysSinceJoining = joiningDate
      ? Math.floor((Date.now() - new Date(joiningDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return {
      cards: [{ label: 'Days Since Joining', value: daysSinceJoining, subLabel: 'Your journey so far' }],
      chart: [] as { label: string; value: number }[],
    }
  }
}