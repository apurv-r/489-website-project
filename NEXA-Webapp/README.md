# NEXA WebApp (CPTS 489)

This is the full NEXA application (frontend + backend) in a monorepo.

## Quick Start

```powershell
cd "<repo-root>"
npm --prefix "NEXA-Webapp" install
npm --prefix "NEXA-Webapp/backend" install
npm --prefix "NEXA-Webapp/frontend" install
npm run dev
```

If using local DB, verify that it is running on port 27017. Otherwise, simply use our MongoDB Atlas database by setting `USE_LOCAL_MONGODB=false` in the `.env` file.

The repo already includes a root `.env` file. If needed, edit it before starting the app.

## 1) Prerequisites

Install these first:

- Node.js 18+ (LTS recommended)
- npm 9+
- MongoDB tools (for restore): `mongorestore` / `mongosh`
- (Optional) local MongoDB server if you want to run in local DB mode

Windows install examples:

```powershell
winget install MongoDB.DatabaseTools
winget install MongoDB.Server
```

## 2) Install Dependencies

From the repo root (`489-website-project`), install dependencies for all packages:

```powershell
cd "<repo-root>"
npm --prefix "NEXA-Webapp" install
npm --prefix "NEXA-Webapp/backend" install
npm --prefix "NEXA-Webapp/frontend" install
```

## 3) Configure Environment Variables

The repository includes a `.env` file at the **repo root** (same level as `NEXA-Webapp`).

If you need to change values for your machine, edit that file directly. If it is missing for any
reason, create a new one at the repo root.

Path example:

```text
489-website-project/.env
```

Use this template:

```env
PORT=5000

# Database mode
USE_LOCAL_MONGODB=true
LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/nexa
MONGODB_URI=mongodb+srv://admin:admin@primary.bp1pjw1.mongodb.net/?appName=primary

# Frontend origin(s) allowed by backend CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Optional frontend env (only if you want explicit API URL override):

Create `NEXA-Webapp/frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

## 4) Restore the Database

Choose one option.

### Option A (recommended for local restore): restore into local MongoDB

1. Start MongoDB (if not already running).
2. Ensure in `.env`:
   - `USE_LOCAL_MONGODB=true`
   - `LOCAL_MONGODB_URI=mongodb://127.0.0.1:27017/nexa`
3. Restore your dump:

```powershell
mongorestore --uri="mongodb://127.0.0.1:27017/nexa" "<path-to-your-dump-folder>"
```

If the dump has a DB name different from `nexa`, map it during restore:

```powershell
mongorestore --uri="mongodb://127.0.0.1:27017" --nsFrom="<oldDb>.*" --nsTo="nexa.*" "<path-to-your-dump-folder>"
```

Verify restore:

```powershell
mongosh "mongodb://127.0.0.1:27017/nexa"
```

Then run:

```javascript
db.users.countDocuments();
db.parkingspaces.countDocuments();
db.bookings.countDocuments();
```

### Option B: use the hosted MongoDB database

Set `USE_LOCAL_MONGODB=false` and provide `MONGODB_URI` in `.env`.

## 5) Start the Application

### Run frontend + backend together

```powershell
Set-Location "<repo-root>/NEXA-Webapp"
npm run dev
```

This starts:

- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`

### Or run separately (two terminals)

Terminal 1 (backend):

```powershell
cd "<repo-root>/NEXA-Webapp/backend"
npm run dev
```

Terminal 2 (frontend):

```powershell
cd "<repo-root>/NEXA-Webapp/frontend"
npm start
```

## 6) Default Admin Account

On backend startup, a default admin is ensured automatically:

- Email: `admin@nexa.com`
- Password: `dev123`

Use this to access admin pages if your restored DB does not already contain admins.

## 7) Quick Verification Checklist (Reviewer)

1. Backend health:
   - `GET http://localhost:5000/api/health` returns `{ status: "ok" ... }`
2. Frontend opens:
   - `http://localhost:3000`
3. Login works (regular user and/or default admin).
4. Core pages load data (search/listings/bookings/admin pages).

## 9) Troubleshooting

### Backend fails to connect to DB

- Check `.env` path (must be repo root).
- Verify `USE_LOCAL_MONGODB` value and corresponding URI.
- Verify MongoDB server is running if using local mode.

### CORS errors in browser

- Add frontend origin to `CORS_ALLOWED_ORIGINS`.
- Example: `CORS_ALLOWED_ORIGINS=http://localhost:3000`

### Frontend can’t reach backend

- Confirm backend is on `http://localhost:5000`.
- Set `REACT_APP_API_URL` in `frontend/.env` if needed.

### Empty data after startup

- Run the DB restore step again and verify counts in `mongosh`.
