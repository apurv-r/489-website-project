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
