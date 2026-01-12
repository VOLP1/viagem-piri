require('dotenv').config();

process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection:', reason);
  process.exit(1);
});

process.on('exit', (code) => {
  if (code !== 0) console.error('Process exiting with code:', code);
});

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { pool } = require('./db');

const PORT = Number(process.env.PORT || 3000);

async function ensureSchema() {
  const setupSqlPath = path.join(__dirname, 'setup.sql');
  const setupSql = fs.readFileSync(setupSqlPath, 'utf8');
  await pool.query(setupSql);
}

function isValidVoteType(voteType) {
  return voteType === 'like' || voteType === 'pass';
}

async function main() {
  await ensureSchema();

  pool.on('error', (err) => {
    console.error('Postgres pool error:', err);
  });

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', async (_req, res) => {
    try {
      const result = await pool.query('SELECT 1 AS ok');
      res.json({ ok: true, db: result.rows?.[0]?.ok === 1 });
    } catch (err) {
      res.status(500).json({ ok: false, error: 'DB not reachable' });
    }
  });

  app.post('/vote', async (req, res) => {
    try {
      const { user_name, waterfall_id, vote_type } = req.body || {};

      if (!user_name || typeof user_name !== 'string') {
        return res.status(400).json({ error: 'user_name is required' });
      }
      const trimmedName = user_name.trim();
      if (!trimmedName) {
        return res.status(400).json({ error: 'user_name cannot be empty' });
      }

      const parsedWaterfallId = Number(waterfall_id);
      if (!Number.isInteger(parsedWaterfallId) || parsedWaterfallId <= 0) {
        return res.status(400).json({ error: 'waterfall_id must be a positive integer' });
      }

      if (!isValidVoteType(vote_type)) {
        return res.status(400).json({ error: "vote_type must be 'like' or 'pass'" });
      }

      const insert = await pool.query(
        'INSERT INTO votes (user_name, waterfall_id, vote_type) VALUES ($1, $2, $3) RETURNING id, created_at',
        [trimmedName, parsedWaterfallId, vote_type]
      );

      res.status(201).json({
        id: insert.rows[0].id,
        created_at: insert.rows[0].created_at
      });
    } catch (err) {
      console.error('POST /vote failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/ranking', async (_req, res) => {
    try {
      const result = await pool.query(
        `SELECT
           waterfall_id,
           COUNT(*) FILTER (WHERE vote_type = 'like')::int AS likes,
           COUNT(*) FILTER (WHERE vote_type = 'pass')::int AS passes
         FROM votes
         GROUP BY waterfall_id
         ORDER BY likes DESC, passes ASC, waterfall_id ASC`
      );

      res.json(result.rows);
    } catch (err) {
      console.error('GET /ranking failed:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const server = app.listen(PORT, () => {
    console.log(`PiriMatch API listening on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('HTTP server error:', err);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
