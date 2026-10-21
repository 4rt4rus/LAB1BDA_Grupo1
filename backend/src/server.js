import 'dotenv/config';
import { app } from './app.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace_with_a_long_random_secret') {
  throw new Error('Configura JWT_SECRET en backend/.env antes de iniciar.');
}
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API disponible en http://localhost:${port}`));
