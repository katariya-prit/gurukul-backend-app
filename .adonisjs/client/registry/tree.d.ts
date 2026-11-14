/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
  health: {
    index: typeof routes['health.index']
  }
  overviews: {
    index: typeof routes['overviews.index']
    store: typeof routes['overviews.store']
    updateMetadata: typeof routes['overviews.update_metadata']
    destroy: typeof routes['overviews.destroy']
  }
  quotes: {
    getQuotesByType: typeof routes['quotes.get_quotes_by_type']
    createQuote: typeof routes['quotes.create_quote']
    updateQuote: typeof routes['quotes.update_quote']
    deleteQuote: typeof routes['quotes.delete_quote']
  }
  dailyDarshans: {
    index: typeof routes['daily_darshans.index']
    store: typeof routes['daily_darshans.store']
    update: typeof routes['daily_darshans.update']
    destroy: typeof routes['daily_darshans.destroy']
  }
  newAccount: {
    store: typeof routes['new_account.store']
  }
  accessTokens: {
    store: typeof routes['access_tokens.store']
    destroy: typeof routes['access_tokens.destroy']
  }
  profile: {
    show: typeof routes['profile.show']
  }
  users: {
    pending: typeof routes['users.pending']
    bySection: typeof routes['users.by_section']
    index: typeof routes['users.index']
    approve: typeof routes['users.approve']
    update: typeof routes['users.update']
    destroy: typeof routes['users.destroy']
  }
  departments: {
    index: typeof routes['departments.index']
    store: typeof routes['departments.store']
    usersByDepartment: typeof routes['departments.users_by_department']
    show: typeof routes['departments.show']
    update: typeof routes['departments.update']
    destroy: typeof routes['departments.destroy']
  }
  departmentFunctionalities: {
    list: typeof routes['department_functionalities.list']
    sync: typeof routes['department_functionalities.sync']
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
  functionalities: {
    index: typeof routes['functionalities.index']
    store: typeof routes['functionalities.store']
    show: typeof routes['functionalities.show']
    update: typeof routes['functionalities.update']
    setActive: typeof routes['functionalities.set_active']
    destroy: typeof routes['functionalities.destroy']
    departments: typeof routes['functionalities.departments']
    updateDepartments: typeof routes['functionalities.update_departments']
  }
  functionalityItems: {
    byFunctionality: typeof routes['functionality_items.by_functionality']
    store: typeof routes['functionality_items.store']
    summaries: typeof routes['functionality_items.summaries']
    index: typeof routes['functionality_items.index']
    show: typeof routes['functionality_items.show']
    update: typeof routes['functionality_items.update']
    setActive: typeof routes['functionality_items.set_active']
    destroy: typeof routes['functionality_items.destroy']
  }
  itemRubrics: {
    show: typeof routes['item_rubrics.show']
    versions: typeof routes['item_rubrics.versions']
    update: typeof routes['item_rubrics.update']
  }
  itemLevels: {
    index: typeof routes['item_levels.index']
    update: typeof routes['item_levels.update']
  }
  itemPermissions: {
    show: typeof routes['item_permissions.show']
    update: typeof routes['item_permissions.update']
  }
  itemEnrollments: {
    enrollment: typeof routes['item_enrollments.enrollment']
    updateEnrollment: typeof routes['item_enrollments.update_enrollment']
    enrollments: typeof routes['item_enrollments.enrollments']
    eligibleStudents: typeof routes['item_enrollments.eligible_students']
    destroy: typeof routes['item_enrollments.destroy']
  }
  dashboardWidgets: {
    manage: typeof routes['dashboard_widgets.manage']
    index: typeof routes['dashboard_widgets.index']
    store: typeof routes['dashboard_widgets.store']
    update: typeof routes['dashboard_widgets.update']
    setActive: typeof routes['dashboard_widgets.set_active']
    destroy: typeof routes['dashboard_widgets.destroy']
  }
  me: {
    navigation: typeof routes['me.navigation']
    items: typeof routes['me.items']
  }
  dashboard: {
    stats: typeof routes['dashboard.stats']
  }
  progress: {
    allDepartments: typeof routes['progress.all_departments']
    lessonGrowth: typeof routes['progress.lesson_growth']
    departmentProgress: typeof routes['progress.department_progress']
    sectionProgress: typeof routes['progress.section_progress']
    userProgress: typeof routes['progress.user_progress']
  }
  notifications: {
    index: typeof routes['notifications.index']
    markAllRead: typeof routes['notifications.mark_all_read']
    markRead: typeof routes['notifications.mark_read']
  }
  groups: {
    members: typeof routes['groups.members']
    index: typeof routes['groups.index']
    byMember: typeof routes['groups.by_member']
    store: typeof routes['groups.store']
    show: typeof routes['groups.show']
    update: typeof routes['groups.update']
    destroy: typeof routes['groups.destroy']
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
  lessonSubmissions: {
    mine: typeof routes['lesson_submissions.mine']
    grade: typeof routes['lesson_submissions.grade']
    reEvaluate: typeof routes['lesson_submissions.re_evaluate']
    submit: typeof routes['lesson_submissions.submit']
    forLesson: typeof routes['lesson_submissions.for_lesson']
  }
  chatContacts: {
    lookup: typeof routes['chat_contacts.lookup']
    index: typeof routes['chat_contacts.index']
    store: typeof routes['chat_contacts.store']
    update: typeof routes['chat_contacts.update']
    destroy: typeof routes['chat_contacts.destroy']
    blocks: typeof routes['chat_contacts.blocks']
    block: typeof routes['chat_contacts.block']
    unblock: typeof routes['chat_contacts.unblock']
  }
  chatMessages: {
    conversations: typeof routes['chat_messages.conversations']
    messages: typeof routes['chat_messages.messages']
    peerMessages: typeof routes['chat_messages.peer_messages']
    readPeer: typeof routes['chat_messages.read_peer']
    convMessages: typeof routes['chat_messages.conv_messages']
    convPostMessage: typeof routes['chat_messages.conv_post_message']
    store: typeof routes['chat_messages.store']
    read: typeof routes['chat_messages.read']
    destroy: typeof routes['chat_messages.destroy']
    typing: typeof routes['chat_messages.typing']
  }
  chatReactions: {
    set: typeof routes['chat_reactions.set']
  }
}
