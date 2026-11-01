-- Habilita la extensión de encriptación nativa de PostgreSQL para las password de los usuarios
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. CATÁLOGOS BASE: ROLES, ESPECIES, SEDES Y MEDICAMENTOS

INSERT INTO "ROL" ("nombre_rol") VALUES
('Administrador'), -- ID 1
('Veterinario'),   -- ID 2
('Tutor');         -- ID 3

INSERT INTO "ESPECIE" ("nombre_especie") VALUES
('Perro'),              -- ID 1
('Gato'),               -- ID 2
('Pez'),                -- ID 3
('Roedor'),             -- ID 4
('Ave');                -- ID 5

INSERT INTO "SEDE" ("nombre") VALUES
('Sede Norte'),  -- ID 1
('Sede Centro'), -- ID 2
('Sede Sur');    -- ID 3

INSERT INTO "MEDICAMENTO" ("nombre_comercial", "principio_activo") VALUES
('Meloxivet 15mg', 'Meloxicam'),       -- ID 1
('Cefapet 500mg', 'Cefalexina'),       -- ID 2
('Apoquel 16mg', 'Oclacitinib'),       -- ID 3
('Enroflox 50mg', 'Enrofloxacino'),    -- ID 4
('Tramadol Vet 50mg', 'Tramadol');     -- ID 5

-- Inventario inicial para las 3 sedes (15 registros)
INSERT INTO "INVENTARIO" ("id_sede", "id_medicamento", "stock_actual") VALUES
(1, 1, 50), (1, 2, 40), (1, 3, 30), (1, 4, 60), (1, 5, 25),
(2, 1, 45), (2, 2, 50), (2, 3, 20), (2, 4, 35), (2, 5, 40),
(3, 1, 60), (3, 2, 30), (3, 3, 45), (3, 4, 50), (3, 5, 30);

-- 2. USUARIOS Y PERFILES (1 Admin + 3 Vets + 7 Tutores = 11 Usuarios)

INSERT INTO "USUARIO" ("id_rol", "email", "password_hash", "activo") VALUES
-- Admin (Pass: admin123)
(1, 'admin@redvet.cl', crypt('admin123', gen_salt('bf', 10)), TRUE),      -- ID 1 (Admin)
-- Vet 1 (Pass: vet123)
(2, 'vet.norte@redvet.cl', crypt('vet123', gen_salt('bf', 10)), TRUE),    -- ID 2 (Vet 1)
-- Resto de Vets (Pass: 123456)
(2, 'vet.centro@redvet.cl', crypt('123456', gen_salt('bf', 10)), TRUE),   -- ID 3 (Vet 2)
(2, 'vet.sur@redvet.cl', crypt('123456', gen_salt('bf', 10)), TRUE),      -- ID 4 (Vet 3)
-- Tutor 1 (Pass: tutor123)
(3, 'carlos.m@gmail.com', crypt('tutor123', gen_salt('bf', 10)), TRUE),   -- ID 5 (Tutor 1)
-- Resto de Tutores (Pass: 123456)
(3, 'lucia.f@gmail.com', crypt('123456', gen_salt('bf', 10)), TRUE),      -- ID 6 (Tutor 2)
(3, 'pedro.g@gmail.com', crypt('123456', gen_salt('bf', 10)), TRUE),      -- ID 7 (Tutor 3)
(3, 'ana.t@gmail.com', crypt('123456', gen_salt('bf', 10)), TRUE),        -- ID 8 (Tutor 4)
(3, 'diego.r@gmail.com', crypt('123456', gen_salt('bf', 10)), TRUE),      -- ID 9 (Tutor 5)
(3, 'sofia.v@gmail.com', crypt('123456', gen_salt('bf', 10)), TRUE),      -- ID 10 (Tutor 6)
(3, 'mateo.l@gmail.com', crypt('123456', gen_salt('bf', 10)), TRUE);      -- ID 11 (Tutor 7)

INSERT INTO "ADMINISTRADOR" ("id_usuario", "nombre_administrador") VALUES
(1, 'Roberto Gómez (Admin General)'); -- ID 1

INSERT INTO "VETERINARIO" ("id_usuario", "id_sede", "nombre_veterinario") VALUES
(2, 1, 'Dra. Camila Soto'),     -- ID 1 (Sede Norte)
(3, 2, 'Dr. Andrés Valdés'),    -- ID 2 (Sede Centro)
(4, 3, 'Dra. Valentina Pino');  -- ID 3 (Sede Sur)

INSERT INTO "TUTOR" ("id_usuario", "nombre_tutor") VALUES
(5, 'Carlos Mendoza'),   -- ID 1
(6, 'Lucía Fernández'),  -- ID 2
(7, 'Pedro González'),   -- ID 3
(8, 'Ana Torres'),       -- ID 4
(9, 'Diego Rojas'),      -- ID 5
(10, 'Sofía Vargas'),    -- ID 6
(11, 'Mateo Lagos');     -- ID 7

-- 3. MASCOTAS (10) Y ALERGIAS (3)

INSERT INTO "MASCOTA" ("id_especie", "id_tutor", "nombre_mascota") VALUES
(1, 1, 'Firulais'),   -- ID 1 (Perro - Tutor 1)
(2, 1, 'Michi'),      -- ID 2 (Gato - Tutor 1)
(1, 2, 'Rex'),        -- ID 3 (Perro - Tutor 2)
(5, 2, 'Piolín'),     -- ID 4 (Ave - Tutor 2)
(2, 3, 'Luna'),       -- ID 5 (Gato - Tutor 3)
(3, 4, 'Nemo'),       -- ID 6 (Pez - Tutor 4)
(4, 5, 'Hamtaro'),    -- ID 7 (Roedor - Tutor 5)
(1, 5, 'Thor'),       -- ID 8 (Perro - Tutor 5)
(2, 6, 'Simba'),      -- ID 9 (Gato - Tutor 6)
(5, 7, 'Kiwi');       -- ID 10 (Ave - Tutor 7)

INSERT INTO "ALERGIA_MASCOTA" ("id_mascota", "principio_activo") VALUES
(1, 'Meloxicam'),     -- Firulais es alérgico al Meloxicam (Medicamento ID 1)
(3, 'Cefalexina'),    -- Rex es alérgico a la Cefalexina (Medicamento ID 2)
(5, 'Enrofloxacino'); -- Luna es alérgica al Enrofloxacino (Medicamento ID 4)

-- 4. PLANES DE VACUNACIÓN (4 Planes)
-- Nota: cantidad_refuerzo = 0 y dias_refuerzo = 0 representa Dosis Única.

INSERT INTO "PLAN_VACUNACION" ("id_especie", "nombre_vacuna", "cantidad_refuerzo", "dias_refuerzo") VALUES
(1, 'Antirrábica Canina', 0, 0), -- ID 1: Perro, Dosis única
(1, 'Óctuple Canina', 2, 30),                  -- ID 2: Perro, 2 refuerzos cada 30 días
(2, 'Triple Felina', 1, 21),                   -- ID 3: Gato, 1 refuerzo a los 21 días
(5, 'Viruela Aviar', 1, 15);                   -- ID 4: Ave, 1 refuerzo a los 15 días

-- 5. CITAS MÉDICAS (20 en total: 15 pasadas en 20 meses, 5 presentes/futuras)
-- Citas 1 a 4 ocurrieron hace más de 12 meses (entre marzo y agosto 2025) -> Quedan fuera de la Vista Materializada.
-- Citas 5 a 15 ocurrieron en los últimos 12 meses (noviembre 2025 a octubre 2026) -> Entran en la Vista Materializada.

INSERT INTO "CITA_MEDICA" ("id_mascota", "id_sede", "id_veterinario", "tipo_atencion", "fecha_hora", "estado") VALUES
-- Pasadas hace más de 12 meses (Completadas)
(1, 1, 1, 'Sede', '2025-03-15 10:00:00', 'Completada'),      -- Cita 1: Firulais (Vacuna Dosis Única completada)
(2, 2, 2, 'Sede', '2025-05-10 11:00:00', 'Completada'),      -- Cita 2: Michi (Vacuna Triple Felina Inicial)
(2, 2, 2, 'Sede', '2025-05-31 11:00:00', 'Completada'),      -- Cita 3: Michi (Vacuna Triple Felina Refuerzo 1 - Completada)
(6, 3, 3, 'Domicilio', '2025-08-20 15:00:00', 'Completada'), -- Cita 4: Nemo

-- Pasadas dentro de los últimos 12 meses (10 Completadas, 1 Cancelada)
(3, 1, 1, 'Sede', '2025-11-12 09:30:00', 'Completada'),      -- Cita 5: Rex
(5, 2, 2, 'Sede', '2026-01-20 16:00:00', 'Completada'),      -- Cita 6: Luna
(7, 3, 3, 'Sede', '2026-02-14 10:30:00', 'Completada'),      -- Cita 7: Hamtaro
(9, 2, 2, 'Sede', '2026-03-05 12:00:00', 'Cancelada'),       -- Cita 8: Simba (CANCELADA EN EL PASADO - Sin Ficha)
(8, 1, 1, 'Sede', '2026-04-10 14:00:00', 'Completada'),      -- Cita 9: Thor
(1, 1, 1, 'Sede', '2026-06-01 10:00:00', 'Completada'),      -- Cita 10: Firulais
(5, 2, 2, 'Sede', '2026-07-15 11:30:00', 'Completada'),      -- Cita 11: Luna
(10, 3, 3, 'Sede', '2026-08-19 15:30:00', 'Completada'),     -- Cita 12: Kiwi
(3, 1, 1, 'Sede', '2026-10-15 10:00:00', 'Completada'),      -- Cita 13: Rex (Vacuna Óctuple inicial - Refuerzo 0 de 2, agendó Cita 19)
(4, 3, 3, 'Sede', '2026-10-20 16:00:00', 'Completada'),      -- Cita 14: Piolín (Vacuna Aviar inicial, su último refuerzo será en Cita 16)
(8, 1, 1, 'Sede', '2026-10-30 11:00:00', 'Completada'),      -- Cita 15: Thor (Vacuna Dosis Única)

-- Presentes / Futuras (4 Programadas, 1 Cancelada)
(4, 3, 3, 'Sede', '2026-11-04 16:00:00', 'Programada'),      -- Cita 16: Piolín (Auto-agendada desde Cita 14 para último refuerzo 1 de 1)
(1, 1, 1, 'Sede', '2026-11-05 10:00:00', 'Programada'),      -- Cita 17: Firulais
(5, 2, 2, 'Domicilio', '2026-11-06 11:00:00', 'Programada'), -- Cita 18: Luna
(3, 1, 1, 'Sede', '2026-11-14 10:00:00', 'Programada'),      -- Cita 19: Rex (Auto-agendada desde Cita 13 para refuerzo 1 de 2 de Óctuple)
(9, 2, 2, 'Sede', '2026-11-10 15:00:00', 'Cancelada');       -- Cita 20: Simba (CANCELADA A FUTURO - Sin Ficha)

-- 6. FICHAS CLÍNICAS (18 en total: 14 cerradas FALSE, 4 abiertas TRUE)
-- Las citas 8 y 20 no tienen ficha porque fueron canceladas.

INSERT INTO "FICHA_CLINICA" ("id_cita", "diagnostico", "tratamiento", "estado", "id_usuario_modificador") VALUES
-- 14 Fichas de citas completadas (estado = FALSE)
(1, 'Control sano para inmunización', 'Vacunación', FALSE, 2),                       -- Ficha 1 (Cita 1 - Vacuna 1)
(2, 'Control sano felino', 'Vacunación', FALSE, 3),                                  -- Ficha 2 (Cita 2 - Vacuna 2)
(3, 'Refuerzo inmunológico felino', 'Vacunación y medicación antiparasitaria', FALSE, 3), -- Ficha 3 (Cita 3 - Vacuna 3 + Receta)
(4, 'Infección bacteriana en aletas', 'Cambio de parámetros de agua y reposo', FALSE, 4), -- Ficha 4 (Cita 4)
(5, 'Otitis Externa', 'Medicación tópica y limpieza', FALSE, 2),                     -- Ficha 5 (Cita 5 + Receta)
(6, 'Gastroenteritis aguda', 'Medicación e hidratación', FALSE, 3),                  -- Ficha 6 (Cita 6 + Receta)
(7, 'Sobrecrecimiento dental', 'Desgaste clínico y dieta blanda con reposo', FALSE, 4), -- Ficha 7 (Cita 7)
(9, 'Otitis Externa', 'Medicación antiinflamatoria y reposo', FALSE, 2),             -- Ficha 8 (Cita 9 + Receta)
(10, 'Sobrepeso leve', 'Rutina de ejercicio diario y dieta estricta', FALSE, 2),     -- Ficha 9 (Cita 10)
(11, 'Gastroenteritis aguda', 'Ayuno controlado y reposo en casa', FALSE, 3),        -- Ficha 10 (Cita 11)
(12, 'Muda de plumas anormal', 'Suplementación vitamínica y reposo luminoso', FALSE, 4), -- Ficha 11 (Cita 12)
(13, 'Inmunización activa canina', 'Vacunación y medicación analgésica', FALSE, 2),  -- Ficha 12 (Cita 13 - Vacuna 4 + Receta)
(14, 'Chequeo preventivo aviar', 'Vacunación preventiva', FALSE, 4),                 -- Ficha 13 (Cita 14 - Vacuna 5)
(15, 'Control anual preventivo', 'Vacunación de dosis única', FALSE, 2),             -- Ficha 14 (Cita 15 - Vacuna 6)

-- 4 Fichas pre-creadas para citas programadas (estado = TRUE, campos clínicos en NULL)
(16, NULL, NULL, TRUE, NULL), -- Ficha 15 (Cita 16 - Esperando atención del último refuerzo de Piolín)
(17, NULL, NULL, TRUE, NULL), -- Ficha 16 (Cita 17)
(18, NULL, NULL, TRUE, NULL), -- Ficha 17 (Cita 18)
(19, NULL, NULL, TRUE, NULL); -- Ficha 18 (Cita 19)

-- 7. RECETAS MÉDICAS (5 registros enlazados a fichas con "medicación")
-- Cuidando que ninguna mascota reciba un principio activo al que es alérgica.

INSERT INTO "RECETA" ("id_ficha", "id_medicamento", "cantidad_entregada") VALUES
(3, 5, 1),  -- Ficha 3 (Michi): Tramadol Vet
(5, 3, 2),  -- Ficha 5 (Rex): Apoquel (No es alérgico al Oclacitinib, sí a la Cefalexina)
(6, 1, 1),  -- Ficha 6 (Luna): Meloxivet (No es alérgica al Meloxicam, sí al Enrofloxacino)
(8, 1, 2),  -- Ficha 8 (Thor): Meloxivet
(12, 5, 1); -- Ficha 12 (Rex): Tramadol Vet

-- 8. REGISTRO DE VACUNACIÓN (6 registros)

INSERT INTO "REGISTRO_VACUNACION" ("id_vacuna", "id_mascota", "id_cita", "fecha_aplicacion", "vencimiento_vacuna", "numero_refuerzo") VALUES
-- 3 Vacunas ya completadas en el pasado:
-- 1) Dosis única (Plan 1: 0 refuerzos, 0 días) a Firulais en Cita 1
(1, 1, 1, '2025-03-15', '2025-03-15', 0),
-- 2) Dosis inicial de Triple Felina (Plan 3: requiere 1 refuerzo a los 21 días) a Michi en Cita 2
(3, 2, 2, '2025-05-10', '2025-05-31', 0),
-- 3) Refuerzo final de Triple Felina (1 de 1 completado) a Michi en Cita 3
(3, 2, 3, '2025-05-31', '2025-06-21', 1),

-- 3 Vacunas activas / recientes:
-- 4) En medio de sus dosis de refuerzo: Rex recibió dosis inicial (0 de 2) de Óctuple Canina en Cita 13; su refuerzo 1 quedó agendado en Cita 19 (14-Nov-2026)
(2, 3, 13, '2026-10-15', '2026-11-14', 0),
-- 5) Esperando su último refuerzo en una cita programada: Piolín recibió dosis inicial (0 de 1) de Viruela Aviar (Plan 4: 15 días) en Cita 14 (20-Oct), vence el 04-Nov-2026 (Justo el día de su Cita Programada 16)
(4, 4, 14, '2026-10-20', '2026-11-04', 0),
-- 6) Dosis única hecha el 30 de octubre de 2026: Thor recibió Antirrábica (Plan 1: 0 refuerzos) en Cita 15
(1, 8, 15, '2026-10-30', '2026-10-30', 0);

-- 9. MODIFICACIONES EN FICHAS CERRADAS (Dispara automáticamente el Trigger 2 de Auditoría)
-- Se actualizan diagnósticos de fichas con estado = FALSE para generar historial en AUDITORIA.

-- Caso 1: La Dra. Camila Soto (id_usuario = 2) precisa el diagnóstico de la Ficha 5 (Rex, Cita 5)
UPDATE "FICHA_CLINICA"
SET "diagnostico" = 'Otitis Externa Bilateral Crónica',
    "id_usuario_modificador" = 2
WHERE "id_ficha" = 5;

-- Caso 2: El Administrador (id_usuario = 1) corrige el diagnóstico de la Ficha 9 (Firulais, Cita 10)
UPDATE "FICHA_CLINICA"
SET "diagnostico" = 'Sobrepeso moderado con indicación nutricional',
    "id_usuario_modificador" = 1
WHERE "id_ficha" = 9;

-- Refrescar la vista materializada inicialmente tras insertar la semilla
REFRESH MATERIALIZED VIEW mv_estadisticas_atencion;