import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'departments.index': { paramsTuple?: []; params?: {} }
    'departments.store': { paramsTuple?: []; params?: {} }
    'departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.users_by_department': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.pending': { paramsTuple?: []; params?: {} }
    'users.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.by_section': { paramsTuple: [ParamValue]; params: {'sectionId': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'roles.store': { paramsTuple?: []; params?: {} }
    'roles.update': { paramsTuple: [ParamValue]; params: {'roleCode': ParamValue} }
    'sections.index': { paramsTuple?: []; params?: {} }
    'sections.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.by_department': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
    'sections.store': { paramsTuple?: []; params?: {} }
    'sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'departments.index': { paramsTuple?: []; params?: {} }
    'departments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.users_by_department': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.pending': { paramsTuple?: []; params?: {} }
    'users.by_section': { paramsTuple: [ParamValue]; params: {'sectionId': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'sections.index': { paramsTuple?: []; params?: {} }
    'sections.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.by_department': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
  }
  HEAD: {
    'departments.index': { paramsTuple?: []; params?: {} }
    'departments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'departments.users_by_department': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.index': { paramsTuple?: []; params?: {} }
    'users.pending': { paramsTuple?: []; params?: {} }
    'users.by_section': { paramsTuple: [ParamValue]; params: {'sectionId': ParamValue} }
    'roles.index': { paramsTuple?: []; params?: {} }
    'sections.index': { paramsTuple?: []; params?: {} }
    'sections.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.by_department': { paramsTuple: [ParamValue]; params: {'departmentId': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'access_tokens.store': { paramsTuple?: []; params?: {} }
    'access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'departments.store': { paramsTuple?: []; params?: {} }
    'roles.store': { paramsTuple?: []; params?: {} }
    'sections.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'departments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'roles.update': { paramsTuple: [ParamValue]; params: {'roleCode': ParamValue} }
    'sections.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'departments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'sections.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}