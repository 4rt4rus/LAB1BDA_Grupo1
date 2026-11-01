import { pool } from '../config/db.js';

export async function findUserByEmail(correo) {
  const { rows } = await pool.query(
    `SELECT 
        u."id_usuario" AS id,
        u."email" AS correo,
        COALESCE(a."nombre_administrador", v."nombre_veterinario", t."nombre_tutor") AS nombre,
        u."password_hash",
        u."activo",
        r."nombre_rol" AS rol,
        t."id_tutor",
        v."id_veterinario",
        v."id_sede"
     FROM "USUARIO" u
     JOIN "ROL" r ON r."id_rol" = u."id_rol"
     LEFT JOIN "ADMINISTRADOR" a ON a."id_usuario" = u."id_usuario"
     LEFT JOIN "VETERINARIO" v ON v."id_usuario" = u."id_usuario"
     LEFT JOIN "TUTOR" t ON t."id_usuario" = u."id_usuario"
     WHERE lower(u."email") = lower($1)`,
    [correo],
  );
  return rows[0] ?? null;
}