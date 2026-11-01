import 'dotenv/config';
import cron from 'node-cron';
import { app } from './app.js';
import { pool } from './config/db.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace_with_a_long_random_secret') {
  throw new Error('Configura JWT_SECRET en backend/.env antes de iniciar.');
}

// Evento programado: Refresca la vista materializada todos los días a las 03:00 AM
cron.schedule('0 3 * * *', async () => {
  try {
    await pool.query('SELECT fn_refrescar_mv_estadisticas();');
    console.log('[CRON] Vista materializada mv_estadisticas_atencion actualizada.');
  } catch (error) {
    console.error('[CRON] Error al refrescar vista materializada:', error.message);
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API disponible en http://localhost:${port}`));