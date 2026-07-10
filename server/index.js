import 'dotenv/config';
import express from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAuthSaveApp } from './app.js';
import { createPgPoolFromEnv } from './db.js';
import { createFirebaseAuthFromEnv } from './firebaseAdmin.js';
import { createPostgresAuthSaveRepository } from './repositories/postgresAuthSaveRepository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('Missing JWT_SECRET. Add it to your local .env file.');
  process.exit(1);
}

const pool = createPgPoolFromEnv();
const repository = createPostgresAuthSaveRepository(pool);
const firebaseAuth = createFirebaseAuthFromEnv();
const app = createAuthSaveApp({
  repository,
  jwtSecret,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  firebaseAuth,
});

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      next();
      return;
    }

    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(port, () => {
  console.log(`Koperasi app listening on port ${port}`);
});

const shutdown = async () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
