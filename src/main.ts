import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import * as ejs from 'ejs';
import { ValidationPipe } from '@nestjs/common';
import { I18nValidationPipe } from 'nestjs-i18n';
import { I18nService } from 'nestjs-i18n';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SessionMiddleware } from './common/middleware/session.middleware';
import * as session from 'express-session';

/**
 * Boots up the NestJS application.
 * Configures the Express app for EJS templating, static file serving, validation, and global error handling.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure EJS as the templating engine
  app.setBaseViewsDir(join(__dirname, '..', 'views')); // Set the directory for view templates
  app.setViewEngine('ejs'); // Use EJS for rendering views

  // Configure static file serving
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/resources/', // Serve static files under the /resources/ path
    maxAge: 3600000 * 12, // Cache static resources for 12 hours
  });

  // Configure session middleware for locale storage
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'super-secret-key', // Secret for signing the session ID cookie
      resave: false, // Don't save session if unmodified
      saveUninitialized: false, // Don't create session until something stored
    }),
  );

  // Apply global validation pipe with i18n support
  // This pipe will automatically validate incoming request DTOs
  const i18n = app.get(I18nService);
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      forbidUnknownValues: false, // Allow unknown properties in objects, useful for partial updates
      exceptionFactory: (errors) => {
        // Custom exception factory to use i18n for validation messages
        const messages = errors.map((error) => {
          for (const key in error.constraints) {
            return i18n.translate(`messages.${error.constraints[key]}`, { lang: app.getLocale() });
          }
        });
        return new ValidationPipe().exceptionFactory(errors); // Use default validation pipe exception for now, can be customized
      },
    }),
  );

  // Apply a global HTTP exception filter for consistent error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply locale change middleware
  app.use(new SessionMiddleware(i18n).use); // Use the custom session middleware for i18n

  // Set the port for the application, default to 3000 if not specified
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
