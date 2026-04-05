# NEXA Backend

## Run the API

```bash
npm install
npm run dev
```

## Run API tests

This backend uses `jest` + `supertest` + `mongodb-memory-server` for isolated API testing.

```bash
npm test
```

## Running the app with a local MongoDB

Ensure you have MongoDB installed locally and running.

```bash
winget install MongoDB.Server
winget install MongoDB.Shell
```

Verify the server is running

```bash
mongosh "mongodb://127.0.0.1:27017"
```

The rest will work automatically.

## Authentication

This backend uses `passport` with:

- `passport-local` for email/password login
- `passport-jwt` for protecting API routes with bearer tokens

Public auth endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

After login, send the token with every protected request:

```bash
Authorization: Bearer <token>
```

Example frontend fetch:

```javascript
fetch("/api/bookings", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

Set `JWT_SECRET` in `.env` for production use.
