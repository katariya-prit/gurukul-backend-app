# Gurukul Backend

AdonisJS 6 REST API for the Gurukul school management platform.  
Stack: Node.js, AdonisJS 6, Lucid ORM, VineJS, PostgreSQL.

---

## Quick Start

```sh
cp .env.example .env
# fill in APP_KEY, DB_*, and CORS_ORIGINS
node ace key:generate
node ace migration:run
node ace db:seed --files database/seeders/default_datum_seeder.ts
node ace db:seed --files database/seeders/department_functionality_seeder.ts
node ace serve --watch
```

---

## Environment Variables

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `TZ` | yes | `UTC` | Node.js timezone |
| `PORT` | yes | `3333` | HTTP listen port |
| `HOST` | yes | `0.0.0.0` | Listen on all interfaces (use `127.0.0.1` for localhost-only) |
| `NODE_ENV` | yes | `development` | `development` / `production` / `test` |
| `APP_KEY` | yes | _(generated)_ | 32-byte secret for sessions and encryption |
| `APP_URL` | yes | `http://localhost:3333` | Full server URL (used in emails/links) |
| `LOG_LEVEL` | no | `info` | Pino log level |
| `SESSION_DRIVER` | yes | `cookie` | Session backend (`cookie` / `memory`) |
| `DB_CONNECTION` | yes | `pg` | Database driver |
| `DB_HOST` | yes | `127.0.0.1` | Postgres host |
| `DB_PORT` | yes | `5432` | Postgres port |
| `DB_USER` | yes | `postgres` | Postgres username |
| `DB_PASSWORD` | yes | — | Postgres password |
| `DB_DATABASE` | yes | `Gurukul` | Postgres database name |
| `CORS_ORIGIN` | yes | `http://localhost:5173` | Comma-separated CORS allowed origins (legacy key) |
| `CORS_ORIGINS` | yes | `http://localhost:5173,http://localhost:3000` | Comma-separated CORS allowed origins |

---

## Database

### Migrations

```sh
node ace migration:run           # apply pending
node ace migration:rollback      # roll back last batch
node ace migration:status        # view status of all migrations
```

### Seeders

| Seeder | Purpose | Idempotent |
|---|---|---|
| `default_datum_seeder.ts` | Roles, demo departments, sections, users | Yes |
| `department_functionality_seeder.ts` | Functionalities, dept assignments, items, rubrics, levels, permissions, widgets | Yes (safe to run twice) |

```sh
node ace db:seed --files database/seeders/default_datum_seeder.ts
node ace db:seed --files database/seeders/department_functionality_seeder.ts
```

Both seeders are idempotent — running them a second time creates zero duplicate records.

---

## Functionality API

The Functionality system powers the **Functionality Manager** in the frontend.  
All routes require a valid session or Bearer token and the `Functionality` module permission.  
`SUPER_ADMIN` bypasses all permission checks.

### Auth

```
POST /users/login
{ "username": "super-admin", "password": "admin123" }
```

Response includes a Bearer token (place in `Authorization: Bearer <token>` header).

### Response Shape

Every response is JSON with this envelope:

```json
{ "success": true, "data": ..., "meta": { "page": 1, "limit": 20, "total": 4, "totalPages": 1 } }
```

Errors always include `"success": false` and a human-readable `"message"`.

### Endpoints Summary

#### Functionalities

| Method | Route | Action | Permission |
|---|---|---|---|
| GET | `/functionalities` | List (paginated, search, isActive) | view |
| POST | `/functionalities` | Create | create |
| GET | `/functionalities/:id` | Get single | view |
| PUT | `/functionalities/:id` | Update | edit |
| PATCH | `/functionalities/:id/active` | Toggle active | edit |
| DELETE | `/functionalities/:id` | Soft-delete (is_active=false) | delete |
| GET | `/functionalities/:id/departments` | List dept assignments | view |
| PUT | `/functionalities/:id/departments` | Bulk set dept assignments | edit |

#### Department Functionalities

Used by the Create/Edit Department form (`Create-Department.tsx`) and the Functionality Manager.

| Method | Route | Action | Permission |
|---|---|---|---|
| GET | `/departments/:departmentId/functionalities` | List all assigned functionalities (enabled & disabled) | `Department.create` / `Department.edit` or `Functionality.view` |
| PUT | `/departments/:departmentId/functionalities` | Sync assignments (upsert, toggle enable/disable) | `Department.create` / `Department.edit` |

##### Request & Response Examples

**GET `/departments/1/functionalities`**
```json
{
  "success": true,
  "data": [
    {
      "functionalityId": 1,
      "name": "Instrumental Marking",
      "key": "instrumental_marking",
      "icon": "music",
      "themeColor": "#3b82f6",
      "evaluatorType": "teacher",
      "functionalityIsActive": true,
      "isEnabled": true,
      "itemLabel": "Instrument"
    }
  ]
}
```

**PUT `/departments/1/functionalities`**
```json
{
  "functionalities": [
    { "functionalityId": 1, "isEnabled": true, "itemLabel": "Instrument" },
    { "functionalityId": 2, "isEnabled": false, "itemLabel": "Dance Form" }
  ]
}
```
Response:
```json
{
  "success": true,
  "message": "Functionalities updated successfully.",
  "data": [...],
  "meta": { "enabledCount": 1 }
}
```

##### cURL Examples

```sh
# Fetch dropdown list for department form (light payload, sorted by name)
curl -X GET "http://localhost:3333/functionalities?isActive=true&all=true" \
  -H "Authorization: Bearer <TOKEN>"

# Get functionalities assigned to department #1
curl -X GET "http://localhost:3333/departments/1/functionalities" \
  -H "Authorization: Bearer <TOKEN>"

# Sync functionalities for department #1
curl -X PUT "http://localhost:3333/departments/1/functionalities" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"functionalities":[{"functionalityId":1,"isEnabled":true,"itemLabel":"Instrument"}]}'
```

#### Items

| Method | Route | Action | Permission |
|---|---|---|---|
| GET | `/items` | List (functionalityId, departmentId, search) | view |
| GET | `/items/summaries` | Rich summaries (rubric + levels + permissions) | view |
| GET | `/functionalities/:id/items` | Items for functionality | view |
| POST | `/functionalities/:id/items` | Create item | create |
| PUT | `/items/:itemId` | Update item | edit |
| PATCH | `/items/:itemId/active` | Toggle active | edit |
| DELETE | `/items/:itemId` | Soft-delete | delete |

#### Rubrics

| Method | Route | Action | Permission |
|---|---|---|---|
| GET | `/items/:itemId/rubric` | List all versions (`isCurrent` flag per version) | view |
| GET | `/items/:itemId/rubric/versions` | Alias for versions list | view |
| PUT | `/items/:itemId/rubric` | Save new version (old becomes isCurrent=false) | edit |

#### Levels

| Method | Route | Action | Permission |
|---|---|---|---|
| GET | `/items/:itemId/levels` | List levels | view |
| PUT | `/items/:itemId/levels` | Replace level set | edit |

#### Permissions

| Method | Route | Action | Permission |
|---|---|---|---|
| GET | `/items/:itemId/permissions` | Get current permissions | view |
| PUT | `/items/:itemId/permissions` | Replace permissions (roleCodes, sectionIds, userSuids) | edit |

#### Enrollment

| Method | Route | Action | Permission |
|---|---|---|---|
| GET | `/items/:itemId/enroll` | Get enrollment overview | view |
| POST | `/items/:itemId/enroll` | Enroll / unenroll students | edit |
| GET | `/items/:itemId/enrollments` | Detailed enrollment list | view |
| PUT | `/items/:itemId/enrollments/:studentSuid` | Update single enrollment | edit |
| DELETE | `/items/:itemId/enrollments/:studentSuid` | Remove enrollment | delete |
| GET | `/items/:itemId/eligible-students` | Students eligible to enroll | view |

#### Dashboard Widgets

| Method | Route | Action | Permission |
|---|---|---|---|
| GET | `/widgets` | Manage list (all widgets) | view |
| GET | `/widgets/me` | Widgets visible to current user | view |
| POST | `/widgets` | Create widget | create |
| PUT | `/widgets/:widgetId` | Update widget | edit |
| PATCH | `/widgets/:widgetId/active` | Toggle active | edit |
| DELETE | `/widgets/:widgetId` | Delete widget | delete |

#### Lookups

| Method | Route | Purpose |
|---|---|---|
| GET | `/lookups/departments` | Department dropdown (`?all=true`) |
| GET | `/lookups/sections` | Section dropdown (`?all=true`) |
| GET | `/lookups/roles` | Role dropdown |
| GET | `/lookups/users` | User list (`?departmentId=&roleCode=`) |
| GET | `/lookups/navigation` | Sidebar navigation items (60s cache) |
| GET | `/lookups/my-items` | Items the current user can access |

#### Me / Health

| Method | Route | Purpose |
|---|---|---|
| GET | `/me` | Current user profile |
| GET | `/health` | Liveness check |

---

## Automated Tests

```sh
node ace test --suites=functional
```

12 functional tests covering: list, CRUD, department assignment, item creation guard, rubric versioning, level validation, permission replace, idempotent enrollment, soft-delete, and 403 access control.

---

## Mobile / LAN Testing

To test from a phone or another device on the same Wi-Fi:

1. Find the host machine's LAN IP:
   ```sh
   ipconfig
   ```
   Note the IPv4 address under your Wi-Fi adapter, e.g. `192.168.1.10`.

2. Update backend `.env`:
   ```
   HOST=0.0.0.0
   CORS_ORIGINS=http://192.168.1.10:5173,http://localhost:5173
   ```

3. Update frontend `.env` (`C:\Users\Public\gurukul\.env`):
   ```
   VITE_API_URL=http://192.168.1.10:3333
   ```

4. Open Windows Firewall for both ports:
   ```sh
   netsh advfirewall firewall add rule name="Gurukul Backend" dir=in action=allow protocol=TCP localport=3333
   netsh advfirewall firewall add rule name="Gurukul Frontend" dir=in action=allow protocol=TCP localport=5173
   ```

5. Start both servers:
   ```sh
   # backend
   node ace serve --watch

   # frontend
   npm run dev -- --host 0.0.0.0
   ```

6. Open `http://192.168.1.10:5173` on your phone.

---

## Project Structure

```
app/
  controllers/        thin HTTP handlers (one method per route)
  services/           business logic
  validators/         VineJS schemas with custom rules
  models/             Lucid ORM models
  middleware/         auth, permission, slow-query logger
config/               framework configs (cors, auth, database, bodyparser)
database/
  migrations/         schema changes (run in order, never edit after deploy)
  seeders/            idempotent seed data
start/
  routes.ts           all route definitions
  env.ts              env schema
tests/
  functional/         Japa functional tests
```
