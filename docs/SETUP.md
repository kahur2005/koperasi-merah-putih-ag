# Project Setup Guide

This guide is for teammates who clone the project and need to set up `.env`, PostgreSQL/Cloud SQL, Firebase Google Login, and the local dev servers.

Do not commit your real `.env` file. It contains private database passwords and local credentials. Use `.env.example` as the template, then ask the project owner for the real private values.

## 1. Clone And Install

```powershell
git clone <repo-url>
cd koperasi-merah-putih-ag
npm install
```

If you already cloned the repo, pull the newest code first:

```powershell
git pull
npm install
```

## 2. Create `.env`

Copy the example file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and replace the placeholder values. Keep `.env.example` generic; put real secrets only in `.env`.

## 3. Database Setup

The app backend connects to PostgreSQL. For our current hackathon setup, we usually connect through Cloud SQL Auth Proxy, so local `.env` should use:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=<database_name>
DB_USERNAME=<database_user>
DB_PASSWORD=<database_password>
```

What each variable means:

- `DB_HOST`: where the PostgreSQL server is reachable. Use `127.0.0.1` when using Cloud SQL Auth Proxy.
- `DB_PORT`: PostgreSQL port. Usually `5432`.
- `DB_DATABASE`: database name.
- `DB_USERNAME`: PostgreSQL username.
- `DB_PASSWORD`: PostgreSQL password.

Start Cloud SQL Auth Proxy before starting the API:

```powershell
C:\Cloud-Google\cloud-sql-proxy.x64.exe <PROJECT_ID>:<REGION>:<INSTANCE_NAME> --port 5432
```

Example shape:

```powershell
C:\Cloud-Google\cloud-sql-proxy.x64.exe kemenkop-hackathon-2026-64f2:asia-southeast2:koperasi-game --port 5432
```

If this proxy terminal is closed, the backend cannot reach the database.

## 4. Backend And Frontend Env

These values connect the React frontend to the Express API:

```env
API_PORT=3001
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=<long_random_secret_for_local_dev>
VITE_API_URL=http://localhost:3001
```

What each variable means:

- `API_PORT`: backend API port.
- `CLIENT_ORIGIN`: frontend URL allowed by CORS.
- `JWT_SECRET`: private secret used by the backend to sign login tokens.
- `VITE_API_URL`: API URL used by the frontend. If this is wrong, login/register usually shows `Failed fetch`.

Generate any long random text for local `JWT_SECRET`. Do not reuse production secrets in chat or commits.

## 5. Firebase Google Login

Firebase values come from Firebase Console:

1. Open Firebase Console.
2. Choose the project.
3. Go to Project settings.
4. Find the Web app config.
5. Copy the config values into `.env`.

Map Firebase config to `.env` like this:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "..."
};
```

```env
VITE_FIREBASE_API_KEY=<apiKey>
VITE_FIREBASE_AUTH_DOMAIN=<authDomain>
VITE_FIREBASE_PROJECT_ID=<projectId>
VITE_FIREBASE_APP_ID=<appId>
FIREBASE_PROJECT_ID=<projectId>
```

Enable Google login in Firebase:

1. Firebase Console -> Authentication.
2. Sign-in method.
3. Enable Google.
4. Add/select a support email.
5. Save.
6. In Authentication settings, make sure `localhost` is an authorized domain.

For backend Firebase token verification, run:

```powershell
gcloud auth application-default login
```

Login with an account that has access to the Firebase project.

Alternative for deployment or machines without ADC:

```env
FIREBASE_SERVICE_ACCOUNT_JSON=<service_account_json_as_one_line>
```

Do not commit service account JSON.

## 6. Run The App Locally

Use three terminals.

Terminal 1: Cloud SQL Auth Proxy

```powershell
C:\Cloud-Google\cloud-sql-proxy.x64.exe <PROJECT_ID>:<REGION>:<INSTANCE_NAME> --port 5432
```

Terminal 2: backend API

```powershell
npm run api:dev
```

Terminal 3: frontend

```powershell
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

Important: if you change `.env`, restart both `npm run api:dev` and `npm run dev`.

## 7. Verify Setup

Test database connection:

```powershell
npm run db:postgres:test
```

Apply database schema/migrations:

```powershell
npm run api:migrate
```

Build the frontend:

```powershell
npm run build
```

Then open the app and test:

- Username/password register.
- Username/password login.
- Login with Google.
- Continue / Start New Game.
- Autosave/manual save.

## 8. Common Errors

### `Failed fetch`

Usually the frontend cannot reach the backend API.

Check:

- Is `npm run api:dev` running?
- Is `VITE_API_URL=http://localhost:3001`?
- Did you restart `npm run dev` after editing `.env`?

### Google login says request failed

Check:

- Firebase Google provider is enabled.
- `localhost` is an authorized Firebase Auth domain.
- `.env` has all `VITE_FIREBASE_*` values.
- `npm run api:dev` was restarted after `.env` changed.
- `gcloud auth application-default login` was run with an account that can access the Firebase project.

### Database connection failed

Check:

- Cloud SQL Auth Proxy is running.
- `.env` has the right `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`.
- `DB_HOST=127.0.0.1`.
- `DB_PORT=5432`.

### `.env` changes do not work

Restart both dev servers:

```powershell
# Stop old terminals with Ctrl+C, then run again:
npm run api:dev
npm run dev
```

Vite and the backend read environment variables only when they start.

## 9. Safety Notes

- Never commit `.env`.
- Never paste real database passwords into public chat or documentation.
- Never commit Firebase service account JSON.
- Firebase web API keys are okay in frontend config, but keep service account/private keys secret.
- Ask the project owner for private values when cloning the project.
