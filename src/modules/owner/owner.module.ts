import { Module, CacheInterceptor } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { OwnerRepository } from './owner.repository';
import { Owner } from './entities/owner.entity';
import { Pet } from './entities/pet.entity';
import { PetType } from './entities/pet-type.entity';
import { Visit } from './entities/visit.entity';
import { PetTypeRepository } from './pet-type.repository';
import { PetTypeFormatter } from './utils/pet-type.formatter';
import { APP_INTERCEPTOR } from '@nestjs/core'; // For global interceptors
import { I18nService } from 'nestjs-i18n';

/**
 * OwnerModule handles all functionalities related to owners, pets, and visits.
 * It imports necessary TypeORM entities and configures controllers, services, and repositories.
 */
@Module({
  imports: [
    // Register TypeORM entities for this module
    TypeOrmModule.forFeature([Owner, Pet, PetType, Visit]),
  ],
  controllers: [OwnerController], // Declare controllers for handling HTTP requests
  providers: [
    OwnerService, // Provide OwnerService for business logic
    OwnerRepository, // Provide OwnerRepository for data access
    PetTypeRepository, // Provide PetTypeRepository for data access
    PetTypeFormatter, // Provide PetTypeFormatter for data formatting
    I18nService, // Inject I18nService
    // Optionally, apply a CacheInterceptor globally or to specific methods/controllers
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CacheInterceptor,
    // },
  ],
  exports: [OwnerService, OwnerRepository, PetTypeRepository], // Export services/repositories if used by other modules
})
export class OwnerModule {}
