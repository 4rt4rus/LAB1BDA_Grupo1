import { pool } from '../config/db.js';

export async function findUserByEmail(correo) {
  const { rows } = await pool.query(
    `SELECT u.id, u.correo, u.nombre, u.password_hash, u.activo, r.nombre AS rol
     FROM usuarios u JOIN roles r ON r.id = u.rol_id
     WHERE lower(u.correo) = lower($1)`,
    [correo],
  );
  return rows[0] ?? null;
}
