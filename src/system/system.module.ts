import { Module } from '@nestjs/common';
import { CrashController } from './crash.controller';
import { WelcomeController } from './welcome.controller';
import { HttpExceptionFilter } from './http-exception.filter'; // Import the exception filter

/**
 * @module SystemModule
 * @description
 * Module for system-wide concerns like welcome page and error handling demonstration.
 * It includes controllers for the welcome page and an intentional crash endpoint,
 * along with the global exception filter.
 */
@Module({
  controllers: [CrashController, WelcomeController], // Register system controllers
  providers: [HttpExceptionFilter], // Register the exception filter as a provider
  exports: [], // No exports as these are typically standalone system endpoints
})
export class SystemModule {}
