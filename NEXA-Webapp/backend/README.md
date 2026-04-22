# NEXA Backend

Express + MongoDB backend for the NEXA parking platform.

## Quick Start

From `NEXA-Webapp/backend`:

```bash
npm install
npm run dev
```

Production mode:

```bash
npm start
```

Health check:

```text
GET /api/health
```

## Test Suite

The backend test stack is:

- `jest`
- `supertest`
- `mongodb-memory-server`

Run tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Environment Variables

This server loads env from the workspace root `.env` file (via `server.js`):

- `PORT` (default: `3000`)
- `USE_LOCAL_MONGODB` (`true`/`false`)
- `LOCAL_MONGODB_URI` (default fallback: `mongodb://127.0.0.1:27017/nexa`)
- `MONGODB_URI` (Atlas/remote URI)
- `CORS_ALLOWED_ORIGINS` (comma-separated list, e.g. `http://localhost:3000,https://example.com`)
- `JWT_SECRET` (optional; defaults to a dev secret if omitted)

## Database Behavior

Connection mode is selected by `USE_LOCAL_MONGODB`:

- `true` → uses `LOCAL_MONGODB_URI`
- otherwise → uses `MONGODB_URI`

On startup, backend also ensures a default admin account exists:

- email: `admin@nexa.com`
- password: `dev123`

## Authentication Model

NEXA currently supports a hybrid auth model:

1. **Primary:** server-side session cookie (`nexa_session_id`)
2. **Fallback:** JWT bearer token for backward compatibility

### Login Flow

- `POST /api/auth/login` authenticates with `passport-local`
- Backend issues:
  - session cookie (primary path)
  - JWT token in response (compatibility path)

### Protected Routes

`requireAuth` allows access if either:

- `req.user` is already set from session middleware, or
- a valid bearer JWT is provided

### Role-Based Authorization

`requireRole(...roles)` enforces role checks for admin/host-specific actions.

## API Structure

Base path: `/api`

### Public routes (no auth required)

- `GET /api/parking-spaces`
- `GET /api/parking-spaces/:id` (public listing view)
- `GET /api/bookings/future/:parkingSpaceId`
- `GET /api/reviews/listing/:listingId`

### Auth-required route groups

- `/api/auth`
- `/api/users`
- `/api/uploads`
- `/api/parking-spaces`
- `/api/bookings`
- `/api/reports`
- `/api/reviews`
- `/api/platform-settings`

## Key Route Notes

- `POST /api/uploads/images` → Host/Admin only
- `GET /api/bookings` → Admin only
- `PUT /api/users/hosts/:id/verify` → Admin only
- `PATCH /api/platform-settings` → Admin only
- `DELETE /api/users/:id` → Admin only

## CORS

CORS is enforced using `CORS_ALLOWED_ORIGINS` and supports credentials.

Allowed:

- methods: `GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS`
- headers: `Content-Type, Authorization`

## Uploads

- Uploaded files are stored under `backend/uploads`
- Static serving path: `/uploads/...`

## Project Scripts

- `npm run dev` → start with nodemon
- `npm start` → start with node
- `npm test` → run tests once
- `npm run test:watch` → run tests in watch mode

## Troubleshooting

### MongoDB connection issues

- Verify `.env` values (`USE_LOCAL_MONGODB`, `LOCAL_MONGODB_URI`, `MONGODB_URI`)
- If local mode is enabled, ensure local MongoDB is running

### CORS blocked for origin

- Add your frontend origin to `CORS_ALLOWED_ORIGINS`
- Separate multiple origins with commas

### Auth appears inconsistent

- Make sure frontend sends `withCredentials: true` for session-based requests
- For legacy clients, ensure `Authorization: Bearer <token>` is included
