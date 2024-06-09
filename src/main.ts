import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Основная функция для запуска приложения.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка Swagger для документирования API.
  const config = new DocumentBuilder()
    .setTitle('Feedback24 API')
    .setDescription('API for handling feedback requests')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Запуск приложения на порту 3000.
  await app.listen(3000);
}
bootstrap();
