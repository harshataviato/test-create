import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as hbs from 'express-handlebars';
import { ValidationPipe } from '@nestjs/common';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { flash } from 'express-flash-2';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as dotenv from 'dotenv';
import { AppDataSource } from './config/typeorm.config';
import { initializeDataSource } from './config/typeorm.config';

// Load environment variables from .env file
dotenv.config();

/**
 * @module Main
 * @description
 * The entry point of the NestJS PetClinic application.
 * This function bootstraps the NestJS application, configures the Express server,
 * sets up template engine (Handlebars), static assets, validation,
 * and global middleware for internationalization and session management.
 * It also initializes the TypeORM data source and runs migrations.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- TypeORM Database Initialization and Migrations ---
  await initializeDataSource();
  await AppDataSource.runMigrations();
  console.log('TypeORM migrations executed successfully.');


  // --- Templating Engine (Handlebars) Configuration ---
  app.useStaticAssets(join(__dirname, '..', 'public')); // Serve static files from 'public' directory
  app.setBaseViewsDir(join(__dirname, '..', 'views')); // Set base directory for templates
  app.setViewEngine('hbs'); // Set Handlebars as the view engine

  // Configure Handlebars engine
  app.engine(
    'hbs',
    hbs.engine({
      extname: 'hbs',
      defaultLayout: 'main', // Specify the default layout file (views/layouts/main.hbs)
      layoutsDir: join(__dirname, '..', 'views', 'layouts'), // Directory for layout files
      partialsDir: join(__dirname, '..', 'views', 'partials'), // Directory for partials
      helpers: {
        // Custom Handlebars helpers for common view logic
        '#temporals.format': (date: Date | string, format: string) => {
          if (!date) return '';
          return dayjs(date).format(format); // Format dates using dayjs
        },
        '#strings.listJoin': (list: any[], separator: string) => {
          return list ? list.map(item => item.name).join(separator) : ''; // Join names of objects in a list
        },
        '#numbers.sequence': (start: number, end: number) => {
          const arr = [];
          for (let i = start; i <= end; i++) {
            arr.push(i);
          }
          return arr; // Generate a sequence of numbers
        },
        // Helper to check if a value is new (no ID)
        'isNew': (value: { id?: number | null }) => {
          return value && (value.id === null || value.id === undefined);
        },
        // Helper for conditional equality in templates
        'eq': (a: any, b: any) => a === b,
        // Helper to check if a value is greater than another
        'gt': (a: number, b: number) => a > b,
        // Helper to check if a value is less than another
        'lt': (a: number, b: number) => a < b,
        // Helper to render validation errors (e.g., from class-validator)
        'renderErrors': (errors: any[]) => {
          if (!errors || errors.length === 0) return '';
          return errors.map(error => `<span class="help-inline">${error}</span>`).join('');
        },
        // Helper to determine if a field has errors
        'hasErrors': (errors: Record<string, any>, fieldName: string) => {
          return errors && errors[fieldName] && errors[fieldName].length > 0;
        },
        'fieldErrorClass': (errors: Record<string, any>, fieldName: string) => {
          return errors && errors[fieldName] && errors[fieldName].length > 0 ? 'has-error' : '';
        },
        // Helper to access i18n messages dynamically (alternative to direct access)
        'i18n': function(key: string) {
          // This helper assumes `i18n` context is passed to the template rendering context
          // and relies on `I18nContext.current()` to retrieve it.
          const i18nService = I18nContext.current();
          return i18nService ? i18nService.t(key) : key;
        }
      },
    }),
  );

  // --- Global Validation Pipe ---
  // Applies class-validator globally for all incoming DTOs.
  // It transforms plain JavaScript objects into class instances.
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Remove properties not defined in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      errorHttpStatusCode: HttpStatus.BAD_REQUEST, // Use 400 for validation errors
      // Detailed error messages based on i18n keys
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          for (const key in error.constraints) {
            if (error.constraints.hasOwnProperty(key)) {
              return error.constraints[key]; // Return the first constraint message
            }
          }
          return 'Validation error';
        });
        return new HttpException({ message: messages.join(', '), errors }, HttpStatus.BAD_REQUEST);
      },
    }),
  );
  // Using I18nValidationExceptionFilter to translate validation errors in responses
  // This is specifically for API responses, not for rendering form errors directly.
  app.useGlobalFilters(new I18nValidationExceptionFilter());


  // --- Session Management & Flash Messages ---
  // Required for flash messages (e.g., success/error banners after redirects)
  app.use(cookieParser(process.env.COOKIE_SECRET || 'super-secret-key')); // Use a strong secret in production
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'another-super-secret-key', // Use a strong secret in production
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
    }),
  );
  app.use(flash()); // Enable flash messages


  // --- Start the application ---
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
