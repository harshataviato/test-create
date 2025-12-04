import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnersController } from './owners.controller';
import { OwnersService } from './owners.service';
import { OwnerRepository } from './owner.repository';
import { PetTypeRepository } from './pet-type.repository';
import { Owner } from './entities/owner.entity';
import { Pet } from './entities/pet.entity';
import { PetType } from './entities/pet-type.entity';
import { Visit } from './entities/visit.entity';
import { PetTypePipe } from './pet-type.pipe';
import { PetsController } from '../pets/pets.controller';
import { VisitsController } from '../visits/visits.controller';

/**
 * @module OwnersModule
 * @description
 * Module responsible for managing `Owner`, `Pet`, and `Visit` entities and their related logic.
 * It brings together controllers, services, repositories, and entities
 * specifically for the owner-pet domain.
 */
@Module({
  imports: [
    // Register TypeORM entities for this module
    TypeOrmModule.forFeature([Owner, Pet, PetType, Visit]),
  ],
  controllers: [OwnersController, PetsController, VisitsController], // Register controllers
  providers: [OwnersService, OwnerRepository, PetTypeRepository, PetTypePipe], // Register services and pipes
  exports: [OwnersService, OwnerRepository, PetTypeRepository, PetTypePipe], // Export services/repositories for other modules to use
})
export class OwnersModule {}
