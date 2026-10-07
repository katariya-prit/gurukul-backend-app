/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
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
}
