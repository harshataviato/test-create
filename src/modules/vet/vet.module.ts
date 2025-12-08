import { Module, CacheInterceptor, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetController } from './vet.controller';
import { VetService } from './vet.service';
import { VetRepository } from './vet.repository';
import { Vet } from './entities/vet.entity';
import { Specialty } from './entities/specialty.entity';
import { APP_INTERCEPTOR } from '@nestjs/core'; // For global interceptors
import { I18nService } from 'nestjs-i18n';


/**
 * VetModule handles all functionalities related to veterinarians and their specialties.
 * It imports necessary TypeORM entities and configures controllers, services, and repositories.
 */
@Module({
  imports: [
    // Register TypeORM entities for this module
    TypeOrmModule.forFeature([Vet, Specialty]),
  ],
  controllers: [VetController], // Declare controllers for handling HTTP requests
  providers: [
    VetService, // Provide VetService for business logic
    VetRepository, // Provide VetRepository for data access
    I18nService, // Inject I18nService
    // Optionally, apply a CacheInterceptor globally or to specific methods/controllers
    // The CacheModule is imported in AppModule with isGlobal: true, so no need to import here again.
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor, // Example of applying a cache interceptor
    // },
  ],
  exports: [VetService, VetRepository], // Export services/repositories if used by other modules
})
export class VetModule {}
