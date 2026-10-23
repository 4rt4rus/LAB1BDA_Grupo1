import { pool } from '../config/db.js';

export async function listMascotas(tutorUsuarioId) {
  const { rows } = await pool.query(
    `SELECT m.id, m.nombre, e.nombre AS especie, u.nombre AS tutor
     FROM mascotas m JOIN especies e ON e.id = m.especie_id
     JOIN tutores t ON t.id = m.tutor_id JOIN usuarios u ON u.id = t.usuario_id
     WHERE ($1::bigint IS NULL OR t.usuario_id = $1)
     ORDER BY m.id`,
    [tutorUsuarioId]
  );
  return rows;
}

export async function findMascotaById(id, tutorUsuarioId) {
  const { rows } = await pool.query(
    `SELECT m.id, m.nombre, m.fecha_nacimiento::text AS fecha_nacimiento, m.sexo, e.nombre AS especie
     FROM mascotas m
     JOIN tutores t ON t.id = m.tutor_id
     JOIN especies e ON e.id = m.especie_id
     WHERE m.id = $1 AND ($2::bigint IS NULL OR t.usuario_id = $2)`,
    [id, tutorUsuarioId]
  );
  return rows[0] ?? null;
}

export async function insertMascota(fields, tutorUsuarioId, tutorId) {
  const { rows } = await pool.query(
    `WITH creada AS (
       INSERT INTO mascotas (tutor_id, especie_id, nombre, fecha_nacimiento, sexo)
       SELECT t.id, e.id, $4::text, $5::date, $6::text
       FROM tutores t JOIN especies e ON e.id = $3
       WHERE ($1::bigint IS NOT NULL AND t.usuario_id = $1)
          OR ($1::bigint IS NULL AND t.id = $2)
       RETURNING id, nombre, fecha_nacimiento, sexo, especie_id
     )
     SELECT c.id, c.nombre, c.fecha_nacimiento::text AS fecha_nacimiento, c.sexo, e.nombre AS especie
     FROM creada c JOIN especies e ON e.id = c.especie_id`,
    [tutorUsuarioId, tutorId, fields.especie_id, fields.nombre, fields.fecha_nacimiento ?? null, fields.sexo ?? null]
  );
  return rows[0] ?? null;
}

export async function updateMascota(id, fields, tutorUsuarioId) {
  const { rows } = await pool.query(
    `WITH actualizada AS (
       UPDATE mascotas m
       SET nombre = COALESCE($2::text, m.nombre),
           especie_id = COALESCE($3::bigint, m.especie_id),
           fecha_nacimiento = CASE WHEN $4::boolean THEN $5::date ELSE m.fecha_nacimiento END,
           sexo = CASE WHEN $6::boolean THEN $7::text ELSE m.sexo END
       FROM tutores t
       WHERE m.id = $1 AND t.id = m.tutor_id
         AND ($8::bigint IS NULL OR t.usuario_id = $8)
       RETURNING m.id, m.nombre, m.fecha_nacimiento, m.sexo, m.especie_id
     )
     SELECT a.id, a.nombre, a.fecha_nacimiento::text AS fecha_nacimiento, a.sexo, e.nombre AS especie
     FROM actualizada a JOIN especies e ON e.id = a.especie_id`,
    [id, fields.nombre ?? null, fields.especie_id ?? null,
      Object.hasOwn(fields, 'fecha_nacimiento'), fields.fecha_nacimiento ?? null,
      Object.hasOwn(fields, 'sexo'), fields.sexo ?? null, tutorUsuarioId]
  );
  return rows[0] ?? null;
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
