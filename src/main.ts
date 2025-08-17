import process from 'node:process';
import CreateServer from './server';

const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = CreateServer();

  app.listen(port, () => {
    console.log(`Servidor ejecutandose en el puerto ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Error al arrancar el servidor', error);
  process.exit(1);
});
