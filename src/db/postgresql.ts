import pg from 'pg';
import config from 'config';

const { Pool } = pg;

const user = String(config.get('postgresql.user'));
const password = String(config.get('postgresql.password'));
const host = String(config.get('postgresql.ip'));
const port = Number(config.get('postgresql.port'));
const database = String(config.get('postgresql.db'));

const MAX_CONNECTIONS = 2;
const IDLE_TIMEOUT = 0;

const pool = new Pool({
  user,
  password,
  host,
  port,
  database,
  max: MAX_CONNECTIONS,
  idleTimeoutMillis: IDLE_TIMEOUT,
});

export default async function client(): Promise<pg.PoolClient> {
  const client = await pool.connect();
  return client;
}

export async function close(): Promise<void> {
  await pool.end();
}