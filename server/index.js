import 'dotenv/config';
import { createAuthSaveApp } from './app.js';
import { createPgPoolFromEnv } from './db.js';
import { createPostgresAuthSaveRepository } from './repositories/postgresAuthSaveRepository.js';

const port = Number(process.env.API_PORT || 3001);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('Missing JWT_SECRET. Add it to your local .env file.');
  process.exit(1);
}

const pool = createPgPoolFromEnv();
const repository = createPostgresAuthSaveRepository(pool);
const app = createAuthSaveApp({
  repository,
  jwtSecret,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
});

const server = app.listen(port, () => {
  console.log(`Koperasi auth/save API listening on http://localhost:${port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
