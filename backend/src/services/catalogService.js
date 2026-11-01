import * as repository from '../repositories/catalogRepository.js';

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function positiveId(value, label = 'ID') {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw badRequest(`${label} inválido.`);
  }
  return num;
}

// 1. Catálogos y Sedes
export const getEspecies = () => repository.listEspecies();
export const createEspecie = (body) => {
  if (!body?.nombre?.trim()) throw badRequest('El nombre de la especie es obligatorio.');
  return repository.createEspecie(body.nombre.trim());
};
export const deleteEspecie = (id) => repository.deleteEspecie(positiveId(id, 'ID de especie'));

export const getSedes = () => repository.listSedes();
export const createSede = (body) => {
  if (!body?.nombre?.trim()) throw badRequest('El nombre de la sede es obligatorio.');
  return repository.createSede(body.nombre.trim());
};
export const updateSede = (id, body) => {
  if (!body?.nombre?.trim()) throw badRequest('El nombre de la sede es obligatorio.');
  return repository.updateSede(positiveId(id, 'ID de sede'), body.nombre.trim());
};
export const deleteSede = (id) => repository.deleteSede(positiveId(id, 'ID de sede'));

export const getVeterinarios = () => repository.listVeterinarios();
export const getTutores = () => repository.listTutores();

export const getMedicamentos = () => repository.listMedicamentos();
export const createMedicamento = (body) => {
  if (!body?.nombre_comercial?.trim() || !body?.principio_activo?.trim()) {
    throw badRequest('Nombre comercial y principio activo son obligatorios.');
  }
  return repository.createMedicamento(body.nombre_comercial.trim(), body.principio_activo.trim());
};
export const deleteMedicamento = (id) => repository.deleteMedicamento(positiveId(id, 'ID de medicamento'));

export const getPlanesVacunacion = () => repository.listPlanesVacunacion();
export const createPlanVacunacion = (body) => {
  const id_especie = positiveId(body?.id_especie, 'ID de especie');
  if (!body?.nombre_vacuna?.trim()) throw badRequest('El nombre de la vacuna es obligatorio.');
  const cantidad_refuerzo = Number(body?.cantidad_refuerzo ?? 0);
  const dias_refuerzo = Number(body?.dias_refuerzo ?? 0);
  if (cantidad_refuerzo < 0 || dias_refuerzo < 0) throw badRequest('Refuerzos y días no pueden ser negativos.');
  return repository.createPlanVacunacion({
    id_especie,
    nombre_vacuna: body.nombre_vacuna.trim(),
    cantidad_refuerzo,
    dias_refuerzo,
  });
};

// 2. Inventario
export const getInventario = (idSede) => repository.listInventario(idSede ? positiveId(idSede, 'ID de sede') : null);
export const upsertInventario = (body) => {
  const id_sede = positiveId(body?.id_sede, 'ID de sede');
  const id_medicamento = positiveId(body?.id_medicamento, 'ID de medicamento');
  const stock_actual = Number(body?.stock_actual);
  if (!Number.isInteger(stock_actual) || stock_actual < 0) throw badRequest('Stock inválido.');
  return repository.upsertInventario({ id_sede, id_medicamento, stock_actual });
};

// 3. Mascotas y Alergias
export const getMascotas = (user) => repository.listMascotas(user.rol === 'Tutor' ? user.id : null);
export const getMascotaById = (id, user) => repository.findMascotaById(positiveId(id, 'ID de mascota'), user.rol === 'Tutor' ? user.id : null);

export async function createMascota(body, user) {
  const isAdmin = user.rol === 'Administrador';
  if (!body?.nombre?.trim()) throw badRequest('El nombre de la mascota es obligatorio.');
  const especie_id = positiveId(body?.especie_id, 'ID de especie');
  const tutorId = isAdmin ? positiveId(body?.tutor_id, 'ID de tutor') : null;
  const mascota = await repository.insertMascota({ nombre: body.nombre.trim(), especie_id }, isAdmin ? null : user.id, tutorId);
  if (!mascota) throw badRequest('Tutor o especie inexistente.');
  return mascota;
}

export async function updateMascota(id, body, user) {
  const mascotaId = positiveId(id, 'ID de mascota');
  const fields = {};
  if (body?.nombre !== undefined) {
    if (!body.nombre.trim()) throw badRequest('Nombre inválido.');
    fields.nombre = body.nombre.trim();
  }
  if (body?.especie_id !== undefined) {
    fields.especie_id = positiveId(body.especie_id, 'ID de especie');
  }
  return repository.updateMascota(mascotaId, fields, user.rol === 'Tutor' ? user.id : null);
}

export const deleteMascota = (id) => repository.deleteMascota(positiveId(id, 'ID de mascota'));

export const getAlergiasByMascota = (idMascota) => repository.listAlergiasByMascota(positiveId(idMascota, 'ID de mascota'));
export const createAlergia = (body) => {
  const id_mascota = positiveId(body?.id_mascota, 'ID de mascota');
  if (!body?.principio_activo?.trim()) throw badRequest('El principio activo es obligatorio.');
  return repository.createAlergia(id_mascota, body.principio_activo.trim());
};
export const deleteAlergia = (id) => repository.deleteAlergia(positiveId(id, 'ID de alergia'));

// 4. Citas y Disponibilidad Horaria
export const getCitas = (user) => repository.listCitas(user);
export const createCita = (body, user) => {
  const id_mascota = positiveId(body?.id_mascota, 'ID de mascota');
  const id_sede = positiveId(body?.id_sede, 'ID de sede');
  const id_veterinario = positiveId(body?.id_veterinario, 'ID de veterinario');
  const tipo_atencion = body?.tipo_atencion === 'Domicilio' ? 'Domicilio' : 'Sede';
  if (!body?.fecha_hora) throw badRequest('La fecha y hora son obligatorias.');

  return repository.createCita({
    id_mascota,
    id_sede,
    id_veterinario,
    tipo_atencion,
    fecha_hora: body.fecha_hora,
    diagnostico: body.diagnostico,
    tratamiento: body.tratamiento,
    id_usuario: user.id,
    medicamentos: body.medicamentos,
    cantidades: body.cantidades,
    id_vacuna: body.id_vacuna,
    numero_refuerzo: body.numero_refuerzo
  });
};
export const updateEstadoCita = (id, body) => {
  const estadosValidos = ['Programada', 'Completada', 'Cancelada'];
  if (!estadosValidos.includes(body?.estado)) throw badRequest('Estado de cita inválido.');
  return repository.updateEstadoCita(positiveId(id, 'ID de cita'), body.estado);
};

export const getBloquesDisponibles = (idVeterinario, fecha) => {
  const vetId = positiveId(idVeterinario, 'ID de veterinario');
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw badRequest('Formato de fecha inválido (use YYYY-MM-DD).');
  return repository.getBloquesDisponibles(vetId, fecha);
};

// 5. Fichas Clínicas y Auditoría
export const getFichasClinicas = (user) => repository.listFichasClinicas(user.rol === 'Tutor' ? user.id : null);
export const updateDiagnosticoFicha = (id, body, user) => {
  const diagnostico = body?.diagnostico?.trim();
  const tratamiento = body?.tratamiento?.trim();
  const medicamentos = Array.isArray(body?.medicamentos) ? body.medicamentos.map(Number) : [];
  const cantidades = Array.isArray(body?.cantidades) ? body.cantidades.map(Number) : [];
  const id_vacuna = body?.id_vacuna ? Number(body.id_vacuna) : null;
  const numero_refuerzo = body?.numero_refuerzo !== undefined ? Number(body.numero_refuerzo) : 0;

  if (!diagnostico) throw badRequest('El diagnóstico es obligatorio.');

  return repository.updateDiagnosticoFicha(id, {
    diagnostico,
    tratamiento,
    id_usuario_modificador: user.id,
    medicamentos,
    cantidades,
    id_vacuna,
    numero_refuerzo
  });
};
export const getAuditoria = () => repository.listAuditoria();

// 6. Procedimientos Almacenados, Vacunación y Estadísticas
export const registrarAtencionCompleta = (body, user) => {
  const id_cita = positiveId(body?.id_cita, 'ID de cita');
  if (!body?.diagnostico?.trim() || !body?.tratamiento?.trim()) {
    throw badRequest('Diagnóstico y tratamiento son obligatorios.');
  }
  const medicamentos = Array.isArray(body.medicamentos) ? body.medicamentos.map(m => positiveId(m, 'ID medicamento')) : [];
  const cantidades = Array.isArray(body.cantidades) ? body.cantidades.map(c => positiveId(c, 'Cantidad')) : [];
  return repository.callRegistrarAtencion({
    id_cita,
    diagnostico: body.diagnostico.trim(),
    tratamiento: body.tratamiento.trim(),
    id_usuario: user.id,
    medicamentos,
    cantidades,
  });
};

export const aplicarVacuna = (body) => {
  const id_mascota = positiveId(body?.id_mascota, 'ID de mascota');
  const id_vacuna = positiveId(body?.id_vacuna, 'ID de vacuna');
  const id_cita = positiveId(body?.id_cita, 'ID de cita');
  const numero_refuerzo = Number(body?.numero_refuerzo ?? 0);
  if (!Number.isInteger(numero_refuerzo) || numero_refuerzo < 0) throw badRequest('Número de refuerzo inválido.');
  return repository.callAplicarVacuna({ id_mascota, id_vacuna, id_cita, numero_refuerzo });
};

export const getRegistrosVacunacion = (user) => repository.listRegistrosVacunacion(user.rol === 'Tutor' ? user.id : null);
export const getVacunasPorVencer = () => repository.listVacunasPorVencer();
export const getEstadisticasAtencion = () => repository.getEstadisticasAtencion();
export const refreshEstadisticasAtencion = () => repository.refreshEstadisticasAtencion();