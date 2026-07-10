# Cloud Run Deployment Guide

This guide moves the project from local Cloud SQL Auth Proxy development to a deployed Google Cloud Run service.

In local development, your laptop runs:

```text
React dev server -> local Express API -> local Cloud SQL Auth Proxy -> Cloud SQL
```

In deployment, Cloud Run runs:

```text
Cloud Run service -> built React app + Express API -> Cloud Run Cloud SQL connection -> Cloud SQL
```

Cloud Run attaches Cloud SQL for you, so users do not run Cloud SQL Auth Proxy on their laptops to use the deployed app.

## 1. Required Google Cloud Values

Use the real values for your project:

```powershell
$PROJECT_ID="kemenkop-hackathon-2026-64f2"
$REGION="asia-southeast2"
$SERVICE_NAME="koperasi-game"
$CLOUD_SQL_INSTANCE="kemenkop-hackathon-2026-64f2:asia-southeast2:koperasi-game"
```

The instance connection name format is:

```text
PROJECT_ID:REGION:INSTANCE_NAME
```

## 2. Enable Required APIs

```powershell
gcloud config set project $PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com
```

## 3. Make Sure Cloud Run Can Access Cloud SQL

Cloud Run needs a service account with Cloud SQL Client permission.

For the default Compute service account, get the project number:

```powershell
$PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
$SERVICE_ACCOUNT="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
```

Grant Cloud SQL Client:

```powershell
gcloud projects add-iam-policy-binding $PROJECT_ID `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/cloudsql.client"
```

If you use a custom Cloud Run service account, grant `roles/cloudsql.client` to that account instead.

## 4. Set Deployment Environment Variables

Cloud Run will use `CLOUD_SQL_INSTANCE_CONNECTION_NAME` instead of local `DB_HOST`.

Required runtime env vars:

```text
NODE_ENV=production
CLOUD_SQL_INSTANCE_CONNECTION_NAME=<PROJECT_ID:REGION:INSTANCE_NAME>
DB_DATABASE=<database_name>
DB_USERNAME=<database_user>
DB_PASSWORD=<database_password>
JWT_SECRET=<long_random_secret>
FIREBASE_PROJECT_ID=<firebase_project_id>
VITE_FIREBASE_API_KEY=<firebase_web_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<firebase_project.firebaseapp.com>
VITE_FIREBASE_PROJECT_ID=<firebase_project_id>
VITE_FIREBASE_APP_ID=<firebase_web_app_id>
```

Do not set `VITE_API_URL` in Cloud Run if the React app and API are served from the same Cloud Run service. The frontend will call same-origin `/api/...`.

## 5. Deploy From Source

Run this from the repo root:

```powershell
gcloud run deploy $SERVICE_NAME `
  --source . `
  --region $REGION `
  --allow-unauthenticated `
  --add-cloudsql-instances $CLOUD_SQL_INSTANCE `
  --set-env-vars "NODE_ENV=production,CLOUD_SQL_INSTANCE_CONNECTION_NAME=$CLOUD_SQL_INSTANCE,DB_DATABASE=<database_name>,DB_USERNAME=<database_user>,DB_PASSWORD=<database_password>,JWT_SECRET=<long_random_secret>,FIREBASE_PROJECT_ID=<firebase_project_id>,VITE_FIREBASE_API_KEY=<firebase_web_api_key>,VITE_FIREBASE_AUTH_DOMAIN=<firebase_project.firebaseapp.com>,VITE_FIREBASE_PROJECT_ID=<firebase_project_id>,VITE_FIREBASE_APP_ID=<firebase_web_app_id>"
```

Notes:

- `--source .` uses Cloud Build to build the Dockerfile.
- `--add-cloudsql-instances` is the deployed replacement for the local proxy.
- `--set-env-vars` replaces the service env var set with the listed values. Include every env var the service needs.

## 6. Run Database Migration For Cloud SQL

The schema already targets the same Cloud SQL database. You can run migration locally while the proxy is running:

```powershell
npm run api:migrate
```

If the migration already ran successfully against the same Cloud SQL instance, you do not need to run it again for deployment.

## 7. Firebase Authorized Domain

After Cloud Run deploys, copy the service URL, for example:

```text
https://koperasi-game-xxxxx-et.a.run.app
```

Then add its domain to Firebase:

1. Firebase Console.
2. Authentication.
3. Settings.
4. Authorized domains.
5. Add the Cloud Run domain without `https://`.

Keep `localhost` too for local development.

## 8. Verify Deployment

Open the Cloud Run URL and test:

- Register/login with username and password.
- Login with Google.
- Continue / Start New Game.
- Autosave and Manual Save.
- Restock and end-day flow.

Check Cloud Run logs if login or saves fail:

```powershell
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 100
```

## 9. Common Deployment Errors

### Cloud SQL connection fails

Check:

- `--add-cloudsql-instances` uses the exact instance connection name.
- `CLOUD_SQL_INSTANCE_CONNECTION_NAME` matches the same value.
- Cloud Run service account has `roles/cloudsql.client`.
- `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` are correct.

### Google login works locally but not deployed

Check:

- Cloud Run domain is added to Firebase Authorized domains.
- `FIREBASE_PROJECT_ID` is set.
- `VITE_FIREBASE_*` values are set during build/deploy.
- Redeploy after changing Firebase env vars.

### Frontend says `Failed fetch`

For Cloud Run single-service deployment:

- Do not set `VITE_API_URL` unless API is on a different domain.
- The frontend should call `/api/...` on the same Cloud Run URL.

For local development:

- Keep `VITE_API_URL=http://localhost:3001`.
- Run `npm run api:dev`.

## 10. Local Development Still Works

Local dev still uses Cloud SQL Auth Proxy:

```powershell
C:\Cloud-Google\cloud-sql-proxy.x64.exe <PROJECT_ID>:<REGION>:<INSTANCE_NAME> --port 5432
npm run api:dev
npm run dev
```

Leave `CLOUD_SQL_INSTANCE_CONNECTION_NAME` blank locally so the backend uses `DB_HOST=127.0.0.1`.
