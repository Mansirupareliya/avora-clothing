import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadDir = join(__dirname, '..', 'uploads');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  // Allow origins from CORS_ORIGIN env var + all Netlify preview URLs
  const allowedOrigins = (
    process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5175'
  ).split(',').map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Allow any *.netlify.app subdomain automatically
      if (/^https:\/\/[a-z0-9-]+\.netlify\.app$/.test(origin)) {
        return callback(null, true);
      }
      // Allow explicitly listed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
  });

  // ── Swagger UI ────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AVORA API')
    .setDescription('All backend routes for the AVORA menswear store')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  // ─────────────────────────────────────────────────────────────────────────

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`\n🚀 Server running at: http://localhost:${port}`);
  console.log(`📖 Swagger UI:        http://localhost:${port}/api\n`);
}
bootstrap();