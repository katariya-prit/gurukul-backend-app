import NotificationsController from '#controllers/notifications_controller'
import ProgressController from '#controllers/progresses_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import DepartmentsController from '#controllers/departments_controller'
import RolesController from '#controllers/roles_controller'
import SectionsController from '#controllers/sections_controller'
import DashboardController from '#controllers/dashboard_controller'

const AccessTokensController = () => import('#controllers/access_tokens_controller')
const UsersController = () => import('#controllers/users_controller')
const NewAccountController = () => import('#controllers/new_account_controller')

router.get('/', () => {
    return { hello: 'world' }
})

// ==================== AUTH ====================
router
    .group(() => {
        router.post('/register', [NewAccountController, 'store']).use(middleware.auth({ guards: ['api'] }))
        router.post('/login', [AccessTokensController, 'store'])
        router.post('/logout', [AccessTokensController, 'destroy']).use(middleware.auth({ guards: ['api'] }))
    })
    .prefix('/users')

// ==================== DEPARTMENTS ====================
router
    .group(() => {
        router.get('/', [DepartmentsController, 'index'])
        router.post('/create', [DepartmentsController, 'store'])
        router.put('/:id', [DepartmentsController, 'update'])
        router.get('/:id', [DepartmentsController, 'show'])
        router.get('/:id/users', [DepartmentsController, 'usersByDepartment'])
        router.delete('/delete/:id', [DepartmentsController, 'destroy'])
    })
    .prefix('/departments')
    .use(middleware.auth({ guards: ['api'] }))

// ==================== USERS ====================
router
    .group(() => {
        router.get('/', [UsersController, 'index'])
        router.get('/pending', [UsersController, 'pending'])
        router.put('/approve/:id', [UsersController, 'approve'])
        router.delete('/delete/:id', [UsersController, 'destroy'])
        router.get('/section/:sectionId', [UsersController, 'bySection'])
    })
    .prefix('/users')
    .use(middleware.auth({ guards: ['api'] }))

// ==================== ROLES ====================
router
    .group(() => {
        router.get('/', [RolesController, 'index'])
        router.post('/create', [RolesController, 'store'])
        router.put('/:roleCode', [RolesController, 'update'])
    })
    .prefix('/roles')
    .use(middleware.auth({ guards: ['api'] }))

// ==================== SECTIONS ====================
router
    .group(() => {
        router.get('/', [SectionsController, 'index'])
        router.get('/:id', [SectionsController, 'show'])
        router.get('/department/:departmentId', [SectionsController, 'byDepartment'])
        router.post('/create', [SectionsController, 'store'])
        router.put('/:id', [SectionsController, 'update'])
        router.delete('/delete/:id', [SectionsController, 'destroy'])
    })
    .prefix('/sections')
    .use(middleware.auth({ guards: ['api'] }))

// ==================== DASHBOARD ====================
router
    .group(() => {
        router.get('/stats', [DashboardController, 'stats'])
    })
    .prefix('/dashboard')
    .use(middleware.auth({ guards: ['api'] }))


router
    .group(() => {
        router.get('/departments', [ProgressController, 'allDepartments'])
        router.get('/department/:id', [ProgressController, 'departmentProgress'])
        router.get('/section/:id', [ProgressController, 'sectionProgress'])
        router.get('/user/:suid', [ProgressController, 'userProgress'])
    })
    .prefix('/progress')
    .use(middleware.auth({ guards: ['api'] }))


router
    .group(() => {
        router.get('/', [NotificationsController, 'index'])
        router.put('/:id/read', [NotificationsController, 'markRead'])
    })
    .prefix('/notifications')
    .use(middleware.auth({ guards: ['api'] }))