-- Índice 1: Acelera la consulta del historial clínico y citas por identificador de mascota
CREATE INDEX idx_cita_mascota ON "CITA_MEDICA" ("id_mascota");

-- Índice 2: Acelera las búsquedas de rangos de fechas (ej. Vista de los últimos 12 meses)
CREATE INDEX idx_cita_fecha_hora ON "CITA_MEDICA" ("fecha_hora");

-- Índice 3 (Estratégico Compuesto): Optimiza el Endpoint que calcula los bloques
-- horarios disponibles de un veterinario específico en una fecha determinada.
CREATE INDEX idx_cita_vet_fecha ON "CITA_MEDICA" ("id_veterinario", "fecha_hora");