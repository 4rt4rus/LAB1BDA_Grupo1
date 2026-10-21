import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as controller from '../controllers/catalogController.js';

const router = Router();
router.use(authenticate);
router.get('/mascotas', authorize('TUTOR', 'VETERINARIO', 'ADMINISTRADOR'), controller.getMascotas);
router.get('/veterinarios', controller.getVeterinarios);
router.get('/sedes', controller.getSedes);
export default router;
