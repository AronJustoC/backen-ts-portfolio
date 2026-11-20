import process from 'node:process';
import CreateServer from './server';
import { assertJwtSecrets } from './utils/jwt.utils';

const port = process.env.PORT || 3000;

async function bootstrap() {
  // Falla al arrancar si faltan JWT_SECRET o REFRESH_TOKEN_SECRET, en vez de en la primera request.
  assertJwtSecrets();
  const app = CreateServer();

  app.listen(port, () => {
    console.log(`Servidor ejecutandose en el puerto ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Error al arrancar el servidor', error);
  process.exit(1);
});
