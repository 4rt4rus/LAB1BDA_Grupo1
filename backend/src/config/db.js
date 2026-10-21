import pg from 'pg';
import 'dotenv/config';

export const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'lab1bd_veterinaria',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});
