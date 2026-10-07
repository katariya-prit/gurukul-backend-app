/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  newAccount: {
    store: typeof routes['new_account.store']
  }
  accessTokens: {
    store: typeof routes['access_tokens.store']
    destroy: typeof routes['access_tokens.destroy']
  }
  departments: {
    index: typeof routes['departments.index']
    store: typeof routes['departments.store']
    update: typeof routes['departments.update']
    show: typeof routes['departments.show']
    usersByDepartment: typeof routes['departments.users_by_department']
    destroy: typeof routes['departments.destroy']
  }
  users: {
    index: typeof routes['users.index']
    pending: typeof routes['users.pending']
    approve: typeof routes['users.approve']
    destroy: typeof routes['users.destroy']
    bySection: typeof routes['users.by_section']
  }
  roles: {
    index: typeof routes['roles.index']
    store: typeof routes['roles.store']
    update: typeof routes['roles.update']
  }
  sections: {
    index: typeof routes['sections.index']
    show: typeof routes['sections.show']
    byDepartment: typeof routes['sections.by_department']
    store: typeof routes['sections.store']
    update: typeof routes['sections.update']
    destroy: typeof routes['sections.destroy']
  }
  dashboard: {
    stats: typeof routes['dashboard.stats']
  }
  progress: {
    allDepartments: typeof routes['progress.all_departments']
    departmentProgress: typeof routes['progress.department_progress']
    sectionProgress: typeof routes['progress.section_progress']
    userProgress: typeof routes['progress.user_progress']
  }
  notifications: {
    index: typeof routes['notifications.index']
    markRead: typeof routes['notifications.mark_read']
  }
}
