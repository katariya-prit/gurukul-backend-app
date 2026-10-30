import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'overviews.index': { paramsTuple?: []; params?: {} }
    'quotes.get_quotes_by_type': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'daily_darshans.index': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'departments.index': { paramsTuple?: []; params?: {} }
    'departments.store': { paramsTuple?: []; params?: {} }
    'departments.users_by_department': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.pending': { paramsTuple?: []; params?: {} }
    'users.by_section': { paramsTuple: [ParamValue]; params: {'sectionId': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'roles.store': { paramsTuple?: []; params?: {} }
    'roles.update': { paramsTuple: [ParamValue]; params: {'roleCode': ParamValue} }
    'sections.by_department': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'sections.index': { paramsTuple?: []; params?: {} }
    'sections.store': { paramsTuple?: []; params?: {} }
    'sections.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard.stats': { paramsTuple?: []; params?: {} }
    'progress.all_departments': { paramsTuple?: []; params?: {} }
    'progress.department_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.section_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.user_progress': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.by_member': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'groups.store': { paramsTuple?: []; params?: {} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'overviews.store': { paramsTuple?: []; params?: {} }
    'overviews.update_metadata': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'overviews.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.create_quote': { paramsTuple?: []; params?: {} }
    'quotes.update_quote': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.delete_quote': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'daily_darshans.store': { paramsTuple?: []; params?: {} }
    'daily_darshans.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'daily_darshans.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'upload.avatar': { paramsTuple?: []; params?: {} }
    'upload.section': { paramsTuple?: []; params?: {} }
    'lesson.store': { paramsTuple?: []; params?: {} }
    'lesson.my_lessons': { paramsTuple?: []; params?: {} }
    'lesson.created': { paramsTuple?: []; params?: {} }
    'lesson.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'overviews.index': { paramsTuple?: []; params?: {} }
    'quotes.get_quotes_by_type': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'daily_darshans.index': { paramsTuple?: []; params?: {} }
    'departments.index': { paramsTuple?: []; params?: {} }
    'departments.users_by_department': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.pending': { paramsTuple?: []; params?: {} }
    'users.by_section': { paramsTuple: [ParamValue]; params: {'sectionId': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'sections.by_department': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'sections.index': { paramsTuple?: []; params?: {} }
    'sections.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard.stats': { paramsTuple?: []; params?: {} }
    'progress.all_departments': { paramsTuple?: []; params?: {} }
    'progress.department_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.section_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.user_progress': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.by_member': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lesson.my_lessons': { paramsTuple?: []; params?: {} }
    'lesson.created': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'overviews.index': { paramsTuple?: []; params?: {} }
    'quotes.get_quotes_by_type': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'daily_darshans.index': { paramsTuple?: []; params?: {} }
    'departments.index': { paramsTuple?: []; params?: {} }
    'departments.users_by_department': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.pending': { paramsTuple?: []; params?: {} }
    'users.by_section': { paramsTuple: [ParamValue]; params: {'sectionId': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'sections.by_department': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'sections.index': { paramsTuple?: []; params?: {} }
    'sections.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard.stats': { paramsTuple?: []; params?: {} }
    'progress.all_departments': { paramsTuple?: []; params?: {} }
    'progress.department_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.section_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.user_progress': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.by_member': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lesson.my_lessons': { paramsTuple?: []; params?: {} }
    'lesson.created': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'departments.store': { paramsTuple?: []; params?: {} }
    'roles.store': { paramsTuple?: []; params?: {} }
    'sections.store': { paramsTuple?: []; params?: {} }
    'groups.store': { paramsTuple?: []; params?: {} }
    'overviews.store': { paramsTuple?: []; params?: {} }
    'quotes.create_quote': { paramsTuple?: []; params?: {} }
    'daily_darshans.store': { paramsTuple?: []; params?: {} }
    'upload.avatar': { paramsTuple?: []; params?: {} }
    'upload.section': { paramsTuple?: []; params?: {} }
    'lesson.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'roles.update': { paramsTuple: [ParamValue]; params: {'roleCode': ParamValue} }
    'sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.update_quote': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'daily_darshans.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'overviews.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.delete_quote': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'daily_darshans.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lesson.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'overviews.update_metadata': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}