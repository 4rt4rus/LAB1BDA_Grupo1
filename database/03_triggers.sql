-- TRIGGER 1: Impedir receta si la mascota tiene alergia al principio activo
CREATE OR REPLACE FUNCTION fn_validar_alergia()
RETURNS TRIGGER AS $$
DECLARE
    v_principio_activo VARCHAR;
    v_id_mascota INT;
    v_alergia_existe INT;
BEGIN
    -- 1. Extraer el principio activo del medicamento que se intenta recetar
    SELECT principio_activo INTO v_principio_activo
    FROM "MEDICAMENTO" WHERE id_medicamento = NEW.id_medicamento;

    -- 2. Navegar desde la ficha hasta la cita para obtener el id de la mascota
    SELECT c.id_mascota INTO v_id_mascota
    FROM "FICHA_CLINICA" f
    JOIN "CITA_MEDICA" c ON f.id_cita = c.id_cita
    WHERE f.id_ficha = NEW.id_ficha;

    -- 3. Verificar si existe la combinación de mascota y principio activo en alergias
    SELECT COUNT(*) INTO v_alergia_existe
    FROM "ALERGIA_MASCOTA"
    WHERE id_mascota = v_id_mascota AND principio_activo = v_principio_activo;

    -- 4. Si existe, abortar la transacción con un error
    IF v_alergia_existe > 0 THEN
        RAISE EXCEPTION 'Operación denegada: La mascota es alérgica al principio activo %', v_principio_activo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verificar_alergia
BEFORE INSERT OR UPDATE ON "RECETA"
FOR EACH ROW
EXECUTE FUNCTION fn_validar_alergia();


-- TRIGGER 2: Auditoría al modificar diagnóstico en ficha cerrada
CREATE OR REPLACE FUNCTION fn_auditar_diagnostico()
RETURNS TRIGGER AS $$
BEGIN
    -- estado = FALSE significa que la ficha está "Cerrada"
    -- Solo se registra si la ficha estaba cerrada Y el diagnóstico cambió
    IF OLD.estado = FALSE AND OLD.diagnostico IS DISTINCT FROM NEW.diagnostico THEN
        INSERT INTO "AUDITORIA" (
            id_ficha,
            diagnostico_anterior,
            diagnostico_nuevo,
            id_usuario_modificador,
            fecha_modificacion
        ) VALUES (
            NEW.id_ficha,
            OLD.diagnostico,
            NEW.diagnostico,
            NEW.id_usuario_modificador,
            CURRENT_TIMESTAMP
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auditoria_ficha
AFTER UPDATE ON "FICHA_CLINICA"
FOR EACH ROW
EXECUTE FUNCTION fn_auditar_diagnostico();