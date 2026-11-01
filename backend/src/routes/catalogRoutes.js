import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as controller from '../controllers/catalogController.js';

const router = Router();
router.use(authenticate);

// 1. Catálogos generales
router.get('/especies', controller.getEspecies);
router.post('/especies', authorize('Administrador'), controller.postEspecie);
router.delete('/especies/:id', authorize('Administrador'), controller.deleteEspecie);

router.get('/sedes', controller.getSedes);
router.post('/sedes', authorize('Administrador'), controller.postSede);
router.patch('/sedes/:id', authorize('Administrador'), controller.patchSede);
router.delete('/sedes/:id', authorize('Administrador'), controller.deleteSede);

router.get('/veterinarios', controller.getVeterinarios);
router.get('/tutores', authorize('Veterinario', 'Administrador'), controller.getTutores);

router.get('/medicamentos', authorize('Veterinario', 'Administrador'), controller.getMedicamentos);
router.post('/medicamentos', authorize('Administrador'), controller.postMedicamento);
router.delete('/medicamentos/:id', authorize('Administrador'), controller.deleteMedicamento);

router.get('/planes-vacunacion', controller.getPlanesVacunacion);
router.post('/planes-vacunacion', authorize('Administrador'), controller.postPlanVacunacion);

// 2. Inventario de farmacia (Gestionado por Administrador, visible para Veterinario al recetar)
router.get('/inventario', authorize('Veterinario', 'Administrador'), controller.getInventario);
router.post('/inventario', authorize('Administrador'), controller.postInventario);

// 3. Mascotas y Alergias
router.get('/mascotas', authorize('Tutor', 'Veterinario', 'Administrador'), controller.getMascotas);
router.post('/mascotas', authorize('Tutor', 'Administrador'), controller.postMascota);
router.get('/mascotas/:id', authorize('Tutor', 'Veterinario', 'Administrador'), controller.getMascotaById);
router.patch('/mascotas/:id', authorize('Tutor', 'Administrador'), controller.patchMascota);
router.delete('/mascotas/:id', authorize('Administrador'), controller.deleteMascota);

router.get('/mascotas/:id/alergias', authorize('Tutor', 'Veterinario', 'Administrador'), controller.getAlergiasByMascota);
router.post('/alergias', authorize('Veterinario', 'Administrador'), controller.postAlergia);
router.delete('/alergias/:id', authorize('Veterinario', 'Administrador'), controller.deleteAlergia);

// 4. Citas Médicas y Endpoint de bloques horarios disponibles
router.get('/citas', authorize('Tutor', 'Veterinario', 'Administrador'), controller.getCitas);
router.post('/citas', authorize('Tutor', 'Veterinario', 'Administrador'), controller.postCita);
router.patch('/citas/:id/estado', authorize('Veterinario', 'Administrador'), controller.patchEstadoCita);
router.get('/veterinarios/:idVeterinario/disponibilidad', authorize('Tutor', 'Veterinario', 'Administrador'), controller.getBloquesDisponibles);

// 5. Fichas Clínicas (Tutor solo ve las de sus mascotas) y Auditoría (Trigger 2)
router.get('/fichas', authorize('Tutor', 'Veterinario', 'Administrador'), controller.getFichasClinicas);
router.patch('/fichas/:id', authorize('Veterinario', 'Administrador'), controller.patchFichaClinica);
router.get('/auditoria', authorize('Administrador'), controller.getAuditoria);

// 6. Procedimientos Almacenados, Vacunación y Vista Materializada
router.post('/atenciones', authorize('Veterinario', 'Administrador'), controller.postRegistrarAtencion); // SP 1 + Trigger 1
router.post('/vacunaciones', authorize('Veterinario', 'Administrador'), controller.postAplicarVacuna);   // SP 2
router.get('/vacunaciones', authorize('Tutor', 'Veterinario', 'Administrador'), controller.getRegistrosVacunacion);
router.get('/vacunaciones/por-vencer', authorize('Veterinario', 'Administrador'), controller.getVacunasPorVencer);

router.get('/estadisticas', authorize('Administrador'), controller.getEstadisticasAtencion);
router.post('/estadisticas/refrescar', authorize('Administrador'), controller.postRefrescarEstadisticas);

export default router;
