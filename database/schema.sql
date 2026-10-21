-- Hito 1: ejecutar sobre una base vacía con psql -v ON_ERROR_STOP=1.
BEGIN;

CREATE TABLE roles (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE CHECK (nombre IN ('TUTOR', 'VETERINARIO', 'ADMINISTRADOR'))
);

CREATE TABLE usuarios (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rol_id bigint NOT NULL REFERENCES roles(id),
  correo text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sedes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  direccion text NOT NULL,
  telefono text,
  activa boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tutores (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id bigint NOT NULL UNIQUE REFERENCES usuarios(id),
  telefono text,
  direccion text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE especies (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE
);

CREATE TABLE mascotas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tutor_id bigint NOT NULL REFERENCES tutores(id),
  especie_id bigint NOT NULL REFERENCES especies(id),
  nombre text NOT NULL,
  fecha_nacimiento date,
  sexo text CHECK (sexo IN ('M', 'H')),
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE veterinarios (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id bigint NOT NULL UNIQUE REFERENCES usuarios(id),
  registro_profesional text NOT NULL UNIQUE,
  especialidad text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE veterinario_sede (
  veterinario_id bigint NOT NULL REFERENCES veterinarios(id),
  sede_id bigint NOT NULL REFERENCES sedes(id),
  PRIMARY KEY (veterinario_id, sede_id)
);

CREATE TABLE horarios_veterinario (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  veterinario_id bigint NOT NULL,
  sede_id bigint NOT NULL,
  dia_semana smallint NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  CHECK (hora_inicio < hora_fin),
  FOREIGN KEY (veterinario_id, sede_id) REFERENCES veterinario_sede(veterinario_id, sede_id)
);

CREATE TABLE citas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mascota_id bigint NOT NULL REFERENCES mascotas(id),
  veterinario_id bigint NOT NULL,
  sede_id bigint NOT NULL,
  inicio timestamptz NOT NULL,
  fin timestamptz NOT NULL,
  modalidad text NOT NULL CHECK (modalidad IN ('PRESENCIAL', 'DOMICILIO')),
  direccion_domicilio text,
  estado text NOT NULL DEFAULT 'PROGRAMADA' CHECK (estado IN ('PROGRAMADA', 'COMPLETADA', 'CANCELADA')),
  creado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (inicio < fin),
  CHECK (modalidad <> 'DOMICILIO' OR direccion_domicilio IS NOT NULL),
  FOREIGN KEY (veterinario_id, sede_id) REFERENCES veterinario_sede(veterinario_id, sede_id)
);

CREATE TABLE fichas_clinicas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mascota_id bigint NOT NULL UNIQUE REFERENCES mascotas(id),
  observaciones text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE atenciones (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ficha_clinica_id bigint NOT NULL REFERENCES fichas_clinicas(id),
  cita_id bigint UNIQUE REFERENCES citas(id),
  veterinario_id bigint NOT NULL REFERENCES veterinarios(id),
  sede_id bigint NOT NULL REFERENCES sedes(id),
  motivo text NOT NULL,
  notas text,
  fecha timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE diagnosticos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  atencion_id bigint NOT NULL REFERENCES atenciones(id),
  descripcion text NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tratamientos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  atencion_id bigint NOT NULL REFERENCES atenciones(id),
  descripcion text NOT NULL,
  indicaciones text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE principios_activos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE
);

CREATE TABLE medicamentos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  principio_activo_id bigint NOT NULL REFERENCES principios_activos(id),
  nombre text NOT NULL UNIQUE,
  presentacion text NOT NULL,
  activo boolean NOT NULL DEFAULT true
);

CREATE TABLE alergias_mascota (
  mascota_id bigint NOT NULL REFERENCES mascotas(id),
  principio_activo_id bigint NOT NULL REFERENCES principios_activos(id),
  notas text,
  registrado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (mascota_id, principio_activo_id)
);

CREATE TABLE inventario_sede (
  sede_id bigint NOT NULL REFERENCES sedes(id),
  medicamento_id bigint NOT NULL REFERENCES medicamentos(id),
  cantidad integer NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (sede_id, medicamento_id)
);

CREATE TABLE recetas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  atencion_id bigint NOT NULL REFERENCES atenciones(id),
  indicaciones_generales text,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE detalle_receta (
  receta_id bigint NOT NULL REFERENCES recetas(id),
  medicamento_id bigint NOT NULL REFERENCES medicamentos(id),
  dosis text NOT NULL,
  frecuencia text NOT NULL,
  duracion_dias integer NOT NULL CHECK (duracion_dias > 0),
  cantidad integer NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (receta_id, medicamento_id)
);

CREATE TABLE vacunas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  descripcion text
);

CREATE TABLE planes_vacunacion (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  especie_id bigint NOT NULL REFERENCES especies(id),
  vacuna_id bigint NOT NULL REFERENCES vacunas(id),
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  UNIQUE (especie_id, vacuna_id, nombre)
);

CREATE TABLE dosis_plan (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  plan_id bigint NOT NULL REFERENCES planes_vacunacion(id),
  numero smallint NOT NULL CHECK (numero > 0),
  edad_dias integer NOT NULL CHECK (edad_dias >= 0),
  intervalo_dias integer CHECK (intervalo_dias > 0),
  UNIQUE (plan_id, numero)
);

CREATE TABLE vacunas_aplicadas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mascota_id bigint NOT NULL REFERENCES mascotas(id),
  vacuna_id bigint NOT NULL REFERENCES vacunas(id),
  dosis_plan_id bigint REFERENCES dosis_plan(id),
  veterinario_id bigint NOT NULL REFERENCES veterinarios(id),
  sede_id bigint NOT NULL REFERENCES sedes(id),
  fecha_aplicacion date NOT NULL,
  fecha_proxima date,
  lote text,
  creado_en timestamptz NOT NULL DEFAULT now(),
  CHECK (fecha_proxima IS NULL OR fecha_proxima > fecha_aplicacion)
);

CREATE TABLE auditoria_diagnosticos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  diagnostico_id bigint NOT NULL REFERENCES diagnosticos(id),
  usuario_id bigint REFERENCES usuarios(id),
  descripcion_anterior text NOT NULL,
  descripcion_nueva text NOT NULL,
  modificado_en timestamptz NOT NULL DEFAULT now()
);

COMMIT;
