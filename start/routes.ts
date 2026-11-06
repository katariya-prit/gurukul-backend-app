import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import transmit from '@adonisjs/transmit/services/main'

const AccessTokensController = () => import('#controllers/access_tokens_controller')
const DailyDarshansController = () => import('#controllers/daily_darshans_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const DepartmentsController = () => import('#controllers/departments_controller')
const GroupsController = () => import('#controllers/groups_controller')
const LessonController = () => import('#controllers/lessons_controller')
const LessonSubmissionsController = () => import('#controllers/lesson_submissions_controller')
const NewAccountController = () => import('#controllers/new_account_controller')
const NotificationsController = () => import('#controllers/notifications_controller')
const OverviewsController = () => import('#controllers/overviews_controller')
const ProfileController = () => import('#controllers/profile_controller')
const ProgressController = () => import('#controllers/progresses_controller')
const QuotesController = () => import('#controllers/quotes_controller')
const RolesController = () => import('#controllers/roles_controller')
const SectionsController = () => import('#controllers/sections_controller')
const UploadController = () => import('#controllers/uploads_controller')
const UsersController = () => import('#controllers/users_controller')

transmit.registerRoutes()

const apiAuth = middleware.auth({ guards: ['api'] })
const permission = middleware.permission

router.get('/', () => ({ success: true, message: 'Gurukul API is running' }))
router.get('/overview', [OverviewsController, 'index'])
router.get('/quotes/type/:type', [QuotesController, 'getQuotesByType'])
router.get('/daily-darshan', [DailyDarshansController, 'index'])

router
  .group(() => {
    router
      .post('/register', [NewAccountController, 'store'])
      .use(apiAuth)
      .use(permission({ module: 'Users', action: 'create' }))
    router.post('/login', [AccessTokensController, 'store'])
    router.post('/logout', [AccessTokensController, 'destroy']).use(apiAuth)
    router.get('/profile', [ProfileController, 'show']).use(apiAuth)
  })
  .prefix('/users')

router
  .group(() => {
    router
      .get('/pending', [UsersController, 'pending'])
      .use(permission({ module: 'Users', action: 'view' }))
    router
      .get('/section/:sectionId', [UsersController, 'bySection'])
      .use(permission({ module: 'Student', action: 'view' }))
    router.get('/', [UsersController, 'index']).use(permission({ module: 'Users', action: 'view' }))
    router
      .put('/approve/:id', [UsersController, 'approve'])
      .use(permission({ module: 'Users', action: 'edit' }))
    router
      .put('/:id', [UsersController, 'update'])
      .use(permission({ module: 'Users', action: 'edit' }))
    router
      .delete('/delete/:id', [UsersController, 'destroy'])
      .use(permission({ module: 'Users', action: 'delete' }))
  })
  .prefix('/users')
  .use(apiAuth)

router
  .group(() => {
    router.get('/', [DepartmentsController, 'index'])
    router
      .post('/create', [DepartmentsController, 'store'])
      .use(permission({ module: 'Department', action: 'create' }))
    router
      .get('/:id/users', [DepartmentsController, 'usersByDepartment'])
      .use(permission({ module: 'Student', action: 'view' }))
    router.get('/:id', [DepartmentsController, 'show'])
    router
      .put('/:id', [DepartmentsController, 'update'])
      .use(permission({ module: 'Department', action: 'edit' }))
    router
      .delete('/delete/:id', [DepartmentsController, 'destroy'])
      .use(permission({ module: 'Department', action: 'delete' }))
  })
  .prefix('/departments')
  .use(apiAuth)

router
  .group(() => {
    router
      .get('/', [RolesController, 'index'])
      .use(permission({ module: 'RolesPermissions', action: 'view' }))
    router
      .post('/create', [RolesController, 'store'])
      .use(permission({ module: 'RolesPermissions', action: 'create' }))
    router
      .put('/:roleCode', [RolesController, 'update'])
      .use(permission({ module: 'RolesPermissions', action: 'edit' }))
  })
  .prefix('/roles')
  .use(apiAuth)

router
  .group(() => {
    router.get('/department/:departmentId', [SectionsController, 'byDepartment'])
    router.get('/', [SectionsController, 'index'])
    router
      .post('/create', [SectionsController, 'store'])
      .use(permission({ module: 'Section', action: 'create' }))
    router.get('/:id', [SectionsController, 'show'])
    router
      .put('/:id', [SectionsController, 'update'])
      .use(permission({ module: 'Section', action: 'edit' }))
    router
      .delete('/delete/:id', [SectionsController, 'destroy'])
      .use(permission({ module: 'Section', action: 'delete' }))
  })
  .prefix('/sections')
  .use(apiAuth)

router
  .group(() => {
    router
      .get('/stats', [DashboardController, 'stats'])
      .use(permission({ module: 'Dashboard', action: 'view' }))
  })
  .prefix('/dashboard')
  .use(apiAuth)

router
  .group(() => {
    router
      .get('/departments', [ProgressController, 'allDepartments'])
      .use(permission({ module: 'Progress', action: 'view' }))
    router
      .get('/department/:id', [ProgressController, 'departmentProgress'])
      .use(permission({ module: 'Progress', action: 'view' }))
    router
      .get('/section/:id', [ProgressController, 'sectionProgress'])
      .use(permission({ module: 'Progress', action: 'view' }))
    router
      .get('/user/:suid', [ProgressController, 'userProgress'])
      .use(permission({ module: 'Progress', action: 'view' }))
  })
  .prefix('/progress')
  .use(apiAuth)

router
  .group(() => {
    router.get('/', [NotificationsController, 'index'])
    router.put('/read-all', [NotificationsController, 'markAllRead'])
    router.put('/:id/read', [NotificationsController, 'markRead'])
  })
  .prefix('/notifications')
  .use(apiAuth)

router
  .group(() => {
    router
      .get('/members', [GroupsController, 'members'])
      .use(permission({ module: 'Group', action: 'create' }))
    router
      .get('/list', [GroupsController, 'index'])
      .use(permission({ module: 'Group', action: 'view' }))
    router
      .get('/member/:suid', [GroupsController, 'byMember'])
      .use(permission({ module: 'Group', action: 'view' }))
    router
      .post('/create', [GroupsController, 'store'])
      .use(permission({ module: 'Group', action: 'create' }))
    router
      .get('/:id', [GroupsController, 'show'])
      .use(permission({ module: 'Group', action: 'view' }))
    router
      .put('/:id', [GroupsController, 'update'])
      .use(permission({ module: 'Group', action: 'edit' }))
    router
      .delete('/:id', [GroupsController, 'destroy'])
      .use(permission({ module: 'Group', action: 'delete' }))
  })
  .prefix('/groups')
  .use(apiAuth)

router
  .group(() => {
    router
      .post('/update', [OverviewsController, 'store'])
      .use(permission({ module: 'OverviewEdit', action: 'create' }))
    router
      .patch('/:id', [OverviewsController, 'updateMetadata'])
      .use(permission({ module: 'OverviewEdit', action: 'edit' }))
    router
      .delete('/:id', [OverviewsController, 'destroy'])
      .use(permission({ module: 'OverviewEdit', action: 'delete' }))
  })
  .prefix('/overview')
  .use(apiAuth)

router
  .group(() => {
    router.post('/', [QuotesController, 'createQuote'])
    router.put('/:id', [QuotesController, 'updateQuote'])
    router.delete('/:id', [QuotesController, 'deleteQuote'])
  })
  .prefix('/quotes')
  .use(apiAuth)

router
  .group(() => {
    router
      .post('/', [DailyDarshansController, 'store'])
      .use(permission({ module: 'DailyDarshan', action: 'create' }))
    router
      .put('/:id', [DailyDarshansController, 'update'])
      .use(permission({ module: 'DailyDarshan', action: 'edit' }))
    router
      .delete('/:id', [DailyDarshansController, 'destroy'])
      .use(permission({ module: 'DailyDarshan', action: 'delete' }))
  })
  .prefix('/daily-darshan')
  .use(apiAuth)

router
  .group(() => {
    router.post('/avatar', [UploadController, 'avatar'])
    router.post('/section', [UploadController, 'section'])
  })
  .prefix('/upload')
  .use(apiAuth)

router
  .group(() => {
    router.post('/create', [LessonController, 'store'])
    router.get('/my', [LessonController, 'myLessons'])
    router.get('/created', [LessonController, 'created'])
    router.delete('/delete/:id', [LessonController, 'destroy'])
    router.get('/submissions/mine', [LessonSubmissionsController, 'mine'])
    router.put('/submissions/:submissionId/grade', [LessonSubmissionsController, 'grade'])
    router.post('/submissions/:submissionId/re-evaluate', [
      LessonSubmissionsController,
      'reEvaluate',
    ])
    router.post('/:id/submit', [LessonSubmissionsController, 'submit'])
    router.get('/:id/submissions', [LessonSubmissionsController, 'forLesson'])
  })
  .prefix('/lessons')
  .use(apiAuth)
