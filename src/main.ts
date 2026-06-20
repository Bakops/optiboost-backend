import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function resolvePort(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  const preferredPort = resolvePort(
    process.env.PORT ?? process.env.BACKEND_PORT,
    3000,
  );
  const fallbackPort = resolvePort(process.env.BACKEND_FALLBACK_PORT, 3002);

  try {
    await app.listen(preferredPort);
    console.log(`Optiboost backend listening on http://localhost:${preferredPort}`);
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'EADDRINUSE' &&
      fallbackPort !== preferredPort
    ) {
      console.warn(
        `Port ${preferredPort} already in use, retrying on ${fallbackPort}.`,
      );
      await app.listen(fallbackPort);
      console.log(
        `Optiboost backend listening on http://localhost:${fallbackPort}`,
      );
      return;
    }

    throw error;
  }
}

void bootstrap();
