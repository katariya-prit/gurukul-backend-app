import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import hash from '@adonisjs/core/services/hash'

export default class extends BaseSeeder {
  async run() {
    // ============================================
    // ROLES (role_code, role_name, description, permissions)
    // ============================================
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
    // Password hashed here manually since this is a raw insert
    // (bypasses the User model's withAuthFinder auto-hash hook).
    // ============================================
    const hashedPassword = await hash.make('admin123')

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
        password: hashedPassword,
        status: 'APPROVED',
        roleCode: 'SUPER_ADMIN',
      }
    )

    // ============================================
    // OVERVIEW IMAGES (hero slider seed data)
    // ============================================
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