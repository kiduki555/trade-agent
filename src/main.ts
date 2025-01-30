import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('트레이딩 에이전트 API')
    .setDescription('트레이딩 시스템의 API 문서')
    .setVersion('1.0')
    .addTag('trading')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
