/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
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
  'departments.update': {
    methods: ["PUT"],
    pattern: '/departments/:id',
    tokens: [{"old":"/departments/:id","type":0,"val":"departments","end":""},{"old":"/departments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['departments.update']['types'],
  },
  'departments.show': {
    methods: ["GET","HEAD"],
    pattern: '/departments/:id',
    tokens: [{"old":"/departments/:id","type":0,"val":"departments","end":""},{"old":"/departments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['departments.show']['types'],
  },
  'departments.users_by_department': {
    methods: ["GET","HEAD"],
    pattern: '/departments/:id/users',
    tokens: [{"old":"/departments/:id/users","type":0,"val":"departments","end":""},{"old":"/departments/:id/users","type":1,"val":"id","end":""},{"old":"/departments/:id/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['departments.users_by_department']['types'],
  },
  'departments.destroy': {
    methods: ["DELETE"],
    pattern: '/departments/delete/:id',
    tokens: [{"old":"/departments/delete/:id","type":0,"val":"departments","end":""},{"old":"/departments/delete/:id","type":0,"val":"delete","end":""},{"old":"/departments/delete/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['departments.destroy']['types'],
  },
  'users.index': {
    methods: ["GET","HEAD"],
    pattern: '/users',
    tokens: [{"old":"/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.index']['types'],
  },
  'users.pending': {
    methods: ["GET","HEAD"],
    pattern: '/users/pending',
    tokens: [{"old":"/users/pending","type":0,"val":"users","end":""},{"old":"/users/pending","type":0,"val":"pending","end":""}],
    types: placeholder as Registry['users.pending']['types'],
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
  'users.by_section': {
    methods: ["GET","HEAD"],
    pattern: '/users/section/:sectionId',
    tokens: [{"old":"/users/section/:sectionId","type":0,"val":"users","end":""},{"old":"/users/section/:sectionId","type":0,"val":"section","end":""},{"old":"/users/section/:sectionId","type":1,"val":"sectionId","end":""}],
    types: placeholder as Registry['users.by_section']['types'],
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
  'sections.index': {
    methods: ["GET","HEAD"],
    pattern: '/sections',
    tokens: [{"old":"/sections","type":0,"val":"sections","end":""}],
    types: placeholder as Registry['sections.index']['types'],
  },
  'sections.show': {
    methods: ["GET","HEAD"],
    pattern: '/sections/:id',
    tokens: [{"old":"/sections/:id","type":0,"val":"sections","end":""},{"old":"/sections/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['sections.show']['types'],
  },
  'sections.by_department': {
    methods: ["GET","HEAD"],
    pattern: '/sections/department/:departmentId',
    tokens: [{"old":"/sections/department/:departmentId","type":0,"val":"sections","end":""},{"old":"/sections/department/:departmentId","type":0,"val":"department","end":""},{"old":"/sections/department/:departmentId","type":1,"val":"departmentId","end":""}],
    types: placeholder as Registry['sections.by_department']['types'],
  },
  'sections.store': {
    methods: ["POST"],
    pattern: '/sections/create',
    tokens: [{"old":"/sections/create","type":0,"val":"sections","end":""},{"old":"/sections/create","type":0,"val":"create","end":""}],
    types: placeholder as Registry['sections.store']['types'],
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
