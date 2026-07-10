import pg from 'pg';

export function createPgPoolFromEnv(env = process.env) {
  const cloudSqlInstance = env.CLOUD_SQL_INSTANCE_CONNECTION_NAME;
  const cloudSqlSocketHost = cloudSqlInstance ? `/cloudsql/${cloudSqlInstance}` : null;

  return new pg.Pool({
    host: cloudSqlSocketHost || env.DB_HOST,
    ...(cloudSqlSocketHost ? {} : { port: Number(env.DB_PORT || 5432) }),
    database: env.DB_DATABASE,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    connectionTimeoutMillis: 8000,
  });
}
