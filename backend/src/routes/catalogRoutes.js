import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as controller from '../controllers/catalogController.js';

const router = Router();
router.use(authenticate);
router.get('/mascotas', authorize('TUTOR', 'VETERINARIO', 'ADMINISTRADOR'), controller.getMascotas);
router.post('/mascotas', authorize('TUTOR', 'ADMINISTRADOR'), controller.postMascota);
router.get('/mascotas/:id', authorize('TUTOR', 'VETERINARIO', 'ADMINISTRADOR'), controller.getMascotaById);
router.patch('/mascotas/:id', authorize('TUTOR', 'ADMINISTRADOR'), controller.patchMascota);
router.get('/veterinarios', controller.getVeterinarios);
router.get('/sedes', controller.getSedes);
export default router;
