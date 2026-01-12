const { Pool } = require('pg');

function shouldUseSsl() {
  const mode = String(process.env.PGSSLMODE || '').toLowerCase();
  if (mode === 'require') return true;
  const pgssl = String(process.env.PGSSL || '').toLowerCase();
  return pgssl === 'true' || pgssl === '1' || pgssl === 'yes';
}

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: shouldUseSsl() ? { rejectUnauthorized: false } : undefined,
        max: Number(process.env.PGPOOL_MAX || 10),
        idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000)
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'password',
        database: process.env.PGDATABASE || 'pirimatch',
        ssl: shouldUseSsl() ? { rejectUnauthorized: false } : undefined,
        max: Number(process.env.PGPOOL_MAX || 10),
        idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000)
      }
);

module.exports = { pool };
