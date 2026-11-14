import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Department from '#models/department'
import Functionality from '#models/functionality'
import DepartmentFunctionality from '#models/department_functionality'

type ApiBody = {
  success: boolean
  message?: string
  data?: unknown
  meta?: unknown
}

test.group('Department Functionalities API', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('light list with all=true returns unpaginated functionalities sorted by name', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const response = await client.get('/functionalities?isActive=true&all=true').loginAs(admin)

    response.assertStatus(200)
    const body = response.body() as ApiBody & { data: Array<Record<string, unknown>> }
    assert.isTrue(body.success)
    assert.isArray(body.data)
    assert.isAtLeast(body.data!.length, 1)

    const first = body.data![0]
    assert.isDefined(first['id'])
    assert.isDefined(first['key'])
    assert.isDefined(first['name'])
    assert.isDefined(first['evaluatorType'])
    assert.isDefined(first['isActive'])
    assert.isUndefined(first['departmentCount'])
    assert.isUndefined(first['itemCount'])

    const names = body.data!.map((f) => String(f['name']))
    const sorted = [...names].sort((a, b) => a.localeCompare(b))
    assert.deepEqual(names, sorted)
  })

  test('department create response includes guaranteed id fields', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const uniqueName = `Test Dept ${Date.now()}`

    const response = await client
      .post('/departments/create')
      .loginAs(admin)
      .json({
        departmentName: uniqueName,
        description: 'Temporary department for functional test',
      })

    response.assertStatus(201)
    const body = response.body() as ApiBody & { data: Record<string, unknown> }
    assert.isTrue(body.success)
    assert.isDefined(body.data!['departmentId'])
    assert.isDefined(body.data!['id'])
    assert.isDefined(body.data!['department_id'])
    assert.equal(body.data!['departmentName'], uniqueName)
  })

  test('list for a fresh department returns empty array', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const dept = await Department.create({
      departmentName: `Fresh Dept ${Date.now()}`,
      description: 'No functionalities assigned yet',
    })

    const response = await client.get(`/departments/${dept.departmentId}/functionalities`).loginAs(admin)

    response.assertStatus(200)
    const body = response.body() as ApiBody & { data: unknown[] }
    assert.isTrue(body.success)
    assert.isArray(body.data)
    assert.equal(body.data!.length, 0)
  })

  test('sync enables two functionalities with labels and correct response shape', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const dept = await Department.create({
      departmentName: `Sync Dept ${Date.now()}`,
      description: 'Testing sync assignments',
    })
    const funcs = await Functionality.query().where('is_active', true).limit(2)
    assert.isAtLeast(funcs.length, 2)

    const response = await client
      .put(`/departments/${dept.departmentId}/functionalities`)
      .loginAs(admin)
      .json({
        functionalities: [
          { functionalityId: funcs[0].id, isEnabled: true, itemLabel: 'Instrument' },
          { functionalityId: funcs[1].id, isEnabled: true, itemLabel: 'Skill' },
        ],
      })

    response.assertStatus(200)
    const body = response.body() as ApiBody & {
      data: Array<Record<string, unknown>>
      meta?: { enabledCount: number }
    }
    assert.isTrue(body.success)
    assert.equal(body.meta?.enabledCount, 2)
    assert.equal(body.data!.length, 2)

    const row0 = body.data!.find((r) => r['functionalityId'] === funcs[0].id)
    assert.isDefined(row0)
    assert.equal(row0!['itemLabel'], 'Instrument')
    assert.isTrue(row0!['isEnabled'])
    assert.isTrue(row0!['functionalityIsActive'])

    const row1 = body.data!.find((r) => r['functionalityId'] === funcs[1].id)
    assert.isDefined(row1)
    assert.equal(row1!['itemLabel'], 'Skill')
    assert.isTrue(row1!['isEnabled'])
  })

  test('re-sync is idempotent and creates zero duplicates', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const dept = await Department.create({
      departmentName: `Idempotent Dept ${Date.now()}`,
      description: 'Testing duplicate safety',
    })
    const funcs = await Functionality.query().where('is_active', true).limit(2)

    const payload = {
      functionalities: [
        { functionalityId: funcs[0].id, isEnabled: true, itemLabel: 'Form' },
        { functionalityId: funcs[1].id, isEnabled: true, itemLabel: 'Track' },
      ],
    }

    const res1 = await client.put(`/departments/${dept.departmentId}/functionalities`).loginAs(admin).json(payload)
    res1.assertStatus(200)

    const res2 = await client.put(`/departments/${dept.departmentId}/functionalities`).loginAs(admin).json(payload)
    res2.assertStatus(200)

    const count = await DepartmentFunctionality.query().where('department_id', dept.departmentId)
    assert.equal(count.length, 2)
  })

  test('disable keeps row in database with is_enabled = false', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const dept = await Department.create({
      departmentName: `Disable Dept ${Date.now()}`,
      description: 'Testing disable preservation',
    })
    const funcs = await Functionality.query().where('is_active', true).limit(2)

    await client
      .put(`/departments/${dept.departmentId}/functionalities`)
      .loginAs(admin)
      .json({
        functionalities: [
          { functionalityId: funcs[0].id, isEnabled: true, itemLabel: 'Instrument' },
          { functionalityId: funcs[1].id, isEnabled: true, itemLabel: 'Skill' },
        ],
      })

    const disableRes = await client
      .put(`/departments/${dept.departmentId}/functionalities`)
      .loginAs(admin)
      .json({
        functionalities: [
          { functionalityId: funcs[0].id, isEnabled: false, itemLabel: 'Instrument' },
          { functionalityId: funcs[1].id, isEnabled: true, itemLabel: 'Skill' },
        ],
      })

    disableRes.assertStatus(200)
    const body = disableRes.body() as ApiBody & { meta?: { enabledCount: number } }
    assert.equal(body.meta?.enabledCount, 1)

    const inDb = await DepartmentFunctionality.query().where('department_id', dept.departmentId)
    assert.equal(inDb.length, 2)
    const disabledRow = inDb.find((r) => r.functionalityId === funcs[0].id)
    assert.isNotNull(disabledRow)
    assert.isFalse(disabledRow!.isEnabled)
  })

  test('rejects duplicate functionality IDs in sync request with 422', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const dept = await Department.create({
      departmentName: `Dup Dept ${Date.now()}`,
      description: 'Testing duplicate rejection',
    })
    const func = await Functionality.firstOrFail()

    const response = await client
      .put(`/departments/${dept.departmentId}/functionalities`)
      .loginAs(admin)
      .json({
        functionalities: [
          { functionalityId: func.id, isEnabled: true, itemLabel: 'First' },
          { functionalityId: func.id, isEnabled: true, itemLabel: 'Second' },
        ],
      })

    response.assertStatus(422)
    const body = response.body() as ApiBody
    assert.isFalse(body.success)
    assert.match(body.message!, /duplicate functionality in request/i)
  })

  test('rejects unknown functionality ID with 422', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const dept = await Department.create({
      departmentName: `Unknown Func Dept ${Date.now()}`,
      description: 'Testing unknown func rejection',
    })

    const response = await client
      .put(`/departments/${dept.departmentId}/functionalities`)
      .loginAs(admin)
      .json({
        functionalities: [{ functionalityId: 987654, isEnabled: true, itemLabel: 'Unknown' }],
      })

    response.assertStatus(422)
    const body = response.body() as ApiBody
    assert.isFalse(body.success)
    assert.match(body.message!, /unknown functionality ids/i)
  })

  test('rejects newly enabling an inactive functionality with 422', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const dept = await Department.create({
      departmentName: `Inactive Func Dept ${Date.now()}`,
      description: 'Testing inactive enable rejection',
    })
    const inactiveFunc = await Functionality.create({
      name: `Inactive Func ${Date.now()}`,
      key: `inactive_func_${Date.now()}`,
      evaluatorType: 'teacher',
      isActive: false,
    })

    const response = await client
      .put(`/departments/${dept.departmentId}/functionalities`)
      .loginAs(admin)
      .json({
        functionalities: [{ functionalityId: inactiveFunc.id, isEnabled: true, itemLabel: 'Item' }],
      })

    response.assertStatus(422)
    const body = response.body() as ApiBody
    assert.isFalse(body.success)
    assert.match(body.message!, /inactive and cannot be newly enabled/i)
  })

  test('returns 404 for nonexistent department', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')

    const getRes = await client.get('/departments/999999/functionalities').loginAs(admin)
    getRes.assertStatus(404)
    assert.isFalse((getRes.body() as ApiBody).success)

    const putRes = await client
      .put('/departments/999999/functionalities')
      .loginAs(admin)
      .json({ functionalities: [] })
    putRes.assertStatus(404)
    assert.isFalse((putRes.body() as ApiBody).success)
  })

  test('returns 403 for user role without permission', async ({ client }) => {
    const student = await User.query().where('role_code', 'STUDENT').firstOrFail()

    const response = await client.get('/departments/1/functionalities').loginAs(student)
    response.assertStatus(403)
  })

  test('department GET responses include functionalityCount and functionalities array', async ({ client, assert }) => {
    const admin = await User.findByOrFail('username', 'super-admin')
    const dept = await Department.create({
      departmentName: `Enriched Dept ${Date.now()}`,
      description: 'Testing GET enrichment',
    })
    const funcs = await Functionality.query().where('is_active', true).limit(2)

    await client
      .put(`/departments/${dept.departmentId}/functionalities`)
      .loginAs(admin)
      .json({
        functionalities: [
          { functionalityId: funcs[0].id, isEnabled: true, itemLabel: 'Label Alpha' },
          { functionalityId: funcs[1].id, isEnabled: true, itemLabel: 'Label Beta' },
        ],
      })

    const singleRes = await client.get(`/departments/${dept.departmentId}`).loginAs(admin)
    singleRes.assertStatus(200)
    const singleBody = singleRes.body() as ApiBody & { data: Record<string, unknown> }
    assert.isTrue(singleBody.success)
    assert.equal(singleBody.data!['departmentId'], dept.departmentId)
    assert.equal(singleBody.data!['functionalityCount'], 2)
    assert.isArray(singleBody.data!['functionalities'])
    assert.equal((singleBody.data!['functionalities'] as unknown[]).length, 2)

    const listRes = await client.get('/departments').loginAs(admin)
    listRes.assertStatus(200)
    const listBody = listRes.body() as ApiBody & { data: Array<Record<string, unknown>> }
    assert.isTrue(listBody.success)
    const target = listBody.data!.find((d) => d['departmentId'] === dept.departmentId)
    assert.isDefined(target)
    assert.equal(target!['functionalityCount'], 2)
    assert.equal((target!['functionalities'] as unknown[]).length, 2)
  })
})
