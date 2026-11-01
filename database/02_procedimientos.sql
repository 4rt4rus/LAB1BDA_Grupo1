-- PROCEDIMIENTO 1: Registrar atención clínica, recetar y descontar inventario
-- Recibe arreglos (Arrays) para los medicamentos y cantidades, permitiendo
-- recetar múltiples fármacos en una sola llamada al procedimiento.

CREATE OR REPLACE PROCEDURE sp_registrar_atencion(
    p_id_cita INT,
    p_diagnostico TEXT,
    p_tratamiento TEXT,
    p_id_usuario INT,
    p_medicamentos INT[], -- Arreglo de IDs de medicamentos
    p_cantidades INT[]    -- Arreglo de cantidades correspondientes
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_ficha INT;
    v_id_sede INT;
    i INT;
BEGIN
    -- 1. Validar que las listas de medicamentos y cantidades coincidan
    IF array_length(p_medicamentos, 1) != array_length(p_cantidades, 1) THEN
        RAISE EXCEPTION 'La lista de medicamentos no coincide con las cantidades.';
    END IF;

    -- 2. Obtener la sede desde la cita para saber de qué inventario descontar
    SELECT id_sede INTO v_id_sede FROM "CITA_MEDICA" WHERE id_cita = p_id_cita;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'La cita médica % no existe.', p_id_cita;
    END IF;

    -- 3. Crear la Ficha Clínica (Al ser procedimiento completo, la ficha termina con estado = FALSE)
    INSERT INTO "FICHA_CLINICA" (id_cita, diagnostico, tratamiento, estado, id_usuario_modificador)
    VALUES (p_id_cita, p_diagnostico, p_tratamiento, FALSE, p_id_usuario)
    ON CONFLICT (id_cita) DO UPDATE 
    SET diagnostico = EXCLUDED.diagnostico,
        tratamiento = EXCLUDED.tratamiento,
        estado = FALSE,
        id_usuario_modificador = EXCLUDED.id_usuario_modificador
    RETURNING id_ficha INTO v_id_ficha;

    -- 4. Iterar sobre los medicamentos recetados
    FOR i IN 1 .. array_upper(p_medicamentos, 1) LOOP
        
        -- A. Crear cada receta por cada medicamento recetado junto su cantidad
        INSERT INTO "RECETA" (id_ficha, id_medicamento, cantidad_entregada)
        VALUES (v_id_ficha, p_medicamentos[i], p_cantidades[i]);

        -- B. Descontar del inventario de la sede
        -- Nota: La restricción CHECK ("stock_actual" >= 0) lanzará un error automáticamente
        -- si se intenta descontar más stock del disponible, abortando toda la transacción.
        UPDATE "INVENTARIO"
        SET stock_actual = stock_actual - p_cantidades[i]
        WHERE id_sede = v_id_sede AND id_medicamento = p_medicamentos[i];
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'El medicamento ID % no está registrado en el inventario de la sede %.', p_medicamentos[i], v_id_sede;
        END IF;

    END LOOP;

    -- 5. Actualizar el estado de la cita a Completada
    UPDATE "CITA_MEDICA" SET estado = 'Completada' WHERE id_cita = p_id_cita;

END;
$$;


-- PROCEDIMIENTO 2: Aplicar vacuna y auto-agendar dosis de refuerzo
CREATE OR REPLACE PROCEDURE sp_aplicar_vacuna(
    p_id_mascota INT,
    p_id_vacuna INT,
    p_id_cita_actual INT,
    p_numero_refuerzo_actual INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_dias_refuerzo INT;
    v_cantidad_refuerzo_total INT;
    v_fecha_aplicacion DATE := CURRENT_DATE;
    v_vencimiento_vacuna DATE;
    v_sede INT;
    v_veterinario INT;
    v_tipo_atencion VARCHAR;
    v_proxima_fecha_hora TIMESTAMP;
BEGIN
    -- 1. Obtener la configuración del plan de vacunación
    SELECT dias_refuerzo, cantidad_refuerzo 
    INTO v_dias_refuerzo, v_cantidad_refuerzo_total
    FROM "PLAN_VACUNACION" 
    WHERE id_vacuna = p_id_vacuna;

    -- Calcular el vencimiento sumando los días a la fecha actual
    v_vencimiento_vacuna := v_fecha_aplicacion + v_dias_refuerzo;

    -- 2. Insertar el registro de la vacunación de hoy
    INSERT INTO "REGISTRO_VACUNACION" (
        id_vacuna, id_mascota, id_cita, 
        fecha_aplicacion, vencimiento_vacuna, numero_refuerzo
    ) VALUES (
        p_id_vacuna, p_id_mascota, p_id_cita_actual, 
        v_fecha_aplicacion, v_vencimiento_vacuna, p_numero_refuerzo_actual
    );

    -- 3. Evaluar si la mascota requiere futuras dosis (Regla de negocio principal)
    IF p_numero_refuerzo_actual < v_cantidad_refuerzo_total THEN
        
        -- Leer los datos de la cita de hoy para replicarlos en la cita futura
        SELECT id_sede, id_veterinario, tipo_atencion, fecha_hora
        INTO v_sede, v_veterinario, v_tipo_atencion, v_proxima_fecha_hora
        FROM "CITA_MEDICA"
        WHERE id_cita = p_id_cita_actual;

        -- Proyectar la fecha sumando el intervalo de días requerido por la vacuna
        v_proxima_fecha_hora := v_proxima_fecha_hora + (v_dias_refuerzo || ' days')::interval;

        -- Inyectar automáticamente la nueva cita médica para el refuerzo
        INSERT INTO "CITA_MEDICA" (
            id_mascota, id_sede, id_veterinario, tipo_atencion, fecha_hora, estado
        ) VALUES (
            p_id_mascota, v_sede, v_veterinario, v_tipo_atencion, v_proxima_fecha_hora, 'Programada'
        );
        
    END IF;

END;
$$;