import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'

export default class extends BaseSeeder {
  async run() {
    const findDepartment = async (name: string): Promise<number | null> => {
      const existing = await db.rawQuery(
        'SELECT department_id FROM departments WHERE lower(trim(department_name)) = lower(trim(:name)) LIMIT 1',
        { name }
      )
      if (existing.rows.length > 0) {
        return Number(existing.rows[0].department_id)
      }
      logger.warn(`skipped: department ${name} not found (not created)`)
      return null
    }

    const musicDeptId = await findDepartment('Music')
    const dancingDeptId = await findDepartment('Dancing')
    const computerDeptId = await findDepartment('Computer and Technology')
    const accountingDeptId = await findDepartment('Accounting')

    const functionalitiesData = [
      {
        key: 'instrumental_marking',
        name: 'Instrumental Marking',
        description: 'Instrumental Marking tools for department learning and assessment.',
        icon: 'music',
        themeColor: '#6366f1',
        evaluatorType: 'both' as const,
        deptId: musicDeptId,
        itemLabel: 'Instrument',
        items: [
          { name: 'Tabla', icon: 'music' },
          { name: 'Piano', icon: 'piano' },
          { name: 'Vocal', icon: 'music' },
        ],
      },
      {
        key: 'choreography_review',
        name: 'Choreography Review',
        description: 'Choreography Review tools for department learning and assessment.',
        icon: 'sparkles',
        themeColor: '#ec4899',
        evaluatorType: 'teacher' as const,
        deptId: dancingDeptId,
        itemLabel: 'Dance Form',
        items: [
          { name: 'Kathak', icon: 'sparkles' },
          { name: 'Garba', icon: 'sparkles' },
          { name: 'Contemporary', icon: 'sparkles' },
        ],
      },
      {
        key: 'coding_assessment',
        name: 'Coding Assessment',
        description: 'Coding Assessment tools for department learning and assessment.',
        icon: 'code',
        themeColor: '#06b6d4',
        evaluatorType: 'both' as const,
        deptId: computerDeptId,
        itemLabel: 'Skill',
        items: [
          { name: 'Python', icon: 'code' },
          { name: 'Web Design', icon: 'code' },
          { name: 'Networking', icon: 'code' },
        ],
      },
      {
        key: 'accounting_practice',
        name: 'Accounting Practice',
        description: 'Accounting Practice tools for department learning and assessment.',
        icon: 'calculator',
        themeColor: '#f59e0b',
        evaluatorType: 'ai' as const,
        deptId: accountingDeptId,
        itemLabel: 'Skill',
        items: [
          { name: 'Tally', icon: 'calculator' },
          { name: 'Ledger', icon: 'book-open' },
          { name: 'GST', icon: 'calculator' },
        ],
      },
    ]

    const rubricCriteria = [
      { key: 'accuracy', label: 'Accuracy', weight: 35, maxPoints: 35 },
      { key: 'technique', label: 'Technique', weight: 35, maxPoints: 35 },
      { key: 'expression', label: 'Expression', weight: 30, maxPoints: 30 },
    ]

    const levels = [
      { levelNo: 1, name: 'Beginner', minPoints: 0, promoteMode: 'auto' },
      { levelNo: 2, name: 'Intermediate', minPoints: 100, promoteMode: 'auto' },
      { levelNo: 3, name: 'Advanced', minPoints: 300, promoteMode: 'auto' },
      { levelNo: 4, name: 'Expert', minPoints: 600, promoteMode: 'auto' },
    ]

    for (const funcData of functionalitiesData) {
      await db.rawQuery(
        `
          INSERT INTO functionalities (
            key, name, description, icon, theme_color, evaluator_type, is_active
          )
          VALUES (
            :key, :name, :description, :icon, :themeColor, :evaluatorType, true
          )
          ON CONFLICT (key)
          DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon,
            theme_color = EXCLUDED.theme_color,
            evaluator_type = EXCLUDED.evaluator_type,
            is_active = EXCLUDED.is_active
        `,
        {
          key: funcData.key,
          name: funcData.name,
          description: funcData.description,
          icon: funcData.icon,
          themeColor: funcData.themeColor,
          evaluatorType: funcData.evaluatorType,
        }
      )

      if (funcData.deptId === null) {
        continue
      }

      const funcRow = await db.rawQuery('SELECT id FROM functionalities WHERE key = :key', {
        key: funcData.key,
      })
      const functionalityId = Number(funcRow.rows[0].id)

      await db.rawQuery(
        `
          INSERT INTO department_functionalities (
            department_id, functionality_id, item_label, is_enabled
          )
          VALUES (
            :departmentId, :functionalityId, :itemLabel, true
          )
          ON CONFLICT (department_id, functionality_id)
          DO UPDATE SET
            item_label = EXCLUDED.item_label,
            is_enabled = EXCLUDED.is_enabled
        `,
        {
          departmentId: funcData.deptId,
          functionalityId,
          itemLabel: funcData.itemLabel,
        }
      )

      for (const item of funcData.items) {
        await db.rawQuery(
          `
            INSERT INTO functionality_items (
              functionality_id, department_id, name, icon, is_active
            )
            VALUES (
              :functionalityId, :departmentId, :name, :icon, true
            )
            ON CONFLICT (department_id, functionality_id, name)
            DO UPDATE SET
              icon = EXCLUDED.icon,
              is_active = EXCLUDED.is_active
          `,
          {
            functionalityId,
            departmentId: funcData.deptId,
            name: item.name,
            icon: item.icon,
          }
        )

        const itemRow = await db.rawQuery(
          `
            SELECT id FROM functionality_items
            WHERE functionality_id = :functionalityId
              AND department_id = :departmentId
              AND name = :name
          `,
          {
            functionalityId,
            departmentId: funcData.deptId,
            name: item.name,
          }
        )
        const itemId = Number(itemRow.rows[0].id)

        await db.rawQuery(
          `
            INSERT INTO item_rubrics (
              item_id, version, criteria, max_points, is_current, created_by
            )
            VALUES (
              :itemId, 1, :criteria::jsonb, 100, true, null
            )
            ON CONFLICT (item_id, version)
            DO UPDATE SET
              criteria = EXCLUDED.criteria,
              max_points = EXCLUDED.max_points,
              is_current = EXCLUDED.is_current
          `,
          {
            itemId,
            criteria: JSON.stringify(rubricCriteria),
          }
        )

        for (const level of levels) {
          await db.rawQuery(
            `
              INSERT INTO item_levels (
                item_id, level_no, name, min_points, promote_mode
              )
              VALUES (
                :itemId, :levelNo, :name, :minPoints, :promoteMode
              )
              ON CONFLICT (item_id, level_no)
              DO UPDATE SET
                name = EXCLUDED.name,
                min_points = EXCLUDED.min_points,
                promote_mode = EXCLUDED.promote_mode
            `,
            {
              itemId,
              levelNo: level.levelNo,
              name: level.name,
              minPoints: level.minPoints,
              promoteMode: level.promoteMode,
            }
          )
        }

        for (const roleCode of ['HEAD100', 'SECHEAD101']) {
          await db.rawQuery(
            `
              INSERT INTO item_permissions (item_id, role_code)
              SELECT :itemId, :roleCode
              WHERE NOT EXISTS (
                SELECT 1 FROM item_permissions
                WHERE item_id = :itemId AND role_code = :roleCode
              )
            `,
            {
              itemId,
              roleCode,
            }
          )
        }
      }
    }

    const instrumentalRow = await db.rawQuery(
      'SELECT id FROM functionalities WHERE key = :key',
      { key: 'instrumental_marking' }
    )
    const choreographyRow = await db.rawQuery(
      'SELECT id FROM functionalities WHERE key = :key',
      { key: 'choreography_review' }
    )

    const instrumentalId = Number(instrumentalRow.rows[0].id)
    const choreographyId = Number(choreographyRow.rows[0].id)

    const tablaRow = await db.rawQuery(
      'SELECT id FROM functionality_items WHERE name = :name AND functionality_id = :functionalityId',
      { name: 'Tabla', functionalityId: instrumentalId }
    )
    const tablaId = tablaRow.rows[0]?.id ? Number(tablaRow.rows[0].id) : null

    const widgetsData = [
      {
        functionalityId: instrumentalId,
        itemId: null,
        widgetType: 'levelBadge',
        title: 'Current Level',
        config: { showPoints: true },
        roles: ['STUDENT'],
        sortOrder: 1,
      },
      {
        functionalityId: instrumentalId,
        itemId: tablaId,
        widgetType: 'recentMarks',
        title: 'Recent Marks',
        config: { limit: 5 },
        roles: ['STUDENT', 'HEAD100'],
        sortOrder: 2,
      },
      {
        functionalityId: choreographyId,
        itemId: null,
        widgetType: 'growthChart',
        title: 'Growth',
        config: { period: 'month' },
        roles: ['STUDENT'],
        sortOrder: 3,
      },
    ]

    for (const widget of widgetsData) {
      const existing = await db.rawQuery(
        `
          SELECT id FROM dashboard_widgets
          WHERE functionality_id = :functionalityId
            AND title = :title
        `,
        {
          functionalityId: widget.functionalityId,
          title: widget.title,
        }
      )

      if (existing.rows.length === 0) {
        await db.rawQuery(
          `
            INSERT INTO dashboard_widgets (
              functionality_id, item_id, widget_type, title, config, roles, sort_order, is_active
            )
            VALUES (
              :functionalityId, :itemId, :widgetType, :title, :config::jsonb, :roles::jsonb, :sortOrder, true
            )
          `,
          {
            functionalityId: widget.functionalityId,
            itemId: widget.itemId,
            widgetType: widget.widgetType,
            title: widget.title,
            config: JSON.stringify(widget.config),
            roles: JSON.stringify(widget.roles),
            sortOrder: widget.sortOrder,
          }
        )
      } else {
        await db.rawQuery(
          `
            UPDATE dashboard_widgets
            SET
              item_id = :itemId,
              widget_type = :widgetType,
              config = :config::jsonb,
              roles = :roles::jsonb,
              sort_order = :sortOrder,
              is_active = true
            WHERE id = :id
          `,
          {
            id: Number(existing.rows[0].id),
            itemId: widget.itemId,
            widgetType: widget.widgetType,
            config: JSON.stringify(widget.config),
            roles: JSON.stringify(widget.roles),
            sortOrder: widget.sortOrder,
          }
        )
      }
    }
  }
}
