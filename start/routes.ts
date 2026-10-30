import QuotesController from '#controllers/quotes_controller'
import GroupsController from '#controllers/groups_controller'
import NotificationsController from '#controllers/notifications_controller'
import ProgressController from '#controllers/progresses_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import OverviewsController from '#controllers/overviews_controller'
import DepartmentsController from '#controllers/departments_controller'
import RolesController from '#controllers/roles_controller'
import SectionsController from '#controllers/sections_controller'
import DashboardController from '#controllers/dashboard_controller'
import UploadController from '#controllers/uploads_controller'
import LessonController from '#controllers/lessons_controller'
import DailyDarshansController from '#controllers/daily_darshans_controller'

const AccessTokensController = () => import('#controllers/access_tokens_controller')
const UsersController = () => import('#controllers/users_controller')
const NewAccountController = () => import('#controllers/new_account_controller')

router.get('/', () => {
    return { success: true, message: 'Gurukul API is running' }
})

router.get('/overview', [OverviewsController, 'index'])
router.get('/quotes/type/:type', [QuotesController, 'getQuotesByType'])
router.get('/daily-darshan', [DailyDarshansController, 'index'])

router
    .group(() => {
        router.post('/register', [NewAccountController, 'store']).use(middleware.auth({ guards: ['api'] }))
        router.post('/login', [AccessTokensController, 'store'])
        router.post('/logout', [AccessTokensController, 'destroy']).use(middleware.auth({ guards: ['api'] }))
    })
    .prefix('/users')

router
    .group(() => {
        router.get('/', [DepartmentsController, 'index'])
        router.post('/create', [DepartmentsController, 'store'])
        router.get('/:id/users', [DepartmentsController, 'usersByDepartment'])
        router.get('/:id', [DepartmentsController, 'show'])
        router.put('/:id', [DepartmentsController, 'update'])
        router.delete('/delete/:id', [DepartmentsController, 'destroy'])
    })
    .prefix('/departments')
    .use(middleware.auth({ guards: ['api'] }))

router
    .group(() => {
        router.get('/pending', [UsersController, 'pending'])
        router.get('/section/:sectionId', [UsersController, 'bySection'])
        router.get('/', [UsersController, 'index'])
        router.put('/approve/:id', [UsersController, 'approve'])
        router.delete('/delete/:id', [UsersController, 'destroy'])
    })
    .prefix('/users')
    .use(middleware.auth({ guards: ['api'] }))

router
    .group(() => {
        router.get('/', [RolesController, 'index'])
        router.post('/create', [RolesController, 'store'])
        router.put('/:roleCode', [RolesController, 'update'])
    })
    .prefix('/roles')
    .use(middleware.auth({ guards: ['api'] }))

router
    .group(() => {
        router.get('/department/:departmentId', [SectionsController, 'byDepartment'])
        router.get('/', [SectionsController, 'index'])
        router.post('/create', [SectionsController, 'store'])
        router.get('/:id', [SectionsController, 'show'])
        router.put('/:id', [SectionsController, 'update'])
        router.delete('/delete/:id', [SectionsController, 'destroy'])
    })
    .prefix('/sections')
    .use(middleware.auth({ guards: ['api'] }))

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

router
    .group(() => {
        router.get('/list', [GroupsController, 'index'])
        router.get('/member/:suid', [GroupsController, 'byMember'])
        router.post('/create', [GroupsController, 'store'])
        router.get('/:id', [GroupsController, 'show'])
        router.put('/:id', [GroupsController, 'update'])
        router.delete('/:id', [GroupsController, 'destroy'])
    })
    .prefix('/groups')
    .use(middleware.auth({ guards: ['api'] }))

router
    .group(() => {
        router.post('/update', [OverviewsController, 'store'])
        router.patch('/:id', [OverviewsController, 'updateMetadata'])
        router.delete('/:id', [OverviewsController, 'destroy'])
    })
    .prefix('/overview')
    .use(middleware.auth({ guards: ['api'] }))

router
    .group(() => {
        router.post('/', [QuotesController, 'createQuote'])
        router.put('/:id', [QuotesController, 'updateQuote'])
        router.delete('/:id', [QuotesController, 'deleteQuote'])
    })
    .prefix('/quotes')
    .use(middleware.auth({ guards: ['api'] }))

router
    .group(() => {
        router.post('/', [DailyDarshansController, 'store'])
        router.put('/:id', [DailyDarshansController, 'update'])
        router.delete('/:id', [DailyDarshansController, 'destroy'])
    })
    .prefix('/daily-darshan')
    .use(middleware.auth({ guards: ['api'] }))

router
    .group(() => {
        router.post('/avatar', [UploadController, 'avatar'])
        router.post('/section', [UploadController, 'section'])
    })
    .prefix('/upload')
    .use(middleware.auth({ guards: ['api'] }))

router
    .group(() => {
        router.post('/create', [LessonController, 'store'])
        router.get('/my', [LessonController, 'myLessons'])
        router.get('/created', [LessonController, 'created'])
        router.delete('/delete/:id', [LessonController, 'destroy'])
    })
    .prefix('/lessons')
    .use(middleware.auth({ guards: ['api'] }))