import 'dotenv/config';
import pg from 'pg';

const requiredEnv = ['DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('Create a local .env file from .env.example, then fill in your Cloud SQL database password.');
  process.exit(1);
}

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 8000,
});

try {
  const result = await pool.query('select current_database() as database, current_user as user_name, now() as connected_at');
  const row = result.rows[0];

  console.log('PostgreSQL connection successful.');
  console.log(`Database: ${row.database}`);
  console.log(`User: ${row.user_name}`);
  console.log(`Connected at: ${row.connected_at}`);
} catch (error) {
  console.error('PostgreSQL connection failed.');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
