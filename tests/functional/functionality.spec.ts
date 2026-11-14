import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Functionality from '#models/functionality'
import FunctionalityItem from '#models/functionality_item'
import ItemRubric from '#models/item_rubric'
import StudentItem from '#models/student_item'

type ApiBody = {
  success: boolean
  message?: string
  data?: unknown
  meta?: unknown
}

test.group('Functionality API', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('list functionalities returns real seeded records', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const response = await client.get('/functionalities').loginAs(admin)

    response.assertStatus(200)
    const body = response.body() as ApiBody & { data: Array<Record<string, unknown>> }
    assert.isTrue(body.success)
    assert.isArray(body.data)
    assert.isAtLeast(body.data!.length, 4)

    const first = body.data![0]
    assert.isDefined(first.id)
    assert.isDefined(first.key)
    assert.isDefined(first.name)
    assert.isDefined(first.evaluatorType)
    assert.isDefined(first.departmentCount)
    assert.isDefined(first.itemCount)
  })

  test('create functionality persists record', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const uniqueKey = `test_func_${Date.now()}`

    const response = await client
      .post('/functionalities')
      .loginAs(admin)
      .json({
        name: 'Automation Testing',
        key: uniqueKey,
        description: 'Test suite functionality',
        icon: 'code',
        themeColor: '#3b82f6',
        evaluatorType: 'both',
        isActive: true,
      })

    response.assertStatus(201)
    const body = response.body() as ApiBody & { data: Record<string, unknown> }
    assert.isTrue(body.success)
    assert.equal(body.data!.name, 'Automation Testing')
    assert.equal(body.data!.key, uniqueKey)

    const inDb = await Functionality.findBy('key', uniqueKey)
    assert.isNotNull(inDb)
  })

  test('assign functionality to department with custom itemLabel', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const func = await Functionality.firstOrFail()

    const response = await client
      .put(`/functionalities/${func.id}/departments`)
      .loginAs(admin)
      .json({
        departments: [
          {
            departmentId: 1,
            itemLabel: 'Special Instrument',
            isEnabled: true,
          },
        ],
      })

    response.assertStatus(200)
    const body = response.body() as ApiBody & { data: Array<Record<string, unknown>> }
    assert.isTrue(body.success)
    assert.isArray(body.data)

    const assigned = body.data!.find((d) => d['departmentId'] === 1)
    assert.isDefined(assigned)
    assert.equal(assigned!['itemLabel'], 'Special Instrument')
    assert.isTrue(assigned!['isEnabled'] as boolean)
  })

  test('create item rejects when functionality is not enabled for department', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const uniqueKey = `orphan_func_${Date.now()}`

    const createFunc = await client
      .post('/functionalities')
      .loginAs(admin)
      .json({
        name: 'Orphan Functionality',
        key: uniqueKey,
        evaluatorType: 'teacher',
      })
    const funcId = (createFunc.body() as ApiBody & { data: Record<string, unknown> }).data!['id']

    const response = await client
      .post(`/functionalities/${funcId}/items`)
      .loginAs(admin)
      .json({
        departmentId: 9999,
        name: 'Invalid Item',
      })

    response.assertStatus(422)
    const body = response.body() as ApiBody
    assert.isFalse(body.success)
    assert.match(body.message!, /department enabled/i)
  })

  test('rejects rubric weights not summing to 100', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const item = await FunctionalityItem.firstOrFail()

    const response = await client
      .put(`/items/${item.id}/rubric`)
      .loginAs(admin)
      .json({
        criteria: [
          { key: 'c1', label: 'C1', weight: 40, maxPoints: 40 },
          { key: 'c2', label: 'C2', weight: 40, maxPoints: 40 },
        ],
      })

    response.assertStatus(422)
    const body = response.body() as ApiBody
    assert.isFalse(body.success)
    assert.match(body.message!, /sum exactly to 100/i)
  })

  test('save rubric twice makes v2 current while keeping v1 in history', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const item = await FunctionalityItem.firstOrFail()

    const v1Res = await client
      .put(`/items/${item.id}/rubric`)
      .loginAs(admin)
      .json({
        criteria: [
          { key: 'c1', label: 'Criterion 1', weight: 50, maxPoints: 50 },
          { key: 'c2', label: 'Criterion 2', weight: 50, maxPoints: 50 },
        ],
      })
    v1Res.assertStatus(200)
    const v1Body = v1Res.body() as ApiBody & { data: Record<string, unknown> }
    const v1Num = v1Body.data!['version'] as number

    const v2Res = await client
      .put(`/items/${item.id}/rubric`)
      .loginAs(admin)
      .json({
        criteria: [
          { key: 'c1', label: 'Criterion 1', weight: 70, maxPoints: 70 },
          { key: 'c2', label: 'Criterion 2', weight: 30, maxPoints: 30 },
        ],
      })
    v2Res.assertStatus(200)
    const v2Body = v2Res.body() as ApiBody & { data: Record<string, unknown> }
    const v2Num = v2Body.data!['version'] as number

    assert.equal(v2Num, v1Num + 1)
    assert.isTrue(v2Body.data!['isCurrent'] as boolean)

    const prev = await ItemRubric.query().where('item_id', item.id).where('version', v1Num).first()
    assert.isNotNull(prev)
    assert.isFalse(prev!.isCurrent)

    const versionsRes = await client.get(`/items/${item.id}/rubric/versions`).loginAs(admin)
    versionsRes.assertStatus(200)
    const list = (versionsRes.body() as ApiBody & { data: unknown[] }).data!
    assert.isAtLeast(list.length, 2)
  })

  test('save levels rejects first minPoints != 0 and non-increasing minPoints', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const item = await FunctionalityItem.firstOrFail()

    const resNonZero = await client
      .put(`/items/${item.id}/levels`)
      .loginAs(admin)
      .json({
        levels: [
          { levelNo: 1, name: 'L1', minPoints: 50, promoteMode: 'auto' },
          { levelNo: 2, name: 'L2', minPoints: 100, promoteMode: 'auto' },
        ],
      })
    resNonZero.assertStatus(422)
    assert.match((resNonZero.body() as ApiBody).message!, /First level minPoints must be 0/i)

    const resDecreasing = await client
      .put(`/items/${item.id}/levels`)
      .loginAs(admin)
      .json({
        levels: [
          { levelNo: 1, name: 'L1', minPoints: 0, promoteMode: 'auto' },
          { levelNo: 2, name: 'L2', minPoints: 150, promoteMode: 'auto' },
          { levelNo: 3, name: 'L3', minPoints: 100, promoteMode: 'auto' },
        ],
      })
    resDecreasing.assertStatus(422)
    assert.match((resDecreasing.body() as ApiBody).message!, /strictly increasing/i)

    const resValid = await client
      .put(`/items/${item.id}/levels`)
      .loginAs(admin)
      .json({
        levels: [
          { levelNo: 1, name: 'Beginner', minPoints: 0, promoteMode: 'auto' },
          { levelNo: 2, name: 'Intermediate', minPoints: 100, promoteMode: 'auto' },
          { levelNo: 3, name: 'Advanced', minPoints: 300, promoteMode: 'auto' },
          { levelNo: 4, name: 'Expert', minPoints: 600, promoteMode: 'auto' },
        ],
      })
    resValid.assertStatus(200)
    assert.equal((resValid.body() as ApiBody & { data: unknown[] }).data!.length, 4)
  })

  test('save permissions replaces permission set transactionally', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const item = await FunctionalityItem.firstOrFail()

    const response = await client
      .put(`/items/${item.id}/permissions`)
      .loginAs(admin)
      .json({
        roleCodes: ['HEAD100', 'SECHEAD101'],
        sectionIds: [],
        userSuids: [],
      })

    response.assertStatus(200)
    const body = response.body() as ApiBody & { data: Record<string, unknown> }
    assert.isTrue(body.success)
    assert.sameMembers(body.data!['roleCodes'] as string[], ['HEAD100', 'SECHEAD101'])
  })

  test('enroll twice is idempotent and does not create duplicates', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const item = await FunctionalityItem.firstOrFail()
    const student = await User.query()
      .where('role_code', 'STUDENT')
      .where('department_id', item.departmentId)
      .firstOrFail()
    const studentSuid = Number(student.suid)

    const res1 = await client
      .post(`/items/${item.id}/enroll`)
      .loginAs(admin)
      .json({ studentSuids: [studentSuid], enrolled: true })
    res1.assertStatus(200)

    const res2 = await client
      .post(`/items/${item.id}/enroll`)
      .loginAs(admin)
      .json({ studentSuids: [studentSuid], enrolled: true })
    res2.assertStatus(200)

    const count = await StudentItem.query().where('item_id', item.id).where('student_suid', studentSuid)
    assert.equal(count.length, 1)
  })

  test('deactivate keeps record in DB with is_active = false', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const uniqueKey = `deactivate_func_${Date.now()}`

    const createRes = await client
      .post('/functionalities')
      .loginAs(admin)
      .json({ name: 'Temporary Func', key: uniqueKey, evaluatorType: 'teacher' })
    const funcId = (createRes.body() as ApiBody & { data: Record<string, unknown> }).data!['id'] as number

    const deleteRes = await client.delete(`/functionalities/${funcId}`).loginAs(admin)
    deleteRes.assertStatus(200)

    const inDb = await Functionality.find(funcId)
    assert.isNotNull(inDb)
    assert.isFalse(inDb!.isActive)

    const activeList = await client.get('/functionalities?isActive=true').loginAs(admin)
    activeList.assertStatus(200)
    const activeIds = (activeList.body() as ApiBody & { data: Array<Record<string, unknown>> }).data!.map(
      (f) => f['id']
    )
    assert.notInclude(activeIds, funcId)
  })

  test('non-super-admin receives 403 on management endpoints', async ({ client }) => {
    const nonAdmin = await User.findByOrFail('username', 'tirth')

    const response = await client
      .post('/functionalities')
      .loginAs(nonAdmin)
      .json({ name: 'Forbidden Func', key: 'forbidden_key', evaluatorType: 'teacher' })

    response.assertStatus(403)
  })

  test('summaries response shape matches frontend contract', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const response = await client.get('/items/summaries').loginAs(admin)

    response.assertStatus(200)
    const body = response.body() as ApiBody & { data: Array<Record<string, unknown>> }
    assert.isTrue(body.success)
    assert.isArray(body.data)
    assert.isAbove(body.data!.length, 0)

    const item = body.data![0]
    assert.isDefined(item['id'])
    assert.isDefined(item['functionalityId'])
    assert.isDefined(item['functionalityName'])
    assert.isDefined(item['departmentId'])
    assert.isDefined(item['departmentName'])
    assert.isDefined(item['itemLabel'])
    assert.isDefined(item['name'])
    assert.isDefined(item['isActive'])

    const levels = item['levels'] as Record<string, unknown>
    assert.isDefined(levels)
    assert.isDefined(levels['count'])
    assert.isDefined(levels['promoteSummary'])

    const permissions = item['permissions'] as Record<string, unknown>
    assert.isDefined(permissions)
    assert.isDefined(permissions['roleCount'])
    assert.isDefined(permissions['sectionCount'])
    assert.isDefined(permissions['userCount'])
  })
})
