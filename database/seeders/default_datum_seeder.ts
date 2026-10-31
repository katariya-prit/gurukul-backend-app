import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    const roles = [
      {
        roleCode: 'HEAD100',
        roleName: 'department_head',
        description: null,
        permissions: {
          Users: { edit: false, view: false, create: false, delete: false },
          Student: { edit: false, view: true, create: true, delete: false },
          Dashboard: { edit: false, view: true, create: false, delete: false },
          Permissions: { edit: false, view: false, create: false, delete: false },
          DailyDarshan: { edit: false, view: false, create: false, delete: false },
          OverviewEdit: { edit: false, view: false, create: false, delete: false },
          AmrutNuAachaman: { edit: false, view: false, create: false, delete: false },
          RolesPermissions: { edit: false, view: false, create: false, delete: false },
          Group: { edit: false, view: true, create: true, delete: false },
          Progress: { edit: false, view: true, create: false, delete: false },
          MyLessons: { edit: false, view: true, create: false, delete: false },
          Lesson: { edit: false, view: true, create: true, delete: false },
          Activities: { edit: false, view: false, create: false, delete: false },
          UpcomingEvents: { edit: false, view: false, create: false, delete: false },
        },
      },
      {
        roleCode: 'SECHEAD101',
        roleName: 'section_head',
        description: 'Section Head - manages a specific section within a department',
        permissions: {
          Users: { edit: false, view: false, create: false, delete: false },
          Student: { edit: false, view: false, create: false, delete: false },
          Dashboard: { edit: false, view: true, create: false, delete: false },
          Permissions: { edit: false, view: false, create: false, delete: false },
          DailyDarshan: { edit: false, view: false, create: false, delete: false },
          OverviewEdit: { edit: false, view: false, create: false, delete: false },
          AmrutNuAachaman: { edit: false, view: false, create: false, delete: false },
          RolesPermissions: { edit: false, view: false, create: false, delete: false },
          Group: { edit: false, view: false, create: false, delete: false },
          Progress: { edit: false, view: true, create: false, delete: false },
          MyLessons: { edit: false, view: true, create: false, delete: false },
          Lesson: { edit: false, view: true, create: true, delete: false },
          Activities: { edit: false, view: false, create: false, delete: false },
          UpcomingEvents: { edit: false, view: false, create: false, delete: false },
        },
      },
      {
        roleCode: 'STUDENT',
        roleName: 'student',
        description: 'Student account - no admin panel access',
        permissions: {
          Progress: { edit: false, view: true, create: false, delete: false },
          MyLessons: { edit: false, view: true, create: false, delete: false },
          Lesson: { edit: false, view: false, create: false, delete: false },
          Group: { edit: false, view: false, create: false, delete: false },
          Activities: { edit: false, view: false, create: false, delete: false },
          UpcomingEvents: { edit: false, view: false, create: false, delete: false },
        },
      },
      {
        roleCode: 'SUPER_ADMIN',
        roleName: 'super-admin',
        description: null,
        permissions: {
          Users: { edit: true, view: true, create: true, delete: true },
          Section: { edit: true, view: true, create: true, delete: true },
          Student: { edit: true, view: true, create: true, delete: true },
          Dashboard: { edit: true, view: true, create: true, delete: true },
          Department: { edit: true, view: true, create: true, delete: true },
          Permissions: { edit: true, view: true, create: true, delete: true },
          DailyDarshan: { edit: true, view: true, create: true, delete: true },
          OverviewEdit: { edit: true, view: true, create: true, delete: true },
          AmrutNuAachaman: { edit: true, view: true, create: true, delete: true },
          RolesPermissions: { edit: true, view: true, create: true, delete: true },
          Group: { edit: true, view: true, create: true, delete: true },
          Progress: { edit: true, view: true, create: true, delete: true },
          MyLessons: { edit: true, view: true, create: true, delete: true },
          Lesson: { edit: true, view: true, create: true, delete: true },
          Activities: { edit: true, view: true, create: true, delete: true },
          UpcomingEvents: { edit: true, view: true, create: true, delete: true },
        },
      },
      {
        roleCode: 'USER',
        roleName: 'user',
        description: null,
        permissions: {
          Users: { edit: false, view: false, create: false, delete: false },
          Student: { edit: false, view: false, create: false, delete: false },
          Dashboard: { edit: false, view: true, create: false, delete: false },
          Permissions: { edit: false, view: false, create: false, delete: false },
          DailyDarshan: { edit: false, view: false, create: false, delete: false },
          OverviewEdit: { edit: false, view: false, create: false, delete: false },
          AmrutNuAachaman: { edit: false, view: false, create: false, delete: false },
          RolesPermissions: { edit: false, view: false, create: false, delete: false },
          Group: { edit: false, view: false, create: false, delete: false },
          Progress: { edit: false, view: true, create: false, delete: false },
          MyLessons: { edit: false, view: true, create: false, delete: false },
          Lesson: { edit: false, view: false, create: false, delete: false },
          Activities: { edit: false, view: false, create: false, delete: false },
          UpcomingEvents: { edit: false, view: false, create: false, delete: false },
        },
      },
    ]

    for (const role of roles) {
      await db.rawQuery(
        `
        INSERT INTO roles (role_code, role_name, description, permissions)
        VALUES (:roleCode, :roleName, :description, :permissions::jsonb)
        ON CONFLICT (role_code) DO UPDATE SET
          role_name = EXCLUDED.role_name,
          description = EXCLUDED.description,
          permissions = EXCLUDED.permissions
        `,
        {
          roleCode: role.roleCode,
          roleName: role.roleName,
          description: role.description,
          permissions: JSON.stringify(role.permissions),
        }
      )
    }

    // ============================================
    // SUPER ADMIN USER
    // ============================================
    const hashedAdminPassword = await hash.make('admin123')

    await db.rawQuery(
      `
      INSERT INTO users (suid, name, username, password, joining_date, status, role_code)
      VALUES (:suid, :name, :username, :password, CURRENT_DATE, :status, :roleCode)
      ON CONFLICT (suid) DO NOTHING
      `,
      {
        suid: 334512,
        name: 'Super Admin',
        username: 'super-admin',
        password: hashedAdminPassword,
        status: 'APPROVED',
        roleCode: 'SUPER_ADMIN',
      }
    )

    // ============================================
    // DEPARTMENTS, SECTIONS, HEADS & STUDENTS
    // ============================================

    const getOrCreateDepartment = async (name: string): Promise<number> => {
      const existing = await db.rawQuery(
        `SELECT department_id FROM departments WHERE department_name = :name`,
        { name }
      )
      if (existing.rows.length > 0) return existing.rows[0].department_id

      const inserted = await db.rawQuery(
        `INSERT INTO departments (department_name, description) VALUES (:name, :description) RETURNING department_id`,
        { name, description: null }
      )
      return inserted.rows[0].department_id
    }

    const getOrCreateSection = async (name: string, departmentId: number): Promise<number> => {
      const existing = await db.rawQuery(
        `SELECT section_id FROM sections WHERE name = :name AND department_id = :departmentId`,
        { name, departmentId }
      )
      if (existing.rows.length > 0) return existing.rows[0].section_id

      const inserted = await db.rawQuery(
        `INSERT INTO sections (name, department_id, description) VALUES (:name, :departmentId, :description) RETURNING section_id`,
        { name, departmentId, description: null }
      )
      return inserted.rows[0].section_id
    }

    // 🔴 FIX: password have har user mate alag — plainPassword param levo, dareak call par hash thay
    const createUser = async (user: {
      suid: number
      name: string
      username: string
      plainPassword: string
      roleCode: string
      departmentId?: number | null
      sectionId?: number | null
    }) => {
      const hashedPassword = await hash.make(user.plainPassword)

      await db.rawQuery(
        `
        INSERT INTO users (suid, name, username, password, joining_date, status, role_code, department_id, section_id)
        VALUES (:suid, :name, :username, :password, CURRENT_DATE, :status, :roleCode, :departmentId, :sectionId)
        ON CONFLICT (suid) DO NOTHING
        `,
        {
          suid: user.suid,
          name: user.name,
          username: user.username,
          password: hashedPassword,
          status: 'APPROVED',
          roleCode: user.roleCode,
          departmentId: user.departmentId ?? null,
          sectionId: user.sectionId ?? null,
        }
      )
    }

    // ---------- Departments ----------
    const musicId = await getOrCreateDepartment('Music')
    const gartId = await getOrCreateDepartment('G-ART')

    // ---------- Sections ----------
    const sargamId = await getOrCreateSection('Sargam', musicId)
    const ridhamId = await getOrCreateSection('Ridham', musicId)
    const videoEditingId = await getOrCreateSection('VideoEditing', gartId)
    const liveId = await getOrCreateSection('Live', gartId)

    // ---------- Department Heads (dareak no password alag) ----------
    await createUser({
      suid: 600001,
      name: 'desai tirth',
      username: 'tirth',
      plainPassword: 'tirth123',
      roleCode: 'HEAD100',
      departmentId: musicId,
    })
    await db.rawQuery(`UPDATE departments SET department_head_id = :suid WHERE department_id = :id`, {
      suid: 600001,
      id: musicId,
    })

    await createUser({
      suid: 600002,
      name: 'paradava shyambhai',
      username: 'shyambhai',
      plainPassword: 'shyambhai123',
      roleCode: 'HEAD100',
      departmentId: gartId,
    })
    await db.rawQuery(`UPDATE departments SET department_head_id = :suid WHERE department_id = :id`, {
      suid: 600002,
      id: gartId,
    })

    // ---------- Section Heads (dareak no password alag) ----------
    const sectionHeads = [
      { suid: 610001, name: 'katariya prit', username: 'prit', plainPassword: 'prit123', departmentId: musicId, sectionId: sargamId },
      { suid: 610002, name: 'hapaliya darshit', username: 'darshit', plainPassword: 'darshit123', departmentId: musicId, sectionId: ridhamId },
      { suid: 610003, name: 'marakana priyank', username: 'priyank', plainPassword: 'priyank123', departmentId: gartId, sectionId: videoEditingId },
      { suid: 610004, name: 'paradava shyambhai', username: 'shyambhai', plainPassword: 'shyambhai123', departmentId: gartId, sectionId: liveId },
    ]

    for (const head of sectionHeads) {
      await createUser({
        suid: head.suid,
        name: head.name,
        username: head.username,
        plainPassword: head.plainPassword,
        roleCode: 'SECHEAD101',
        departmentId: head.departmentId,
        sectionId: head.sectionId,
      })
      await db.rawQuery(`UPDATE sections SET section_head_id = :suid WHERE section_id = :id`, {
        suid: head.suid,
        id: head.sectionId,
      })
    }

    // ---------- Students (4 per section — ek section na badha students no password same) ----------
    const studentSections = [
      { prefix: 'sargam', startSuid: 620001, departmentId: musicId, sectionId: sargamId, label: 'Sargam', plainPassword: 'Sargam@Student1' },
      { prefix: 'ridham', startSuid: 620011, departmentId: musicId, sectionId: ridhamId, label: 'Ridham', plainPassword: 'Ridham@Student2' },
      { prefix: 'videoediting', startSuid: 620021, departmentId: gartId, sectionId: videoEditingId, label: 'VideoEditing', plainPassword: 'Video@Student3' },
      { prefix: 'live', startSuid: 620031, departmentId: gartId, sectionId: liveId, label: 'Live', plainPassword: 'Live@Student4' },
    ]

    for (const group of studentSections) {
      for (let i = 1; i <= 4; i++) {
        await createUser({
          suid: group.startSuid + (i - 1),
          name: `${group.label} Student ${i}`,
          username: `${group.prefix}_student_${i}`,
          plainPassword: group.plainPassword,
          roleCode: 'STUDENT',
          departmentId: group.departmentId,
          sectionId: group.sectionId,
        })
      }
    }

    const overviewImages = [
      {
        section: 'heroSlider',
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600',
        publicId: 'SEED-hero-1',
      },
      {
        section: 'heroSlider',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600',
        publicId: 'SEED-hero-2',
      },
      {
        section: 'heroSlider',
        url: 'https://images.unsplash.com/photo-1616080409883-a96ae084a7e1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        publicId: 'SEED-hero-3',
      },
    ]

    for (const image of overviewImages) {
      await db.rawQuery(
        `
        INSERT INTO overview_images (section, url, public_id)
        VALUES (:section, :url, :publicId)
        ON CONFLICT DO NOTHING
        `,
        image
      )
    }
  }
}