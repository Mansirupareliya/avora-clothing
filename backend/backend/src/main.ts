import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadDir = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Allow multiple origins via comma-separated CORS_ORIGIN env var
  const allowedOrigins = (
    process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5175'
  ).split(',').map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();