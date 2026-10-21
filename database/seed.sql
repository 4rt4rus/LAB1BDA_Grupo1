-- Datos de demostración. Ejecutar una vez después de schema.sql.
-- Contraseña de los tres usuarios: Lab1BD2026! (cambiar fuera de desarrollo).
BEGIN;
INSERT INTO roles (nombre) VALUES ('TUTOR'), ('VETERINARIO'), ('ADMINISTRADOR');
INSERT INTO usuarios (rol_id, correo, password_hash, nombre) VALUES
  ((SELECT id FROM roles WHERE nombre = 'TUTOR'), 'ana@example.test', '$2b$12$PgiOHphSGWLOxnNtk3psaeFIqTLtAX3dojXo2aoZMOcnxeFPODwwS', 'Ana Pérez'),
  ((SELECT id FROM roles WHERE nombre = 'VETERINARIO'), 'luis@example.test', '$2b$12$PgiOHphSGWLOxnNtk3psaeFIqTLtAX3dojXo2aoZMOcnxeFPODwwS', 'Luis Soto'),
  ((SELECT id FROM roles WHERE nombre = 'ADMINISTRADOR'), 'admin@example.test', '$2b$12$PgiOHphSGWLOxnNtk3psaeFIqTLtAX3dojXo2aoZMOcnxeFPODwwS', 'Admin Demo');
INSERT INTO sedes (nombre, direccion, telefono) VALUES
  ('Centro', 'Av. Central 100', '22220001'),
  ('Norte', 'Calle Norte 200', '22220002');
INSERT INTO tutores (usuario_id, telefono, direccion)
  SELECT id, '99990000', 'Calle Uno 10' FROM usuarios WHERE correo = 'ana@example.test';
INSERT INTO especies (nombre) VALUES ('Perro'), ('Gato');
INSERT INTO mascotas (tutor_id, especie_id, nombre, fecha_nacimiento, sexo) VALUES
  ((SELECT id FROM tutores LIMIT 1), (SELECT id FROM especies WHERE nombre = 'Perro'), 'Luna', '2021-05-10', 'H'),
  ((SELECT id FROM tutores LIMIT 1), (SELECT id FROM especies WHERE nombre = 'Gato'), 'Milo', '2023-02-15', 'M');
INSERT INTO veterinarios (usuario_id, registro_profesional, especialidad)
  SELECT id, 'VET-001', 'Medicina general' FROM usuarios WHERE correo = 'luis@example.test';
INSERT INTO veterinario_sede (veterinario_id, sede_id)
  SELECT v.id, s.id FROM veterinarios v CROSS JOIN sedes s;
INSERT INTO horarios_veterinario (veterinario_id, sede_id, dia_semana, hora_inicio, hora_fin)
  SELECT v.id, s.id, 1, '09:00', '17:00' FROM veterinarios v JOIN sedes s ON s.nombre = 'Centro';
INSERT INTO principios_activos (nombre) VALUES ('Amoxicilina'), ('Meloxicam');
INSERT INTO medicamentos (principio_activo_id, nombre, presentacion) VALUES
  ((SELECT id FROM principios_activos WHERE nombre = 'Amoxicilina'), 'Amoxicilina 250 mg', 'Comprimido'),
  ((SELECT id FROM principios_activos WHERE nombre = 'Meloxicam'), 'Meloxicam 1 mg', 'Comprimido');
INSERT INTO inventario_sede (sede_id, medicamento_id, cantidad)
  SELECT s.id, m.id, 20 FROM sedes s CROSS JOIN medicamentos m;
INSERT INTO vacunas (nombre, descripcion) VALUES
  ('Antirrábica', 'Prevención de rabia'),
  ('Triple felina', 'Vacuna combinada para gatos');
INSERT INTO planes_vacunacion (especie_id, vacuna_id, nombre)
  VALUES ((SELECT id FROM especies WHERE nombre = 'Perro'), (SELECT id FROM vacunas WHERE nombre = 'Antirrábica'), 'Plan canino básico');
INSERT INTO dosis_plan (plan_id, numero, edad_dias, intervalo_dias)
  SELECT id, 1, 90, 365 FROM planes_vacunacion WHERE nombre = 'Plan canino básico';
COMMIT;
