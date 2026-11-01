import { pool } from '../config/db.js';

// 1. CATÁLOGOS BASE (ESPECIES, SEDES, MEDICAMENTOS, PLANES VACUNACIÓN)

export async function listEspecies() {
  const { rows } = await pool.query('SELECT "id_especie" AS id, "nombre_especie" AS nombre FROM "ESPECIE" ORDER BY "id_especie"');
  return rows;
}

export async function createEspecie(nombre) {
  const { rows } = await pool.query(
    'INSERT INTO "ESPECIE" ("nombre_especie") VALUES ($1) RETURNING "id_especie" AS id, "nombre_especie" AS nombre',
    [nombre]
  );
  return rows[0];
}

export async function deleteEspecie(id) {
  const { rowCount } = await pool.query('DELETE FROM "ESPECIE" WHERE "id_especie" = $1', [id]);
  return rowCount > 0;
}

export async function listSedes() {
  const { rows } = await pool.query('SELECT "id_sede" AS id, "nombre" FROM "SEDE" ORDER BY "id_sede"');
  return rows;
}

export async function createSede(nombre) {
  const { rows } = await pool.query(
    'INSERT INTO "SEDE" ("nombre") VALUES ($1) RETURNING "id_sede" AS id, "nombre"',
    [nombre]
  );
  return rows[0];
}

export async function updateSede(id, nombre) {
  const { rows } = await pool.query(
    'UPDATE "SEDE" SET "nombre" = $2 WHERE "id_sede" = $1 RETURNING "id_sede" AS id, "nombre"',
    [id, nombre]
  );
  return rows[0] ?? null;
}

export async function deleteSede(id) {
  const { rowCount } = await pool.query('DELETE FROM "SEDE" WHERE "id_sede" = $1', [id]);
  return rowCount > 0;
}

export async function listVeterinarios() {
  const { rows } = await pool.query(
    `SELECT v."id_veterinario" AS id, v."nombre_veterinario" AS nombre, v."id_sede", s."nombre" AS sede, u."email"
     FROM "VETERINARIO" v
     JOIN "SEDE" s ON s."id_sede" = v."id_sede"
     JOIN "USUARIO" u ON u."id_usuario" = v."id_usuario"
     ORDER BY v."id_veterinario"`
  );
  return rows;
}

export async function listTutores() {
  const { rows } = await pool.query(
    `SELECT t."id_tutor" AS id, t."nombre_tutor" AS nombre, u."email"
     FROM "TUTOR" t
     JOIN "USUARIO" u ON u."id_usuario" = t."id_usuario"
     ORDER BY t."id_tutor"`
  );
  return rows;
}

export async function listMedicamentos() {
  const { rows } = await pool.query(
    'SELECT "id_medicamento" AS id, "nombre_comercial", "principio_activo" FROM "MEDICAMENTO" ORDER BY "id_medicamento"'
  );
  return rows;
}

export async function createMedicamento(nombre_comercial, principio_activo) {
  const { rows } = await pool.query(
    `INSERT INTO "MEDICAMENTO" ("nombre_comercial", "principio_activo")
     VALUES ($1, $2) RETURNING "id_medicamento" AS id, "nombre_comercial", "principio_activo"`,
    [nombre_comercial, principio_activo]
  );
  return rows[0];
}

export async function deleteMedicamento(id) {
  const { rowCount } = await pool.query('DELETE FROM "MEDICAMENTO" WHERE "id_medicamento" = $1', [id]);
  return rowCount > 0;
}

export async function listPlanesVacunacion() {
  const { rows } = await pool.query(
    `SELECT p."id_vacuna" AS id, p."id_especie", e."nombre_especie" AS especie,
            p."nombre_vacuna", p."cantidad_refuerzo", p."dias_refuerzo"
     FROM "PLAN_VACUNACION" p
     JOIN "ESPECIE" e ON e."id_especie" = p."id_especie"
     ORDER BY p."id_vacuna"`
  );
  return rows;
}

export async function createPlanVacunacion({ id_especie, nombre_vacuna, cantidad_refuerzo, dias_refuerzo }) {
  const { rows } = await pool.query(
    `INSERT INTO "PLAN_VACUNACION" ("id_especie", "nombre_vacuna", "cantidad_refuerzo", "dias_refuerzo")
     VALUES ($1, $2, $3, $4)
     RETURNING "id_vacuna" AS id, "id_especie", "nombre_vacuna", "cantidad_refuerzo", "dias_refuerzo"`,
    [id_especie, nombre_vacuna, cantidad_refuerzo, dias_refuerzo]
  );
  return rows[0];
}

// 2. INVENTARIO POR SEDE

export async function listInventario(idSede = null) {
  const { rows } = await pool.query(
    `SELECT i."id_inventario" AS id, i."id_sede", s."nombre" AS sede,
            i."id_medicamento", m."nombre_comercial", m."principio_activo", i."stock_actual"
     FROM "INVENTARIO" i
     JOIN "SEDE" s ON s."id_sede" = i."id_sede"
     JOIN "MEDICAMENTO" m ON m."id_medicamento" = i."id_medicamento"
     WHERE ($1::int IS NULL OR i."id_sede" = $1)
     ORDER BY i."id_sede", m."nombre_comercial"`,
    [idSede]
  );
  return rows;
}

export async function upsertInventario({ id_sede, id_medicamento, stock_actual }) {
  const { rows } = await pool.query(
    `INSERT INTO "INVENTARIO" ("id_sede", "id_medicamento", "stock_actual")
     VALUES ($1, $2, $3)
     ON CONFLICT ("id_sede", "id_medicamento")
     DO UPDATE SET "stock_actual" = EXCLUDED."stock_actual"
     RETURNING "id_inventario" AS id, "id_sede", "id_medicamento", "stock_actual"`,
    [id_sede, id_medicamento, stock_actual]
  );
  return rows[0];
}

// 3. MASCOTAS Y ALERGIAS (Filtradas por Tutor cuando aplica)

export async function listMascotas(tutorUsuarioId) {
  const { rows } = await pool.query(
    `SELECT m."id_mascota" AS id, m."nombre_mascota" AS nombre,
            m."id_especie", e."nombre_especie" AS especie,
            m."id_tutor", t."nombre_tutor" AS tutor
     FROM "MASCOTA" m
     JOIN "ESPECIE" e ON e."id_especie" = m."id_especie"
     JOIN "TUTOR" t ON t."id_tutor" = m."id_tutor"
     WHERE ($1::int IS NULL OR t."id_usuario" = $1)
     ORDER BY m."id_mascota"`,
    [tutorUsuarioId]
  );
  return rows;
}

export async function findMascotaById(id, tutorUsuarioId) {
  const { rows } = await pool.query(
    `SELECT m."id_mascota" AS id, m."nombre_mascota" AS nombre,
            m."id_especie", e."nombre_especie" AS especie,
            m."id_tutor", t."nombre_tutor" AS tutor
     FROM "MASCOTA" m
     JOIN "TUTOR" t ON t."id_tutor" = m."id_tutor"
     JOIN "ESPECIE" e ON e."id_especie" = m."id_especie"
     WHERE m."id_mascota" = $1 AND ($2::int IS NULL OR t."id_usuario" = $2)`,
    [id, tutorUsuarioId]
  );
  return rows[0] ?? null;
}

export async function insertMascota(fields, tutorUsuarioId, tutorId) {
  const { rows } = await pool.query(
    `WITH creada AS (
       INSERT INTO "MASCOTA" ("id_tutor", "id_especie", "nombre_mascota")
       SELECT t."id_tutor", e."id_especie", $4::varchar
       FROM "TUTOR" t JOIN "ESPECIE" e ON e."id_especie" = $3
       WHERE ($1::int IS NOT NULL AND t."id_usuario" = $1)
          OR ($1::int IS NULL AND t."id_tutor" = $2)
       RETURNING "id_mascota", "nombre_mascota", "id_especie", "id_tutor"
     )
     SELECT c."id_mascota" AS id, c."nombre_mascota" AS nombre,
            c."id_especie", e."nombre_especie" AS especie, c."id_tutor"
     FROM creada c JOIN "ESPECIE" e ON e."id_especie" = c."id_especie"`,
    [tutorUsuarioId, tutorId, fields.especie_id, fields.nombre]
  );
  return rows[0] ?? null;
}

export async function updateMascota(id, fields, tutorUsuarioId) {
  const { rows } = await pool.query(
    `WITH actualizada AS (
       UPDATE "MASCOTA" m
       SET "nombre_mascota" = COALESCE($2::varchar, m."nombre_mascota"),
           "id_especie" = COALESCE($3::int, m."id_especie")
       FROM "TUTOR" t
       WHERE m."id_mascota" = $1 AND t."id_tutor" = m."id_tutor"
         AND ($4::int IS NULL OR t."id_usuario" = $4)
       RETURNING m."id_mascota", m."nombre_mascota", m."id_especie", m."id_tutor"
     )
     SELECT a."id_mascota" AS id, a."nombre_mascota" AS nombre,
            a."id_especie", e."nombre_especie" AS especie, a."id_tutor"
     FROM actualizada a JOIN "ESPECIE" e ON e."id_especie" = a."id_especie"`,
    [id, fields.nombre ?? null, fields.especie_id ?? null, tutorUsuarioId]
  );
  return rows[0] ?? null;
}

export async function deleteMascota(id) {
  const { rowCount } = await pool.query('DELETE FROM "MASCOTA" WHERE "id_mascota" = $1', [id]);
  return rowCount > 0;
}

export async function listAlergiasByMascota(idMascota) {
  const { rows } = await pool.query(
    'SELECT "id_alergia" AS id, "id_mascota", "principio_activo" FROM "ALERGIA_MASCOTA" WHERE "id_mascota" = $1 ORDER BY "id_alergia"',
    [idMascota]
  );
  return rows;
}

export async function createAlergia(id_mascota, principio_activo) {
  const { rows } = await pool.query(
    `INSERT INTO "ALERGIA_MASCOTA" ("id_mascota", "principio_activo")
     VALUES ($1, $2) RETURNING "id_alergia" AS id, "id_mascota", "principio_activo"`,
    [id_mascota, principio_activo]
  );
  return rows[0];
}

export async function deleteAlergia(id) {
  const { rowCount } = await pool.query('DELETE FROM "ALERGIA_MASCOTA" WHERE "id_alergia" = $1', [id]);
  return rowCount > 0;
}

// 4. CITAS MÉDICAS Y BLOQUES HORARIOS DISPONIBLES

export async function listCitas(user) {
  const tutorUsuarioId = user?.rol === 'Tutor' ? user.id : null;
  const vetUsuarioId = user?.rol === 'Veterinario' ? user.id : null;

  const { rows } = await pool.query(
    `SELECT c."id_cita" AS id, c."id_mascota", m."nombre_mascota" AS mascota,
            t."nombre_tutor" AS tutor, c."id_sede", s."nombre" AS sede,
            c."id_veterinario", v."nombre_veterinario" AS veterinario,
            c."tipo_atencion", to_char(c."fecha_hora", 'YYYY-MM-DD HH24:MI') AS "fecha_hora", c."estado"
     FROM "CITA_MEDICA" c
     JOIN "MASCOTA" m ON m."id_mascota" = c."id_mascota"
     JOIN "TUTOR" t ON t."id_tutor" = m."id_tutor"
     JOIN "SEDE" s ON s."id_sede" = c."id_sede"
     JOIN "VETERINARIO" v ON v."id_veterinario" = c."id_veterinario"
     WHERE ($1::int IS NULL OR t."id_usuario" = $1)
       AND ($2::int IS NULL OR v."id_usuario" = $2)
     ORDER BY c."fecha_hora" DESC`,
    [tutorUsuarioId, vetUsuarioId]
  );
  return rows;
}

export async function createCita({ id_mascota, id_sede, id_veterinario, tipo_atencion, fecha_hora, diagnostico, tratamiento, id_usuario, medicamentos, cantidades, id_vacuna, numero_refuerzo }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Determinar si la fecha de la cita es pasada respecto al momento actual
    const esPasada = new Date(fecha_hora) < new Date();
    const estadoInicial = esPasada ? 'Completada' : 'Programada';

    // 2. Insertar la cita médica
    const { rows } = await client.query(
      `INSERT INTO "CITA_MEDICA" ("id_mascota", "id_sede", "id_veterinario", "tipo_atencion", "fecha_hora", "estado")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_mascota, id_sede, id_veterinario, tipo_atencion, fecha_hora, estadoInicial]
    );
    const cita = rows[0];

    if (esPasada) {
      // 3A. Si es pasada, registramos la atención
      if (!diagnostico || !tratamiento) {
        throw new Error('Diagnóstico y tratamiento son obligatorios para atenciones en fechas pasadas.');
      }

      const meds = Array.isArray(medicamentos) ? medicamentos.map(Number) : [];
      const cants = Array.isArray(cantidades) ? cantidades.map(Number) : [];

      // Solo llamamos al Procedimiento Almacenado 1 si realmente se seleccionaron medicamentos, 
      // evitando así el error de bucle nulo en el PL/pgSQL de la base de datos.
      if (meds.length > 0 && cants.length > 0) {
        await client.query(
          'CALL sp_registrar_atencion($1::int, $2::text, $3::text, $4::int, $5::int[], $6::int[])',
          [cita.id_cita, diagnostico, tratamiento, id_usuario, meds, cants]
        );
      } else {
        // Si no hay medicamentos, creamos la ficha y completamos la cita directamente de forma segura
        await client.query(
          `INSERT INTO "FICHA_CLINICA" ("id_cita", "diagnostico", "tratamiento", "estado", "id_usuario_modificador")
           VALUES ($1, $2, $3, FALSE, $4)`,
          [cita.id_cita, diagnostico, tratamiento, id_usuario]
        );
        await client.query(
          'UPDATE "CITA_MEDICA" SET "estado" = \'Completada\' WHERE "id_cita" = $1',
          [cita.id_cita]
        );
      }

      // 3B. Si se seleccionó una vacuna, ejecutamos el Procedimiento Almacenado 2
      if (id_vacuna) {
        const idVacNum = Number(id_vacuna);
        const numRef = Number(numero_refuerzo ?? 0);

        // Obtener los días de refuerzo del plan de vacunación
        const { rows: planRows } = await client.query(
          `SELECT "dias_refuerzo" FROM "PLAN_VACUNACION" WHERE "id_vacuna" = $1`,
          [idVacNum]
        );
        const diasRefuerzo = planRows[0]?.dias_refuerzo ?? 0;

        // Insertar directamente el registro de vacunación usando la fecha de la cita pasada
        await client.query(
          `INSERT INTO "REGISTRO_VACUNACION" ("id_vacuna", "id_mascota", "id_cita", "fecha_aplicacion", "vencimiento_vacuna", "numero_refuerzo")
           VALUES ($1, $2, $3, $4::date, $4::date + ($5 || ' days')::interval, $6)`,
          [idVacNum, id_mascota, cita.id_cita, fecha_hora, diasRefuerzo, numRef]
        );
      }
    } else {
      // 4. Si es futura, pre-crea la ficha clínica abierta (estado = TRUE) como hacíamos antes
      await client.query(
        `INSERT INTO "FICHA_CLINICA" ("id_cita", "diagnostico", "tratamiento", "estado", "id_usuario_modificador")
         VALUES ($1, NULL, NULL, TRUE, NULL)`,
        [cita.id_cita]
      );
    }

    await client.query('COMMIT');
    return cita;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateEstadoCita(idCita, estado) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Actualizar el estado de la cita
    const { rows } = await client.query(
      'UPDATE "CITA_MEDICA" SET "estado" = $2 WHERE "id_cita" = $1 RETURNING *',
      [idCita, estado]
    );
    const cita = rows[0];

    // 2. Si la cita es cancelada, eliminar su ficha clínica abierta asociada
    if (cita && estado === 'Cancelada') {
      await client.query(
        'DELETE FROM "FICHA_CLINICA" WHERE "id_cita" = $1 AND "estado" = TRUE',
        [idCita]
      );
    }

    await client.query('COMMIT');
    return cita ?? null;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Endpoint: Calcula bloques horarios disponibles (09:00 a 17:00) directamente en PostgreSQL
export async function getBloquesDisponibles(idVeterinario, fecha) {
  const { rows } = await pool.query(
    `WITH bloques_dia AS (
       SELECT generate_series(
         ($2::date + TIME '09:00:00')::timestamp,
         ($2::date + TIME '17:00:00')::timestamp,
         INTERVAL '1 hour'
       ) AS bloque_horario
     )
     SELECT to_char(b.bloque_horario, 'HH24:MI') AS hora_disponible,
            to_char(b.bloque_horario, 'YYYY-MM-DD HH24:MI') AS fecha_hora_exacta
     FROM bloques_dia b
     LEFT JOIN "CITA_MEDICA" c
       ON c."id_veterinario" = $1
      AND c."estado" != 'Cancelada'
      AND date_trunc('hour', c."fecha_hora") = b.bloque_horario
     WHERE c."id_cita" IS NULL
     ORDER BY b.bloque_horario`,
    [idVeterinario, fecha]
  );
  return rows;
}

// 5. FICHAS CLÍNICAS, RECETAS Y AUDITORÍA (Soporte RBAC y Triggers)

export async function listFichasClinicas(tutorUsuarioId) {
  const { rows } = await pool.query(
    `SELECT f."id_ficha" AS id, f."id_cita", c."fecha_hora", c."tipo_atencion",
            m."id_mascota", m."nombre_mascota" AS mascota, e."nombre_especie" AS especie,
            t."nombre_tutor" AS tutor, v."nombre_veterinario" AS veterinario, s."nombre" AS sede,
            f."diagnostico", f."tratamiento", f."estado" AS abierta, f."id_usuario_modificador",
            COALESCE(
              json_agg(
                json_build_object(
                  'id_receta', r."id_receta",
                  'id_medicamento', r."id_medicamento",
                  'nombre_comercial', med."nombre_comercial",
                  'principio_activo', med."principio_activo",
                  'cantidad_entregada', r."cantidad_entregada"
                )
              ) FILTER (WHERE r."id_receta" IS NOT NULL), '[]'
            ) AS recetas
     FROM "FICHA_CLINICA" f
     JOIN "CITA_MEDICA" c ON c."id_cita" = f."id_cita"
     JOIN "MASCOTA" m ON m."id_mascota" = c."id_mascota"
     JOIN "ESPECIE" e ON e."id_especie" = m."id_especie"
     JOIN "TUTOR" t ON t."id_tutor" = m."id_tutor"
     JOIN "VETERINARIO" v ON v."id_veterinario" = c."id_veterinario"
     JOIN "SEDE" s ON s."id_sede" = c."id_sede"
     LEFT JOIN "RECETA" r ON r."id_ficha" = f."id_ficha"
     LEFT JOIN "MEDICAMENTO" med ON med."id_medicamento" = r."id_medicamento"
     WHERE ($1::int IS NULL OR t."id_usuario" = $1)
     GROUP BY f."id_ficha", c."id_cita", m."id_mascota", e."nombre_especie", t."nombre_tutor", v."nombre_veterinario", s."nombre"
     ORDER BY c."fecha_hora" DESC`,
    [tutorUsuarioId]
  );
  return rows;
}

// Modificar diagnóstico/tratamiento de una ficha y cerrarla (estado = FALSE) completando su cita
export async function updateDiagnosticoFicha(idFicha, { diagnostico, tratamiento, id_usuario_modificador, medicamentos, cantidades, id_vacuna, numero_refuerzo }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Actualizar ficha clínica: fija diagnóstico, tratamiento, cambia estado a Cerrada (FALSE) y guarda el modificador
    const { rows } = await client.query(
      `UPDATE "FICHA_CLINICA"
       SET "diagnostico" = COALESCE($2, "diagnostico"),
           "tratamiento" = COALESCE($3, "tratamiento"),
           "estado" = FALSE,
           "id_usuario_modificador" = $4
       WHERE "id_ficha" = $1
       RETURNING *`,
      [idFicha, diagnostico, tratamiento, id_usuario_modificador]
    );
    const ficha = rows[0];

    if (!ficha) {
      throw new Error('Ficha clínica no encontrada.');
    }

    // 2. Actualizar automáticamente el estado de su cita médica a 'Completada' y obtener su fecha y mascota
    const { rows: citaRows } = await client.query(
      'UPDATE "CITA_MEDICA" SET "estado" = \'Completada\' WHERE "id_cita" = $1 RETURNING "id_mascota", "fecha_hora"',
      [ficha.id_cita]
    );
    const idMascota = citaRows[0]?.id_mascota;
    const fechaCita = citaRows[0]?.fecha_hora;

    // 3. Si hay medicamentos, llamamos al Procedimiento Almacenado 1 para generar la receta y restar inventario de la sede
    const meds = Array.isArray(medicamentos) ? medicamentos.map(Number) : [];
    const cants = Array.isArray(cantidades) ? cantidades.map(Number) : [];

    if (meds.length > 0 && cants.length > 0) {
      await client.query(
        'CALL sp_registrar_atencion($1::int, $2::text, $3::text, $4::int, $5::int[], $6::int[])',
        [ficha.id_cita, diagnostico, tratamiento, id_usuario_modificador, meds, cants]
      );
    }

    // 4. Si se seleccionó una vacuna al cerrar la ficha abierta, ejecutamos el SP2 y corregimos sus fechas
    if (id_vacuna && idMascota) {
      await client.query(
        'CALL sp_aplicar_vacuna($1::int, $2::int, $3::int, $4::int)',
        [idMascota, id_vacuna, ficha.id_cita, numero_refuerzo]
      );

      await client.query(
        `UPDATE "REGISTRO_VACUNACION" rv
         SET "fecha_aplicacion" = $2::date,
             "vencimiento_vacuna" = $2::date + (pv."dias_refuerzo" * INTERVAL '1 day')
         FROM "PLAN_VACUNACION" pv
         WHERE rv."id_cita" = $1 AND pv."id_vacuna" = rv."id_vacuna"`,
        [ficha.id_cita, fechaCita]
      );
    }

    await client.query('COMMIT');
    return ficha;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function listAuditoria() {
  const { rows } = await pool.query(
    `SELECT a."id_auditoria" AS id, a."id_ficha", m."nombre_mascota" AS mascota,
            a."diagnostico_anterior", a."diagnostico_nuevo",
            a."id_usuario_modificador", to_char(a."fecha_modificacion", 'YYYY-MM-DD HH24:MI:SS') AS "fecha_modificacion"
     FROM "AUDITORIA" a
     JOIN "FICHA_CLINICA" f ON f."id_ficha" = a."id_ficha"
     JOIN "CITA_MEDICA" c ON c."id_cita" = f."id_cita"
     JOIN "MASCOTA" m ON m."id_mascota" = c."id_mascota"
     ORDER BY a."fecha_modificacion" DESC`
  );
  return rows;
}

// 6. PROCEDIMIENTOS ALMACENADOS, VACUNAS Y VISTA MATERIALIZADA

// Llama al Procedimiento Almacenado 1: Registra atención completa y descuenta stock en 1 transacción
export async function callRegistrarAtencion({ id_cita, diagnostico, tratamiento, id_usuario, medicamentos, cantidades }) {
  await pool.query(
    'CALL sp_registrar_atencion($1::int, $2::text, $3::text, $4::int, $5::int[], $6::int[])',
    [id_cita, diagnostico, tratamiento, id_usuario, medicamentos, cantidades]
  );
  return { mensaje: 'Atención clínica registrada e inventario actualizado exitosamente.' };
}

// Llama al Procedimiento Almacenado 2: Aplica vacuna y agenda cita futura de refuerzo
export async function callAplicarVacuna({ id_mascota, id_vacuna, id_cita, numero_refuerzo }) {
  await pool.query(
    'CALL sp_aplicar_vacuna($1::int, $2::int, $3::int, $4::int)',
    [id_mascota, id_vacuna, id_cita, numero_refuerzo]
  );
  return { mensaje: 'Vacuna registrada y plan de refuerzo (de ser necesario) procesado exitosamente.' };
}

export async function listRegistrosVacunacion(tutorUsuarioId) {
  const { rows } = await pool.query(
    `SELECT rv."id_registro" AS id, rv."id_mascota", m."nombre_mascota" AS mascota,
            t."nombre_tutor" AS tutor, rv."id_vacuna", pv."nombre_vacuna",
            pv."cantidad_refuerzo" AS refuerzos_totales, pv."dias_refuerzo",
            rv."numero_refuerzo", rv."fecha_aplicacion"::text, rv."vencimiento_vacuna"::text,
            rv."id_cita"
     FROM "REGISTRO_VACUNACION" rv
     JOIN "MASCOTA" m ON m."id_mascota" = rv."id_mascota"
     JOIN "TUTOR" t ON t."id_tutor" = m."id_tutor"
     JOIN "PLAN_VACUNACION" pv ON pv."id_vacuna" = rv."id_vacuna"
     WHERE ($1::int IS NULL OR t."id_usuario" = $1)
     ORDER BY rv."fecha_aplicacion" DESC`,
    [tutorUsuarioId]
  );
  return rows;
}

// Endpoint: Mascotas con vacunas vencidas o próximas a vencer en los siguientes 30 días
// Excluye vacunas de dosis única (cantidad_refuerzo = 0) y planes ya completados
export async function listVacunasPorVencer() {
  const { rows } = await pool.query(
    `SELECT rv."id_registro" AS id, m."id_mascota", m."nombre_mascota" AS mascota,
            e."nombre_especie" AS especie, t."nombre_tutor" AS tutor, u."email" AS email_tutor,
            pv."nombre_vacuna", rv."numero_refuerzo", pv."cantidad_refuerzo" AS refuerzos_totales,
            rv."fecha_aplicacion"::text, rv."vencimiento_vacuna"::text,
            (rv."vencimiento_vacuna" - CURRENT_DATE) AS dias_para_vencer
     FROM "REGISTRO_VACUNACION" rv
     JOIN "MASCOTA" m ON m."id_mascota" = rv."id_mascota"
     JOIN "ESPECIE" e ON e."id_especie" = m."id_especie"
     JOIN "TUTOR" t ON t."id_tutor" = m."id_tutor"
     JOIN "USUARIO" u ON u."id_usuario" = t."id_usuario"
     JOIN "PLAN_VACUNACION" pv ON pv."id_vacuna" = rv."id_vacuna"
     WHERE pv."cantidad_refuerzo" > 0
       AND rv."numero_refuerzo" < pv."cantidad_refuerzo"
       AND rv."vencimiento_vacuna" <= (CURRENT_DATE + INTERVAL '30 days')
	   AND NOT EXISTS (
         SELECT 1
         FROM "REGISTRO_VACUNACION" rv_posterior
         WHERE rv_posterior."id_mascota" = rv."id_mascota"
           AND rv_posterior."id_vacuna" = rv."id_vacuna"
           AND rv_posterior."numero_refuerzo" > rv."numero_refuerzo"
       )
     ORDER BY rv."vencimiento_vacuna" ASC`
  );
  return rows;
}

// Vista Materializada: Estadísticas de los últimos 12 meses por especie y sede
export async function getEstadisticasAtencion() {
  const { rows } = await pool.query('SELECT * FROM mv_estadisticas_atencion ORDER BY nombre_sede, especie');
  return rows;
}

export async function refreshEstadisticasAtencion() {
  await pool.query('SELECT fn_refrescar_mv_estadisticas()');
  return { mensaje: 'Vista materializada refrescada correctamente.' };
}