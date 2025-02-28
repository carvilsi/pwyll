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

export const dbConfig = {
  user,
  password,
  host,
  port,
  database,
  max: MAX_CONNECTIONS,
  idleTimeoutMillis: IDLE_TIMEOUT,
};

export const pool = new Pool(dbConfig);

export const query = (text: string, params: any[]) => {
  return pool.query(text, params);
};

export const close = () => {
  return pool.end();
};
