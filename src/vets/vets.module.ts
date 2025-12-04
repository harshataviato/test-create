import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VetsController } from './vets.controller';
import { VetsService } from './vets.service';
import { VetRepository } from './vet.repository';
import { Vet } from './entities/vet.entity';
import { Specialty } from './entities/specialty.entity';

/**
 * @module VetsModule
 * @description
 * Module responsible for managing `Vet` and `Specialty` entities and their related logic.
 * It brings together controllers, services, repositories, and entities
 * specifically for the veterinarian domain.
 */
@Module({
  imports: [
    // Register TypeORM entities for this module
    TypeOrmModule.forFeature([Vet, Specialty]),
  ],
  controllers: [VetsController], // Register the VetsController
  providers: [VetsService, VetRepository], // Register services and repositories
  exports: [VetsService, VetRepository], // Export services/repositories for other modules to use
})
export class VetsModule {}
