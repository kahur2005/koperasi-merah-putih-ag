# Koperasi Merah Putih Manager Simulator

A browser-based cooperative village store management game for the Kemenkop hackathon MVP. Players manage a `Koperasi Merah Putih`, arrange the 3D store, restock supplies, serve customers, approve members, handle monthly meetings, and save progress with login accounts.

## Features

- Login/register gate with username/password and Google login through Firebase Auth.
- Auto Save and Manual Save backed by PostgreSQL.
- 3D store setup and manager mode using React Three Fiber.
- Manual and automatic restock flow with supplier limits and money validation.
- Day cycle: setup, restock, open store, manager/simulation play, report, next day.
- Member applications, loan decisions, monthly contribution meeting, and happiness effects.
- Narrative cards, BGM, SFX, and audio volume settings.
- Cloud Run ready with Cloud SQL support.

## Gameplay

The game follows the work rhythm of a village cooperative manager. The player starts with an introduction narrative, enters the 3D store, places required furniture such as racks and cashier desks, then returns to the main dashboard to restock the store before opening for customers.

### Core Loop

1. Set up the store by placing furniture in the 3D Koperasi room.
2. Restock products from the Pasar/Pasokan screen.
3. Open the store and choose either Manager Mode or daily simulation.
4. Serve customers, sell products, and manage inventory.
5. End the day and review the daily sales report.
6. Move to the next day, restock again, and continue improving the cooperative.

Buying supplies is only available during the restock phase. Players can buy manually by choosing quantities, or use automatic restock to fill stock up to capacity when money and supplier stock allow it.

### Manager Mode

Manager Mode is a 3D serving session where customers ask for products such as rice, cooking oil, or LPG gas. The player must click the matching rack/product to serve the customer.

- Each session has a 60-second timer.
- Customer count scales with the number of cashier desks.
- Correct service sells one item and adds revenue.
- Wrong clicks do not sell the item.
- Empty stock makes customers leave disappointed.
- Served customers can become calon anggota koperasi.

Players can also choose simulation mode after the feature is unlocked, which resolves the day without manually serving each customer.

### Members, Loans, And Happiness

Customers may apply to become cooperative members. The player can inspect applicants, approve or decline them, and later handle member loan requests. Approved loans reduce cash upfront but can help members and return repayments over time.

Village happiness changes based on management choices, including:

- buying from PT or UMKM suppliers.
- setting fair or expensive selling prices.
- keeping key goods in stock.
- responding to special events such as crisis or failed harvest.
- choosing monthly member contribution levels.

Monthly meetings let the player choose low, normal, or high member contributions. Low contributions improve happiness but reduce loan capacity, while high contributions increase cooperative funds but can reduce happiness and cause members to leave.

### Goal

The player is trying to grow a healthy cooperative by balancing money, stock, member growth, loan support, and village happiness. The challenge is not only earning profit, but keeping the cooperative useful and trusted by the village.

## Tech Stack

- Frontend: React, Vite, Zustand, Three.js, React Three Fiber.
- Backend: Express, JWT, bcrypt.
- Auth: Firebase Auth for Google login plus local username/password auth.
- Database: PostgreSQL.
- Deployment: Dockerfile + Google Cloud Run + Cloud SQL.

## Quick Start

Install dependencies:

```powershell
npm install
```

Create your local environment file:

```powershell
Copy-Item .env.example .env
```

Ask the project owner for the private `.env` values. Do not commit `.env`.

Start the backend:

```powershell
npm run api:dev
```

Start the frontend in another terminal:

```powershell
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

For full teammate setup, including Cloud SQL Auth Proxy and Firebase config, read [docs/SETUP.md](docs/SETUP.md).

## Database Setup

The app uses PostgreSQL for accounts and save files. Run the migration after the database is reachable:

```powershell
npm run api:migrate
```

Test the database connection:

```powershell
npm run db:postgres:test
```

For local hackathon development, the database usually runs through Cloud SQL Auth Proxy with:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
```

Cloud Run deployment uses `CLOUD_SQL_INSTANCE_CONNECTION_NAME` instead of the local proxy.

## Useful Scripts

```powershell
npm run dev              # Start Vite frontend
npm run api:dev          # Start Express API
npm run build            # Build production frontend
npm run start            # Start production Express server
npm run api:migrate      # Apply PostgreSQL auth/save schema
npm run db:postgres:test # Test PostgreSQL connection
```

## Verification

Run the existing test suite:

```powershell
$tests = Get-ChildItem -Path src -Recurse -Filter *.test.js | ForEach-Object { $_.FullName }
node --test $tests server/authSaveApi.test.js
```

Build before deployment:

```powershell
npm run build
```

## Deployment

The project is prepared for Google Cloud Run. The deployed service serves both:

- the built React app.
- the Express `/api/...` backend.

Read [docs/CLOUD_RUN_DEPLOYMENT.md](docs/CLOUD_RUN_DEPLOYMENT.md) for the full deployment command, Cloud SQL setup, IAM notes, and Firebase authorized-domain setup.

## Environment Notes

- `.env` is private and must not be committed.
- `.env.example` is the safe template for teammates.
- Do not paste real database passwords, JWT secrets, or service account JSON into public docs or chat.
- Firebase web config values are public client config, but Firebase service account JSON is private.
- For local development, keep `VITE_API_URL=http://localhost:3001`.
- For single-service Cloud Run deployment, do not set `VITE_API_URL`; the frontend should call same-origin `/api`.

## Project Structure

```text
src/                 React game frontend
src/components/      Auth, dashboard, HUD, story, and 3D store UI
src/store/           Zustand game state and game logic
src/audio/           Browser audio manager
server/              Express auth/save API
database/postgres/   PostgreSQL migration and connection test helpers
public/assets/       Images, audio, textures, fonts, and static assets
docs/                Setup and deployment guides
```
