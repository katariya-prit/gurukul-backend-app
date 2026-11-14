/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'event_stream': {
    methods: ["GET","HEAD"]
    pattern: '/__transmit/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'subscribe': {
    methods: ["POST"]
    pattern: '/__transmit/subscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'unsubscribe': {
    methods: ["POST"]
    pattern: '/__transmit/unsubscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'health.index': {
    methods: ["GET","HEAD"]
    pattern: '/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/health_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/health_controller').default['index']>>>
    }
  }
  'overviews.index': {
    methods: ["GET","HEAD"]
    pattern: '/overview'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/overviews_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/overviews_controller').default['index']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['getQuotesByType']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['getQuotesByType']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daily_darshans_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daily_darshans_controller').default['index']>>>
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
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/users/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
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
  'users.update': {
    methods: ["PUT"]
    pattern: '/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'departments.index': {
    methods: ["GET","HEAD"]
    pattern: '/departments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['index']>>>
    }
  }
  'departments.store': {
    methods: ["POST"]
    pattern: '/departments/create'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/department').createDepartmentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/department').createDepartmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['usersByDepartment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['usersByDepartment']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['show']>>>
    }
  }
  'departments.update': {
    methods: ["PUT"]
    pattern: '/departments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/department').updateDepartmentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/department').updateDepartmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/departments_controller').default['destroy']>>>
    }
  }
  'department_functionalities.list': {
    methods: ["GET","HEAD"]
    pattern: '/departments/:departmentId/functionalities'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { departmentId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/department_functionalities_controller').default['list']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/department_functionalities_controller').default['list']>>>
    }
  }
  'department_functionalities.sync': {
    methods: ["PUT"]
    pattern: '/departments/:departmentId/functionalities'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/department_functionality').syncDepartmentFunctionalitiesValidator)>>
      paramsTuple: [ParamValue]
      params: { departmentId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/department_functionality').syncDepartmentFunctionalitiesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/department_functionalities_controller').default['sync']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/department_functionalities_controller').default['sync']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['index']>>>
    }
  }
  'roles.store': {
    methods: ["POST"]
    pattern: '/roles/create'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/role').createRoleValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/role').createRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'roles.update': {
    methods: ["PUT"]
    pattern: '/roles/:roleCode'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/role').updateRoleValidator)>>
      paramsTuple: [ParamValue]
      params: { roleCode: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/role').updateRoleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/roles_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['byDepartment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['byDepartment']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['index']>>>
    }
  }
  'sections.store': {
    methods: ["POST"]
    pattern: '/sections/create'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/section').createSectionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/section').createSectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['show']>>>
    }
  }
  'sections.update': {
    methods: ["PUT"]
    pattern: '/sections/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/section').updateSectionValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/section').updateSectionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/sections_controller').default['destroy']>>>
    }
  }
  'functionalities.index': {
    methods: ["GET","HEAD"]
    pattern: '/functionalities'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['index']>>>
    }
  }
  'functionalities.store': {
    methods: ["POST"]
    pattern: '/functionalities'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').createFunctionalityValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').createFunctionalityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'functionalities.show': {
    methods: ["GET","HEAD"]
    pattern: '/functionalities/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['show']>>>
    }
  }
  'functionalities.update': {
    methods: ["PUT"]
    pattern: '/functionalities/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').updateFunctionalityValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').updateFunctionalityValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'functionalities.set_active': {
    methods: ["PATCH"]
    pattern: '/functionalities/:id/active'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').activeToggleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').activeToggleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['setActive']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['setActive']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'functionalities.destroy': {
    methods: ["DELETE"]
    pattern: '/functionalities/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['destroy']>>>
    }
  }
  'functionalities.departments': {
    methods: ["GET","HEAD"]
    pattern: '/functionalities/:id/departments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['departments']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['departments']>>>
    }
  }
  'functionalities.update_departments': {
    methods: ["PUT"]
    pattern: '/functionalities/:id/departments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').bulkDepartmentAssignmentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').bulkDepartmentAssignmentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['updateDepartments']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionalities_controller').default['updateDepartments']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'functionality_items.by_functionality': {
    methods: ["GET","HEAD"]
    pattern: '/functionalities/:id/items'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['byFunctionality']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['byFunctionality']>>>
    }
  }
  'functionality_items.store': {
    methods: ["POST"]
    pattern: '/functionalities/:id/items'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').createItemValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').createItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'functionality_items.summaries': {
    methods: ["GET","HEAD"]
    pattern: '/items/summaries'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['summaries']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['summaries']>>>
    }
  }
  'functionality_items.index': {
    methods: ["GET","HEAD"]
    pattern: '/items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['index']>>>
    }
  }
  'functionality_items.show': {
    methods: ["GET","HEAD"]
    pattern: '/items/:itemId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['show']>>>
    }
  }
  'functionality_items.update': {
    methods: ["PUT"]
    pattern: '/items/:itemId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').updateItemValidator)>>
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').updateItemValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'functionality_items.set_active': {
    methods: ["PATCH"]
    pattern: '/items/:itemId/active'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').activeToggleValidator)>>
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').activeToggleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['setActive']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['setActive']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'functionality_items.destroy': {
    methods: ["DELETE"]
    pattern: '/items/:itemId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/functionality_items_controller').default['destroy']>>>
    }
  }
  'item_rubrics.show': {
    methods: ["GET","HEAD"]
    pattern: '/items/:itemId/rubric'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_rubrics_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_rubrics_controller').default['show']>>>
    }
  }
  'item_rubrics.versions': {
    methods: ["GET","HEAD"]
    pattern: '/items/:itemId/rubric/versions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_rubrics_controller').default['versions']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_rubrics_controller').default['versions']>>>
    }
  }
  'item_rubrics.update': {
    methods: ["PUT"]
    pattern: '/items/:itemId/rubric'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').saveRubricValidator)>>
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').saveRubricValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_rubrics_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_rubrics_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'item_levels.index': {
    methods: ["GET","HEAD"]
    pattern: '/items/:itemId/levels'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_levels_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_levels_controller').default['index']>>>
    }
  }
  'item_levels.update': {
    methods: ["PUT"]
    pattern: '/items/:itemId/levels'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').saveLevelsValidator)>>
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').saveLevelsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_levels_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_levels_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'item_permissions.show': {
    methods: ["GET","HEAD"]
    pattern: '/items/:itemId/permissions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_permissions_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_permissions_controller').default['show']>>>
    }
  }
  'item_permissions.update': {
    methods: ["PUT"]
    pattern: '/items/:itemId/permissions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').savePermissionsValidator)>>
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').savePermissionsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_permissions_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_permissions_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'item_enrollments.enrollment': {
    methods: ["GET","HEAD"]
    pattern: '/items/:itemId/enroll'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['enrollment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['enrollment']>>>
    }
  }
  'item_enrollments.update_enrollment': {
    methods: ["POST"]
    pattern: '/items/:itemId/enroll'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').enrollStudentsValidator)>>
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').enrollStudentsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['updateEnrollment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['updateEnrollment']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'item_enrollments.enrollments': {
    methods: ["GET","HEAD"]
    pattern: '/items/:itemId/enrollments'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['enrollments']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['enrollments']>>>
    }
  }
  'item_enrollments.eligible_students': {
    methods: ["GET","HEAD"]
    pattern: '/items/:itemId/eligible-students'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { itemId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['eligibleStudents']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['eligibleStudents']>>>
    }
  }
  'item_enrollments.destroy': {
    methods: ["DELETE"]
    pattern: '/items/:itemId/enroll/:studentSuid'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { itemId: ParamValue; studentSuid: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/item_enrollments_controller').default['destroy']>>>
    }
  }
  'dashboard_widgets.manage': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/widgets/manage'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['manage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['manage']>>>
    }
  }
  'dashboard_widgets.index': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/widgets'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['index']>>>
    }
  }
  'dashboard_widgets.store': {
    methods: ["POST"]
    pattern: '/dashboard/widgets'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').createWidgetValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').createWidgetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dashboard_widgets.update': {
    methods: ["PUT"]
    pattern: '/dashboard/widgets/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').updateWidgetValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').updateWidgetValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dashboard_widgets.set_active': {
    methods: ["PATCH"]
    pattern: '/dashboard/widgets/:id/active'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/functionality').activeToggleValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/functionality').activeToggleValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['setActive']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['setActive']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dashboard_widgets.destroy': {
    methods: ["DELETE"]
    pattern: '/dashboard/widgets/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_widgets_controller').default['destroy']>>>
    }
  }
  'me.navigation': {
    methods: ["GET","HEAD"]
    pattern: '/me/navigation'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/me_controller').default['navigation']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/me_controller').default['navigation']>>>
    }
  }
  'me.items': {
    methods: ["GET","HEAD"]
    pattern: '/me/items'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/me_controller').default['items']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/me_controller').default['items']>>>
    }
  }
  'dashboard.stats': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/dashboard').dashboardStatsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['stats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['stats']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['allDepartments']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['allDepartments']>>>
    }
  }
  'progress.lesson_growth': {
    methods: ["GET","HEAD"]
    pattern: '/progress/lessons/growth'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/lesson_progress').lessonGrowthQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['lessonGrowth']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['lessonGrowth']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'progress.department_progress': {
    methods: ["GET","HEAD"]
    pattern: '/progress/department/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/progress').progressIdParamValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['departmentProgress']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['departmentProgress']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'progress.section_progress': {
    methods: ["GET","HEAD"]
    pattern: '/progress/section/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/progress').progressIdParamValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['sectionProgress']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['sectionProgress']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'progress.user_progress': {
    methods: ["GET","HEAD"]
    pattern: '/progress/user/:suid'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { suid: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/progress').progressSuidParamValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['userProgress']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/progresses_controller').default['userProgress']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['index']>>>
    }
  }
  'notifications.mark_all_read': {
    methods: ["PUT"]
    pattern: '/notifications/read-all'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markAllRead']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markAllRead']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markRead']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/notifications_controller').default['markRead']>>>
    }
  }
  'groups.members': {
    methods: ["GET","HEAD"]
    pattern: '/groups/members'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['members']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['members']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['index']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['byMember']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['byMember']>>>
    }
  }
  'groups.store': {
    methods: ["POST"]
    pattern: '/groups/create'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/group').createGroupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/group').createGroupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['show']>>>
    }
  }
  'groups.update': {
    methods: ["PUT"]
    pattern: '/groups/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/group').updateGroupValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/group').updateGroupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/groups_controller').default['destroy']>>>
    }
  }
  'overviews.store': {
    methods: ["POST"]
    pattern: '/overview/update'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/overview_image').createOverviewValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/overview_image').createOverviewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/overviews_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/overviews_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'overviews.update_metadata': {
    methods: ["PATCH"]
    pattern: '/overview/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/overview_image').updateOverviewMetadataValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/overview_image').updateOverviewMetadataValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/overviews_controller').default['updateMetadata']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/overviews_controller').default['updateMetadata']>>> | { status: 422; response: { errors: SimpleError[] } }
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/overviews_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/overviews_controller').default['destroy']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['createQuote']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['createQuote']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['updateQuote']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['updateQuote']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['deleteQuote']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['deleteQuote']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daily_darshans_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daily_darshans_controller').default['store']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daily_darshans_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daily_darshans_controller').default['update']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daily_darshans_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daily_darshans_controller').default['destroy']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['avatar']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['avatar']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['section']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/uploads_controller').default['section']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lessons_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lessons_controller').default['store']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lessons_controller').default['myLessons']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lessons_controller').default['myLessons']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lessons_controller').default['created']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lessons_controller').default['created']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lessons_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lessons_controller').default['destroy']>>>
    }
  }
  'lesson_submissions.mine': {
    methods: ["GET","HEAD"]
    pattern: '/lessons/submissions/mine'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['mine']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['mine']>>>
    }
  }
  'lesson_submissions.grade': {
    methods: ["PUT"]
    pattern: '/lessons/submissions/:submissionId/grade'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { submissionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['grade']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['grade']>>>
    }
  }
  'lesson_submissions.re_evaluate': {
    methods: ["POST"]
    pattern: '/lessons/submissions/:submissionId/re-evaluate'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { submissionId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['reEvaluate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['reEvaluate']>>>
    }
  }
  'lesson_submissions.submit': {
    methods: ["POST"]
    pattern: '/lessons/:id/submit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['submit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['submit']>>>
    }
  }
  'lesson_submissions.for_lesson': {
    methods: ["GET","HEAD"]
    pattern: '/lessons/:id/submissions'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['forLesson']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lesson_submissions_controller').default['forLesson']>>>
    }
  }
  'chat_contacts.lookup': {
    methods: ["GET","HEAD"]
    pattern: '/chat/users/lookup/:suid'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { suid: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['lookup']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['lookup']>>>
    }
  }
  'chat_contacts.index': {
    methods: ["GET","HEAD"]
    pattern: '/chat/contacts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['index']>>>
    }
  }
  'chat_contacts.store': {
    methods: ["POST"]
    pattern: '/chat/contacts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/chat').createContactValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/chat').createContactValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'chat_contacts.update': {
    methods: ["PUT"]
    pattern: '/chat/contacts/:contactId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/chat').updateContactValidator)>>
      paramsTuple: [ParamValue]
      params: { contactId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/chat').updateContactValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'chat_contacts.destroy': {
    methods: ["DELETE"]
    pattern: '/chat/contacts/:contactId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { contactId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['destroy']>>>
    }
  }
  'chat_contacts.blocks': {
    methods: ["GET","HEAD"]
    pattern: '/chat/blocks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['blocks']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['blocks']>>>
    }
  }
  'chat_contacts.block': {
    methods: ["POST"]
    pattern: '/chat/blocks'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/chat').blockUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/chat').blockUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['block']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['block']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'chat_contacts.unblock': {
    methods: ["DELETE"]
    pattern: '/chat/blocks/:userId'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { userId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['unblock']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_contacts_controller').default['unblock']>>>
    }
  }
  'chat_messages.conversations': {
    methods: ["GET","HEAD"]
    pattern: '/chat/conversations'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['conversations']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['conversations']>>>
    }
  }
  'chat_messages.messages': {
    methods: ["GET","HEAD"]
    pattern: '/chat/conversations/:id/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['messages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['messages']>>>
    }
  }
  'chat_messages.peer_messages': {
    methods: ["GET","HEAD"]
    pattern: '/chat/peer/:peerId/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { peerId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['peerMessages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['peerMessages']>>>
    }
  }
  'chat_messages.read_peer': {
    methods: ["POST"]
    pattern: '/chat/peer/:peerId/read'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/chat').markReadValidator)>>
      paramsTuple: [ParamValue]
      params: { peerId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/chat').markReadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['readPeer']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['readPeer']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'chat_messages.conv_messages': {
    methods: ["GET","HEAD"]
    pattern: '/chat/:convKey/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { convKey: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['convMessages']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['convMessages']>>>
    }
  }
  'chat_messages.conv_post_message': {
    methods: ["POST"]
    pattern: '/chat/:convKey/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { convKey: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['convPostMessage']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['convPostMessage']>>>
    }
  }
  'chat_messages.store': {
    methods: ["POST"]
    pattern: '/chat/messages'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/chat').sendMessageValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/chat').sendMessageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'chat_messages.read': {
    methods: ["POST"]
    pattern: '/chat/conversations/:id/read'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/chat').markReadValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/chat').markReadValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['read']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['read']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'chat_messages.destroy': {
    methods: ["DELETE"]
    pattern: '/chat/messages/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['destroy']>>>
    }
  }
  'chat_messages.typing': {
    methods: ["POST"]
    pattern: '/chat/typing'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/chat').typingValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/chat').typingValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['typing']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['typing']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'chat_reactions.set': {
    methods: ["PUT"]
    pattern: '/chat/reactions'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/chat').reactionValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/chat').reactionValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_reactions_controller').default['set']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_reactions_controller').default['set']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
