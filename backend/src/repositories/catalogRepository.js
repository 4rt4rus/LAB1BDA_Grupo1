import { pool } from '../config/db.js';

export async function listMascotas() {
  const { rows } = await pool.query(
    `SELECT m.id, m.nombre, e.nombre AS especie, u.nombre AS tutor
     FROM mascotas m JOIN especies e ON e.id = m.especie_id
     JOIN tutores t ON t.id = m.tutor_id JOIN usuarios u ON u.id = t.usuario_id
     ORDER BY m.id`
  );
  return rows;
}

export async function listVeterinarios() {
  const { rows } = await pool.query(
    `SELECT v.id, u.nombre, v.registro_profesional, v.especialidad
     FROM veterinarios v JOIN usuarios u ON u.id = v.usuario_id ORDER BY v.id`
  );
  return rows;
}

export async function listSedes() {
  const { rows } = await pool.query(
    'SELECT id, nombre, direccion, telefono FROM sedes WHERE activa = true ORDER BY id'
  );
  return rows;
}
