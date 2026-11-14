import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'health.index': { paramsTuple?: []; params?: {} }
    'overviews.index': { paramsTuple?: []; params?: {} }
    'quotes.get_quotes_by_type': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'daily_darshans.index': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'users.pending': { paramsTuple?: []; params?: {} }
    'users.by_section': { paramsTuple: [ParamValue]; params: {'sectionId': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.index': { paramsTuple?: []; params?: {} }
    'departments.store': { paramsTuple?: []; params?: {} }
    'departments.users_by_department': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'department_functionalities.list': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'department_functionalities.sync': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'roles.store': { paramsTuple?: []; params?: {} }
    'roles.update': { paramsTuple: [ParamValue]; params: {'roleCode': ParamValue} }
    'sections.by_department': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'sections.index': { paramsTuple?: []; params?: {} }
    'sections.store': { paramsTuple?: []; params?: {} }
    'sections.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.index': { paramsTuple?: []; params?: {} }
    'functionalities.store': { paramsTuple?: []; params?: {} }
    'functionalities.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.set_active': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.departments': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.update_departments': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.by_functionality': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.summaries': { paramsTuple?: []; params?: {} }
    'functionality_items.index': { paramsTuple?: []; params?: {} }
    'functionality_items.show': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'functionality_items.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'functionality_items.set_active': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'functionality_items.destroy': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_rubrics.show': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_rubrics.versions': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_rubrics.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_levels.index': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_levels.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_permissions.show': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_permissions.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.enrollment': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.update_enrollment': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.enrollments': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.eligible_students': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'itemId': ParamValue,'studentSuid': ParamValue} }
    'dashboard_widgets.manage': { paramsTuple?: []; params?: {} }
    'dashboard_widgets.index': { paramsTuple?: []; params?: {} }
    'dashboard_widgets.store': { paramsTuple?: []; params?: {} }
    'dashboard_widgets.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard_widgets.set_active': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dashboard_widgets.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'me.navigation': { paramsTuple?: []; params?: {} }
    'me.items': { paramsTuple?: []; params?: {} }
    'dashboard.stats': { paramsTuple?: []; params?: {} }
    'progress.all_departments': { paramsTuple?: []; params?: {} }
    'progress.lesson_growth': { paramsTuple?: []; params?: {} }
    'progress.department_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.section_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.user_progress': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'notifications.mark_all_read': { paramsTuple?: []; params?: {} }
    'notifications.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.members': { paramsTuple?: []; params?: {} }
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
    'lesson_submissions.mine': { paramsTuple?: []; params?: {} }
    'lesson_submissions.grade': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'lesson_submissions.re_evaluate': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'lesson_submissions.submit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lesson_submissions.for_lesson': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_contacts.lookup': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'chat_contacts.index': { paramsTuple?: []; params?: {} }
    'chat_contacts.store': { paramsTuple?: []; params?: {} }
    'chat_contacts.update': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'chat_contacts.destroy': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'chat_contacts.blocks': { paramsTuple?: []; params?: {} }
    'chat_contacts.block': { paramsTuple?: []; params?: {} }
    'chat_contacts.unblock': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
    'chat_messages.conversations': { paramsTuple?: []; params?: {} }
    'chat_messages.messages': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_messages.peer_messages': { paramsTuple: [ParamValue]; params: {'peerId': ParamValue} }
    'chat_messages.read_peer': { paramsTuple: [ParamValue]; params: {'peerId': ParamValue} }
    'chat_messages.conv_messages': { paramsTuple: [ParamValue]; params: {'convKey': ParamValue} }
    'chat_messages.conv_post_message': { paramsTuple: [ParamValue]; params: {'convKey': ParamValue} }
    'chat_messages.store': { paramsTuple?: []; params?: {} }
    'chat_messages.read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_messages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_messages.typing': { paramsTuple?: []; params?: {} }
    'chat_reactions.set': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'health.index': { paramsTuple?: []; params?: {} }
    'overviews.index': { paramsTuple?: []; params?: {} }
    'quotes.get_quotes_by_type': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'daily_darshans.index': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'users.pending': { paramsTuple?: []; params?: {} }
    'users.by_section': { paramsTuple: [ParamValue]; params: {'sectionId': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'departments.index': { paramsTuple?: []; params?: {} }
    'departments.users_by_department': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'department_functionalities.list': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'sections.by_department': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'sections.index': { paramsTuple?: []; params?: {} }
    'sections.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.index': { paramsTuple?: []; params?: {} }
    'functionalities.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.departments': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.by_functionality': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.summaries': { paramsTuple?: []; params?: {} }
    'functionality_items.index': { paramsTuple?: []; params?: {} }
    'functionality_items.show': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_rubrics.show': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_rubrics.versions': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_levels.index': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_permissions.show': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.enrollment': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.enrollments': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.eligible_students': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'dashboard_widgets.manage': { paramsTuple?: []; params?: {} }
    'dashboard_widgets.index': { paramsTuple?: []; params?: {} }
    'me.navigation': { paramsTuple?: []; params?: {} }
    'me.items': { paramsTuple?: []; params?: {} }
    'dashboard.stats': { paramsTuple?: []; params?: {} }
    'progress.all_departments': { paramsTuple?: []; params?: {} }
    'progress.lesson_growth': { paramsTuple?: []; params?: {} }
    'progress.department_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.section_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.user_progress': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'groups.members': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.by_member': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lesson.my_lessons': { paramsTuple?: []; params?: {} }
    'lesson.created': { paramsTuple?: []; params?: {} }
    'lesson_submissions.mine': { paramsTuple?: []; params?: {} }
    'lesson_submissions.for_lesson': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_contacts.lookup': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'chat_contacts.index': { paramsTuple?: []; params?: {} }
    'chat_contacts.blocks': { paramsTuple?: []; params?: {} }
    'chat_messages.conversations': { paramsTuple?: []; params?: {} }
    'chat_messages.messages': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_messages.peer_messages': { paramsTuple: [ParamValue]; params: {'peerId': ParamValue} }
    'chat_messages.conv_messages': { paramsTuple: [ParamValue]; params: {'convKey': ParamValue} }
  }
  HEAD: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'health.index': { paramsTuple?: []; params?: {} }
    'overviews.index': { paramsTuple?: []; params?: {} }
    'quotes.get_quotes_by_type': { paramsTuple: [ParamValue]; params: {'type': ParamValue} }
    'daily_darshans.index': { paramsTuple?: []; params?: {} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'users.pending': { paramsTuple?: []; params?: {} }
    'users.by_section': { paramsTuple: [ParamValue]; params: {'sectionId': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'departments.index': { paramsTuple?: []; params?: {} }
    'departments.users_by_department': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'department_functionalities.list': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'sections.by_department': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'sections.index': { paramsTuple?: []; params?: {} }
    'sections.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.index': { paramsTuple?: []; params?: {} }
    'functionalities.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.departments': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.by_functionality': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.summaries': { paramsTuple?: []; params?: {} }
    'functionality_items.index': { paramsTuple?: []; params?: {} }
    'functionality_items.show': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_rubrics.show': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_rubrics.versions': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_levels.index': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_permissions.show': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.enrollment': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.enrollments': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.eligible_students': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'dashboard_widgets.manage': { paramsTuple?: []; params?: {} }
    'dashboard_widgets.index': { paramsTuple?: []; params?: {} }
    'me.navigation': { paramsTuple?: []; params?: {} }
    'me.items': { paramsTuple?: []; params?: {} }
    'dashboard.stats': { paramsTuple?: []; params?: {} }
    'progress.all_departments': { paramsTuple?: []; params?: {} }
    'progress.lesson_growth': { paramsTuple?: []; params?: {} }
    'progress.department_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.section_progress': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'progress.user_progress': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'notifications.index': { paramsTuple?: []; params?: {} }
    'groups.members': { paramsTuple?: []; params?: {} }
    'groups.index': { paramsTuple?: []; params?: {} }
    'groups.by_member': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'groups.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lesson.my_lessons': { paramsTuple?: []; params?: {} }
    'lesson.created': { paramsTuple?: []; params?: {} }
    'lesson_submissions.mine': { paramsTuple?: []; params?: {} }
    'lesson_submissions.for_lesson': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_contacts.lookup': { paramsTuple: [ParamValue]; params: {'suid': ParamValue} }
    'chat_contacts.index': { paramsTuple?: []; params?: {} }
    'chat_contacts.blocks': { paramsTuple?: []; params?: {} }
    'chat_messages.conversations': { paramsTuple?: []; params?: {} }
    'chat_messages.messages': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_messages.peer_messages': { paramsTuple: [ParamValue]; params: {'peerId': ParamValue} }
    'chat_messages.conv_messages': { paramsTuple: [ParamValue]; params: {'convKey': ParamValue} }
  }
  POST: {
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'departments.store': { paramsTuple?: []; params?: {} }
    'roles.store': { paramsTuple?: []; params?: {} }
    'sections.store': { paramsTuple?: []; params?: {} }
    'functionalities.store': { paramsTuple?: []; params?: {} }
    'functionality_items.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'item_enrollments.update_enrollment': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'dashboard_widgets.store': { paramsTuple?: []; params?: {} }
    'groups.store': { paramsTuple?: []; params?: {} }
    'overviews.store': { paramsTuple?: []; params?: {} }
    'quotes.create_quote': { paramsTuple?: []; params?: {} }
    'daily_darshans.store': { paramsTuple?: []; params?: {} }
    'upload.avatar': { paramsTuple?: []; params?: {} }
    'upload.section': { paramsTuple?: []; params?: {} }
    'lesson.store': { paramsTuple?: []; params?: {} }
    'lesson_submissions.re_evaluate': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'lesson_submissions.submit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_contacts.store': { paramsTuple?: []; params?: {} }
    'chat_contacts.block': { paramsTuple?: []; params?: {} }
    'chat_messages.read_peer': { paramsTuple: [ParamValue]; params: {'peerId': ParamValue} }
    'chat_messages.conv_post_message': { paramsTuple: [ParamValue]; params: {'convKey': ParamValue} }
    'chat_messages.store': { paramsTuple?: []; params?: {} }
    'chat_messages.read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_messages.typing': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'users.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'department_functionalities.sync': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'roles.update': { paramsTuple: [ParamValue]; params: {'roleCode': ParamValue} }
    'sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.update_departments': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_rubrics.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_levels.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_permissions.update': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'dashboard_widgets.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'notifications.mark_all_read': { paramsTuple?: []; params?: {} }
    'notifications.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.update_quote': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'daily_darshans.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lesson_submissions.grade': { paramsTuple: [ParamValue]; params: {'submissionId': ParamValue} }
    'chat_contacts.update': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'chat_reactions.set': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionalities.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.destroy': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'item_enrollments.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'itemId': ParamValue,'studentSuid': ParamValue} }
    'dashboard_widgets.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'groups.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'overviews.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'quotes.delete_quote': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'daily_darshans.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lesson.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_contacts.destroy': { paramsTuple: [ParamValue]; params: {'contactId': ParamValue} }
    'chat_contacts.unblock': { paramsTuple: [ParamValue]; params: {'userId': ParamValue} }
    'chat_messages.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'functionalities.set_active': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'functionality_items.set_active': { paramsTuple: [ParamValue]; params: {'itemId': ParamValue} }
    'dashboard_widgets.set_active': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'overviews.update_metadata': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  OPTIONS: {
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}