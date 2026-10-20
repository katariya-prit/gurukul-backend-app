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
    usersByDepartment: typeof routes['departments.users_by_department']
    show: typeof routes['departments.show']
    update: typeof routes['departments.update']
    destroy: typeof routes['departments.destroy']
  }
  users: {
    pending: typeof routes['users.pending']
    bySection: typeof routes['users.by_section']
    index: typeof routes['users.index']
    approve: typeof routes['users.approve']
    destroy: typeof routes['users.destroy']
  }
  roles: {
    index: typeof routes['roles.index']
    store: typeof routes['roles.store']
    update: typeof routes['roles.update']
  }
  sections: {
    byDepartment: typeof routes['sections.by_department']
    index: typeof routes['sections.index']
    store: typeof routes['sections.store']
    show: typeof routes['sections.show']
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
  groups: {
    index: typeof routes['groups.index']
    byMember: typeof routes['groups.by_member']
    store: typeof routes['groups.store']
    show: typeof routes['groups.show']
    update: typeof routes['groups.update']
    destroy: typeof routes['groups.destroy']
  }
  overviews: {
    index: typeof routes['overviews.index']
    store: typeof routes['overviews.store']
    updateMetadata: typeof routes['overviews.update_metadata']
    destroy: typeof routes['overviews.destroy']
  }
  quotes: {
    createQuote: typeof routes['quotes.create_quote']
    getQuotesByType: typeof routes['quotes.get_quotes_by_type']
    updateQuote: typeof routes['quotes.update_quote']
    deleteQuote: typeof routes['quotes.delete_quote']
  }
  upload: {
    avatar: typeof routes['upload.avatar']
    section: typeof routes['upload.section']
  }
  lesson: {
    store: typeof routes['lesson.store']
    myLessons: typeof routes['lesson.my_lessons']
    created: typeof routes['lesson.created']
    destroy: typeof routes['lesson.destroy']
  }
}
