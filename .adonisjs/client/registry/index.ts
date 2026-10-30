/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'overviews.index': {
    methods: ["GET","HEAD"],
    pattern: '/overview',
    tokens: [{"old":"/overview","type":0,"val":"overview","end":""}],
    types: placeholder as Registry['overviews.index']['types'],
  },
  'quotes.get_quotes_by_type': {
    methods: ["GET","HEAD"],
    pattern: '/quotes/type/:type',
    tokens: [{"old":"/quotes/type/:type","type":0,"val":"quotes","end":""},{"old":"/quotes/type/:type","type":0,"val":"type","end":""},{"old":"/quotes/type/:type","type":1,"val":"type","end":""}],
    types: placeholder as Registry['quotes.get_quotes_by_type']['types'],
  },
  'daily_darshans.index': {
    methods: ["GET","HEAD"],
    pattern: '/daily-darshan',
    tokens: [{"old":"/daily-darshan","type":0,"val":"daily-darshan","end":""}],
    types: placeholder as Registry['daily_darshans.index']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/users/register',
    tokens: [{"old":"/users/register","type":0,"val":"users","end":""},{"old":"/users/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'access_tokens.store': {
    methods: ["POST"],
    pattern: '/users/login',
    tokens: [{"old":"/users/login","type":0,"val":"users","end":""},{"old":"/users/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['access_tokens.store']['types'],
  },
  'access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/users/logout',
    tokens: [{"old":"/users/logout","type":0,"val":"users","end":""},{"old":"/users/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['access_tokens.destroy']['types'],
  },
  'departments.index': {
    methods: ["GET","HEAD"],
    pattern: '/departments',
    tokens: [{"old":"/departments","type":0,"val":"departments","end":""}],
    types: placeholder as Registry['departments.index']['types'],
  },
  'departments.store': {
    methods: ["POST"],
    pattern: '/departments/create',
    tokens: [{"old":"/departments/create","type":0,"val":"departments","end":""},{"old":"/departments/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['departments.store']['types'],
  },
  'departments.users_by_department': {
    methods: ["GET","HEAD"],
    pattern: '/departments/:id/users',
    tokens: [{"old":"/departments/:id/users","type":0,"val":"departments","end":""},{"old":"/departments/:id/users","type":1,"val":"id","end":""},{"old":"/departments/:id/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['departments.users_by_department']['types'],
  },
  'departments.show': {
    methods: ["GET","HEAD"],
    pattern: '/departments/:id',
    tokens: [{"old":"/departments/:id","type":0,"val":"departments","end":""},{"old":"/departments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['departments.show']['types'],
  },
  'departments.update': {
    methods: ["PUT"],
    pattern: '/departments/:id',
    tokens: [{"old":"/departments/:id","type":0,"val":"departments","end":""},{"old":"/departments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['departments.update']['types'],
  },
  'departments.destroy': {
    methods: ["DELETE"],
    pattern: '/departments/delete/:id',
    tokens: [{"old":"/departments/delete/:id","type":0,"val":"departments","end":""},{"old":"/departments/delete/:id","type":0,"val":"delete","end":""},{"old":"/departments/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['departments.destroy']['types'],
  },
  'users.pending': {
    methods: ["GET","HEAD"],
    pattern: '/users/pending',
    tokens: [{"old":"/users/pending","type":0,"val":"users","end":""},{"old":"/users/pending","type":0,"val":"pending","end":""}],
    types: placeholder as Registry['users.pending']['types'],
  },
  'users.by_section': {
    methods: ["GET","HEAD"],
    pattern: '/users/section/:sectionId',
    tokens: [{"old":"/users/section/:sectionId","type":0,"val":"users","end":""},{"old":"/users/section/:sectionId","type":0,"val":"section","end":""},{"old":"/users/section/:sectionId","type":1,"val":"sectionId","end":""}],
    types: placeholder as Registry['users.by_section']['types'],
  },
  'users.index': {
    methods: ["GET","HEAD"],
    pattern: '/users',
    tokens: [{"old":"/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.index']['types'],
  },
  'users.approve': {
    methods: ["PUT"],
    pattern: '/users/approve/:id',
    tokens: [{"old":"/users/approve/:id","type":0,"val":"users","end":""},{"old":"/users/approve/:id","type":0,"val":"approve","end":""},{"old":"/users/approve/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['users.approve']['types'],
  },
  'users.destroy': {
    methods: ["DELETE"],
    pattern: '/users/delete/:id',
    tokens: [{"old":"/users/delete/:id","type":0,"val":"users","end":""},{"old":"/users/delete/:id","type":0,"val":"delete","end":""},{"old":"/users/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['users.destroy']['types'],
  },
  'roles.index': {
    methods: ["GET","HEAD"],
    pattern: '/roles',
    tokens: [{"old":"/roles","type":0,"val":"roles","end":""}],
    types: placeholder as Registry['roles.index']['types'],
  },
  'roles.store': {
    methods: ["POST"],
    pattern: '/roles/create',
    tokens: [{"old":"/roles/create","type":0,"val":"roles","end":""},{"old":"/roles/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['roles.store']['types'],
  },
  'roles.update': {
    methods: ["PUT"],
    pattern: '/roles/:roleCode',
    tokens: [{"old":"/roles/:roleCode","type":0,"val":"roles","end":""},{"old":"/roles/:roleCode","type":1,"val":"roleCode","end":""}],
    types: placeholder as Registry['roles.update']['types'],
  },
  'sections.by_department': {
    methods: ["GET","HEAD"],
    pattern: '/sections/department/:departmentId',
    tokens: [{"old":"/sections/department/:departmentId","type":0,"val":"sections","end":""},{"old":"/sections/department/:departmentId","type":0,"val":"department","end":""},{"old":"/sections/department/:departmentId","type":1,"val":"departmentId","end":""}],
    types: placeholder as Registry['sections.by_department']['types'],
  },
  'sections.index': {
    methods: ["GET","HEAD"],
    pattern: '/sections',
    tokens: [{"old":"/sections","type":0,"val":"sections","end":""}],
    types: placeholder as Registry['sections.index']['types'],
  },
  'sections.store': {
    methods: ["POST"],
    pattern: '/sections/create',
    tokens: [{"old":"/sections/create","type":0,"val":"sections","end":""},{"old":"/sections/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['sections.store']['types'],
  },
  'sections.show': {
    methods: ["GET","HEAD"],
    pattern: '/sections/:id',
    tokens: [{"old":"/sections/:id","type":0,"val":"sections","end":""},{"old":"/sections/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['sections.show']['types'],
  },
  'sections.update': {
    methods: ["PUT"],
    pattern: '/sections/:id',
    tokens: [{"old":"/sections/:id","type":0,"val":"sections","end":""},{"old":"/sections/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['sections.update']['types'],
  },
  'sections.destroy': {
    methods: ["DELETE"],
    pattern: '/sections/delete/:id',
    tokens: [{"old":"/sections/delete/:id","type":0,"val":"sections","end":""},{"old":"/sections/delete/:id","type":0,"val":"delete","end":""},{"old":"/sections/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['sections.destroy']['types'],
  },
  'dashboard.stats': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard/stats',
    tokens: [{"old":"/dashboard/stats","type":0,"val":"dashboard","end":""},{"old":"/dashboard/stats","type":0,"val":"stats","end":""}],
    types: placeholder as Registry['dashboard.stats']['types'],
  },
  'progress.all_departments': {
    methods: ["GET","HEAD"],
    pattern: '/progress/departments',
    tokens: [{"old":"/progress/departments","type":0,"val":"progress","end":""},{"old":"/progress/departments","type":0,"val":"departments","end":""}],
    types: placeholder as Registry['progress.all_departments']['types'],
  },
  'progress.department_progress': {
    methods: ["GET","HEAD"],
    pattern: '/progress/department/:id',
    tokens: [{"old":"/progress/department/:id","type":0,"val":"progress","end":""},{"old":"/progress/department/:id","type":0,"val":"department","end":""},{"old":"/progress/department/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['progress.department_progress']['types'],
  },
  'progress.section_progress': {
    methods: ["GET","HEAD"],
    pattern: '/progress/section/:id',
    tokens: [{"old":"/progress/section/:id","type":0,"val":"progress","end":""},{"old":"/progress/section/:id","type":0,"val":"section","end":""},{"old":"/progress/section/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['progress.section_progress']['types'],
  },
  'progress.user_progress': {
    methods: ["GET","HEAD"],
    pattern: '/progress/user/:suid',
    tokens: [{"old":"/progress/user/:suid","type":0,"val":"progress","end":""},{"old":"/progress/user/:suid","type":0,"val":"user","end":""},{"old":"/progress/user/:suid","type":1,"val":"suid","end":""}],
    types: placeholder as Registry['progress.user_progress']['types'],
  },
  'notifications.index': {
    methods: ["GET","HEAD"],
    pattern: '/notifications',
    tokens: [{"old":"/notifications","type":0,"val":"notifications","end":""}],
    types: placeholder as Registry['notifications.index']['types'],
  },
  'notifications.mark_read': {
    methods: ["PUT"],
    pattern: '/notifications/:id/read',
    tokens: [{"old":"/notifications/:id/read","type":0,"val":"notifications","end":""},{"old":"/notifications/:id/read","type":1,"val":"id","end":""},{"old":"/notifications/:id/read","type":0,"val":"read","end":""}],
    types: placeholder as Registry['notifications.mark_read']['types'],
  },
  'groups.index': {
    methods: ["GET","HEAD"],
    pattern: '/groups/list',
    tokens: [{"old":"/groups/list","type":0,"val":"groups","end":""},{"old":"/groups/list","type":0,"val":"list","end":""}],
    types: placeholder as Registry['groups.index']['types'],
  },
  'groups.by_member': {
    methods: ["GET","HEAD"],
    pattern: '/groups/member/:suid',
    tokens: [{"old":"/groups/member/:suid","type":0,"val":"groups","end":""},{"old":"/groups/member/:suid","type":0,"val":"member","end":""},{"old":"/groups/member/:suid","type":1,"val":"suid","end":""}],
    types: placeholder as Registry['groups.by_member']['types'],
  },
  'groups.store': {
    methods: ["POST"],
    pattern: '/groups/create',
    tokens: [{"old":"/groups/create","type":0,"val":"groups","end":""},{"old":"/groups/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['groups.store']['types'],
  },
  'groups.show': {
    methods: ["GET","HEAD"],
    pattern: '/groups/:id',
    tokens: [{"old":"/groups/:id","type":0,"val":"groups","end":""},{"old":"/groups/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['groups.show']['types'],
  },
  'groups.update': {
    methods: ["PUT"],
    pattern: '/groups/:id',
    tokens: [{"old":"/groups/:id","type":0,"val":"groups","end":""},{"old":"/groups/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['groups.update']['types'],
  },
  'groups.destroy': {
    methods: ["DELETE"],
    pattern: '/groups/:id',
    tokens: [{"old":"/groups/:id","type":0,"val":"groups","end":""},{"old":"/groups/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['groups.destroy']['types'],
  },
  'overviews.store': {
    methods: ["POST"],
    pattern: '/overview/update',
    tokens: [{"old":"/overview/update","type":0,"val":"overview","end":""},{"old":"/overview/update","type":0,"val":"update","end":""}],
    types: placeholder as Registry['overviews.store']['types'],
  },
  'overviews.update_metadata': {
    methods: ["PATCH"],
    pattern: '/overview/:id',
    tokens: [{"old":"/overview/:id","type":0,"val":"overview","end":""},{"old":"/overview/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['overviews.update_metadata']['types'],
  },
  'overviews.destroy': {
    methods: ["DELETE"],
    pattern: '/overview/:id',
    tokens: [{"old":"/overview/:id","type":0,"val":"overview","end":""},{"old":"/overview/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['overviews.destroy']['types'],
  },
  'quotes.create_quote': {
    methods: ["POST"],
    pattern: '/quotes',
    tokens: [{"old":"/quotes","type":0,"val":"quotes","end":""}],
    types: placeholder as Registry['quotes.create_quote']['types'],
  },
  'quotes.update_quote': {
    methods: ["PUT"],
    pattern: '/quotes/:id',
    tokens: [{"old":"/quotes/:id","type":0,"val":"quotes","end":""},{"old":"/quotes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['quotes.update_quote']['types'],
  },
  'quotes.delete_quote': {
    methods: ["DELETE"],
    pattern: '/quotes/:id',
    tokens: [{"old":"/quotes/:id","type":0,"val":"quotes","end":""},{"old":"/quotes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['quotes.delete_quote']['types'],
  },
  'daily_darshans.store': {
    methods: ["POST"],
    pattern: '/daily-darshan',
    tokens: [{"old":"/daily-darshan","type":0,"val":"daily-darshan","end":""}],
    types: placeholder as Registry['daily_darshans.store']['types'],
  },
  'daily_darshans.update': {
    methods: ["PUT"],
    pattern: '/daily-darshan/:id',
    tokens: [{"old":"/daily-darshan/:id","type":0,"val":"daily-darshan","end":""},{"old":"/daily-darshan/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['daily_darshans.update']['types'],
  },
  'daily_darshans.destroy': {
    methods: ["DELETE"],
    pattern: '/daily-darshan/:id',
    tokens: [{"old":"/daily-darshan/:id","type":0,"val":"daily-darshan","end":""},{"old":"/daily-darshan/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['daily_darshans.destroy']['types'],
  },
  'upload.avatar': {
    methods: ["POST"],
    pattern: '/upload/avatar',
    tokens: [{"old":"/upload/avatar","type":0,"val":"upload","end":""},{"old":"/upload/avatar","type":0,"val":"avatar","end":""}],
    types: placeholder as Registry['upload.avatar']['types'],
  },
  'upload.section': {
    methods: ["POST"],
    pattern: '/upload/section',
    tokens: [{"old":"/upload/section","type":0,"val":"upload","end":""},{"old":"/upload/section","type":0,"val":"section","end":""}],
    types: placeholder as Registry['upload.section']['types'],
  },
  'lesson.store': {
    methods: ["POST"],
    pattern: '/lessons/create',
    tokens: [{"old":"/lessons/create","type":0,"val":"lessons","end":""},{"old":"/lessons/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['lesson.store']['types'],
  },
  'lesson.my_lessons': {
    methods: ["GET","HEAD"],
    pattern: '/lessons/my',
    tokens: [{"old":"/lessons/my","type":0,"val":"lessons","end":""},{"old":"/lessons/my","type":0,"val":"my","end":""}],
    types: placeholder as Registry['lesson.my_lessons']['types'],
  },
  'lesson.created': {
    methods: ["GET","HEAD"],
    pattern: '/lessons/created',
    tokens: [{"old":"/lessons/created","type":0,"val":"lessons","end":""},{"old":"/lessons/created","type":0,"val":"created","end":""}],
    types: placeholder as Registry['lesson.created']['types'],
  },
  'lesson.destroy': {
    methods: ["DELETE"],
    pattern: '/lessons/delete/:id',
    tokens: [{"old":"/lessons/delete/:id","type":0,"val":"lessons","end":""},{"old":"/lessons/delete/:id","type":0,"val":"delete","end":""},{"old":"/lessons/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['lesson.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
