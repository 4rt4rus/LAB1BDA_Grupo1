import * as service from '../services/catalogService.js';

const wrap = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    if (result === null || result === false) return res.status(404).json({ error: 'Recurso no encontrado.' });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// 1. Catálogos
export const getEspecies = wrap(() => service.getEspecies());
export const postEspecie = wrap((req, res) => { res.status(201); return service.createEspecie(req.body); });
export const deleteEspecie = wrap((req) => service.deleteEspecie(req.params.id));

export const getSedes = wrap(() => service.getSedes());
export const postSede = wrap((req, res) => { res.status(201); return service.createSede(req.body); });
export const patchSede = wrap((req) => service.updateSede(req.params.id, req.body));
export const deleteSede = wrap((req) => service.deleteSede(req.params.id));

export const getVeterinarios = wrap(() => service.getVeterinarios());
export const getTutores = wrap(() => service.getTutores());

export const getMedicamentos = wrap(() => service.getMedicamentos());
export const postMedicamento = wrap((req, res) => { res.status(201); return service.createMedicamento(req.body); });
export const deleteMedicamento = wrap((req) => service.deleteMedicamento(req.params.id));

export const getPlanesVacunacion = wrap(() => service.getPlanesVacunacion());
export const postPlanVacunacion = wrap((req, res) => { res.status(201); return service.createPlanVacunacion(req.body); });

// 2. Inventario
export const getInventario = wrap((req) => service.getInventario(req.query.id_sede));
export const postInventario = wrap((req, res) => { res.status(201); return service.upsertInventario(req.body); });

// 3. Mascotas y Alergias
export const getMascotas = wrap((req) => service.getMascotas(req.user));
export const getMascotaById = wrap((req) => service.getMascotaById(req.params.id, req.user));
export const postMascota = wrap((req, res) => { res.status(201); return service.createMascota(req.body, req.user); });
export const patchMascota = wrap((req) => service.updateMascota(req.params.id, req.body, req.user));
export const deleteMascota = wrap((req) => service.deleteMascota(req.params.id));

export const getAlergiasByMascota = wrap((req) => service.getAlergiasByMascota(req.params.id));
export const postAlergia = wrap((req, res) => { res.status(201); return service.createAlergia(req.body); });
export const deleteAlergia = wrap((req) => service.deleteAlergia(req.params.id));

// 4. Citas y Disponibilidad Horaria
export const getCitas = wrap((req) => service.getCitas(req.user));
export const postCita = wrap((req, res) => { res.status(201); return service.createCita(req.body, req.user); });
export const patchEstadoCita = wrap((req) => service.updateEstadoCita(req.params.id, req.body));
export const getBloquesDisponibles = wrap((req) => service.getBloquesDisponibles(req.params.idVeterinario, req.query.fecha));

// 5. Fichas Clínicas y Auditoría
export const getFichasClinicas = wrap((req) => service.getFichasClinicas(req.user));
export const patchFichaClinica = wrap((req) => service.updateDiagnosticoFicha(req.params.id, req.body, req.user));
export const getAuditoria = wrap(() => service.getAuditoria());

// 6. Procedimientos Almacenados, Vacunas y Vista Materializada
export const postRegistrarAtencion = wrap((req, res) => { res.status(201); return service.registrarAtencionCompleta(req.body, req.user); });
export const postAplicarVacuna = wrap((req, res) => { res.status(201); return service.aplicarVacuna(req.body); });
export const getRegistrosVacunacion = wrap((req) => service.getRegistrosVacunacion(req.user));
export const getVacunasPorVencer = wrap(() => service.getVacunasPorVencer());
export const getEstadisticasAtencion = wrap(() => service.getEstadisticasAtencion());
export const postRefrescarEstadisticas = wrap(() => service.refreshEstadisticasAtencion());