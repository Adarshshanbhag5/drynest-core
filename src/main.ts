import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getLogger } from './shared/logger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { initSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: getLogger(),
  });

  app.setGlobalPrefix('/api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  initSwagger(app);
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
