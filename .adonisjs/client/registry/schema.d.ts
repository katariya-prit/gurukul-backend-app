/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'overviews.index': {
    methods: ["GET","HEAD"]
    pattern: '/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'quotes.get_quotes_by_type': {
    methods: ["GET","HEAD"]
    pattern: '/quotes/type/:type'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { type: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'daily_darshans.index': {
    methods: ["GET","HEAD"]
    pattern: '/daily-darshan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/users/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'access_tokens.store': {
    methods: ["POST"]
    pattern: '/users/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/users/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'departments.index': {
    methods: ["GET","HEAD"]
    pattern: '/departments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'departments.store': {
    methods: ["POST"]
    pattern: '/departments/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'departments.users_by_department': {
    methods: ["GET","HEAD"]
    pattern: '/departments/:id/users'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'departments.show': {
    methods: ["GET","HEAD"]
    pattern: '/departments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'departments.update': {
    methods: ["PUT"]
    pattern: '/departments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'departments.destroy': {
    methods: ["DELETE"]
    pattern: '/departments/delete/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'users.pending': {
    methods: ["GET","HEAD"]
    pattern: '/users/pending'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['pending']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['pending']>>>
    }
  }
  'users.by_section': {
    methods: ["GET","HEAD"]
    pattern: '/users/section/:sectionId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { sectionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['bySection']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['bySection']>>>
    }
  }
  'users.index': {
    methods: ["GET","HEAD"]
    pattern: '/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
    }
  }
  'users.approve': {
    methods: ["PUT"]
    pattern: '/users/approve/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['approve']>>>
    }
  }
  'users.destroy': {
    methods: ["DELETE"]
    pattern: '/users/delete/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['destroy']>>>
    }
  }
  'roles.index': {
    methods: ["GET","HEAD"]
    pattern: '/roles'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'roles.store': {
    methods: ["POST"]
    pattern: '/roles/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'roles.update': {
    methods: ["PUT"]
    pattern: '/roles/:roleCode'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { roleCode: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sections.by_department': {
    methods: ["GET","HEAD"]
    pattern: '/sections/department/:departmentId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { departmentId: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sections.index': {
    methods: ["GET","HEAD"]
    pattern: '/sections'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sections.store': {
    methods: ["POST"]
    pattern: '/sections/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sections.show': {
    methods: ["GET","HEAD"]
    pattern: '/sections/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sections.update': {
    methods: ["PUT"]
    pattern: '/sections/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'sections.destroy': {
    methods: ["DELETE"]
    pattern: '/sections/delete/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'dashboard.stats': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'progress.all_departments': {
    methods: ["GET","HEAD"]
    pattern: '/progress/departments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'progress.department_progress': {
    methods: ["GET","HEAD"]
    pattern: '/progress/department/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'progress.section_progress': {
    methods: ["GET","HEAD"]
    pattern: '/progress/section/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'progress.user_progress': {
    methods: ["GET","HEAD"]
    pattern: '/progress/user/:suid'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { suid: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'notifications.index': {
    methods: ["GET","HEAD"]
    pattern: '/notifications'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'notifications.mark_read': {
    methods: ["PUT"]
    pattern: '/notifications/:id/read'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'groups.index': {
    methods: ["GET","HEAD"]
    pattern: '/groups/list'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'groups.by_member': {
    methods: ["GET","HEAD"]
    pattern: '/groups/member/:suid'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { suid: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'groups.store': {
    methods: ["POST"]
    pattern: '/groups/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'groups.show': {
    methods: ["GET","HEAD"]
    pattern: '/groups/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'groups.update': {
    methods: ["PUT"]
    pattern: '/groups/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'groups.destroy': {
    methods: ["DELETE"]
    pattern: '/groups/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'overviews.store': {
    methods: ["POST"]
    pattern: '/overview/update'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'overviews.update_metadata': {
    methods: ["PATCH"]
    pattern: '/overview/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'overviews.destroy': {
    methods: ["DELETE"]
    pattern: '/overview/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'quotes.create_quote': {
    methods: ["POST"]
    pattern: '/quotes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'quotes.update_quote': {
    methods: ["PUT"]
    pattern: '/quotes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'quotes.delete_quote': {
    methods: ["DELETE"]
    pattern: '/quotes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'daily_darshans.store': {
    methods: ["POST"]
    pattern: '/daily-darshan'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'daily_darshans.update': {
    methods: ["PUT"]
    pattern: '/daily-darshan/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'daily_darshans.destroy': {
    methods: ["DELETE"]
    pattern: '/daily-darshan/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'upload.avatar': {
    methods: ["POST"]
    pattern: '/upload/avatar'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'upload.section': {
    methods: ["POST"]
    pattern: '/upload/section'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'lesson.store': {
    methods: ["POST"]
    pattern: '/lessons/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'lesson.my_lessons': {
    methods: ["GET","HEAD"]
    pattern: '/lessons/my'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'lesson.created': {
    methods: ["GET","HEAD"]
    pattern: '/lessons/created'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'lesson.destroy': {
    methods: ["DELETE"]
    pattern: '/lessons/delete/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
}
