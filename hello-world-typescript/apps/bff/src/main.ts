import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { RequestContextMiddleware } from './app/foundation/request-context/RequestContextMiddleware';
import { ValidationPipe } from '@nestjs/common';
import { CustomLoggingInterceptor } from './app/foundation/common/CustomLoggingInterceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(new RequestContextMiddleware().use);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalInterceptors(new CustomLoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Mobile BFF API')
    .setDescription('The Mobile BFF API description')
    .setVersion('1.0')
    .addTag('bff')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
