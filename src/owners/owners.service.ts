import { Injectable, NotFoundException } from '@nestjs/common';
import { OwnerRepository } from './owner.repository';
import { PetTypeRepository } from './pet-type.repository';
import { Owner } from './entities/owner.entity';
import { PetType } from './entities/pet-type.entity';
import { PaginatedResult, PaginationOptions } from '../common/pagination.interface';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { Pet } from './entities/pet.entity';
import { CreatePetDto } from '../pets/dto/create-pet.dto';
import { UpdatePetDto } from '../pets/dto/update-pet.dto';
import { Visit } from './entities/visit.entity';
import { CreateVisitDto } from '../visits/dto/create-visit.dto';
import * as dayjs from 'dayjs';

/**
 * @module Owners
 * @description
 * Service class for managing `Owner`, `Pet`, and `Visit` entities.
 * This service encapsulates the business logic for owners, their pets,
 * and the visits associated with those pets. It interacts with `OwnerRepository`
 * and `PetTypeRepository` for data access.
 */
@Injectable()
export class OwnersService {
  constructor(
    private readonly ownerRepository: OwnerRepository,
    private readonly petTypeRepository: PetTypeRepository,
  ) {}

  /**
   * Finds owners by their last name, supporting partial matches and pagination.
   *
   * @param {string} lastName - The last name (or a prefix) to search for.
   * @param {PaginationOptions} paginationOptions - Pagination parameters.
   * @returns {Promise<PaginatedResult<Owner>>} A paginated list of matching owners.
   */
  async findOwnersByLastName(lastName: string, paginationOptions: PaginationOptions): Promise<PaginatedResult<Owner>> {
    return this.ownerRepository.findByLastNameStartingWith(lastName, paginationOptions);
  }

  /**
   * Finds a single owner by their ID.
   *
   * @param {number} ownerId - The ID of the owner.
   * @returns {Promise<Owner>} The found owner.
   * @throws {NotFoundException} If no owner with the given ID is found.
   */
  async findOwnerById(ownerId: number): Promise<Owner> {
    return this.ownerRepository.findById(ownerId);
  }

  /**
   * Creates a new owner.
   *
   * @param {CreateOwnerDto} createOwnerDto - Data to create the new owner.
   * @returns {Promise<Owner>} The newly created and saved owner.
   */
  async createOwner(createOwnerDto: CreateOwnerDto): Promise<Owner> {
    const newOwner = this.ownerRepository.create(createOwnerDto);
    return this.ownerRepository.save(newOwner);
  }

  /**
   * Updates an existing owner.
   *
   * @param {number} ownerId - The ID of the owner to update.
   * @param {UpdateOwnerDto} updateOwnerDto - Data to update the owner.
   * @returns {Promise<Owner>} The updated and saved owner.
   * @throws {NotFoundException} If no owner with the given ID is found.
   */
  async updateOwner(ownerId: number, updateOwnerDto: UpdateOwnerDto): Promise<Owner> {
    const owner = await this.findOwnerById(ownerId); // This will throw NotFoundException if not found
    Object.assign(owner, updateOwnerDto);
    return this.ownerRepository.save(owner);
  }

  /**
   * Retrieves all available pet types.
   *
   * @returns {Promise<PetType[]>} A list of all pet types.
   */
  async findAllPetTypes(): Promise<PetType[]> {
    return this.petTypeRepository.findPetTypes();
  }

  /**
   * Finds a pet by its ID within a specific owner's pets.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet.
   * @returns {Promise<Pet>} The found pet.
   * @throws {NotFoundException} If the owner or pet is not found.
   */
  async findPetByOwnerAndId(ownerId: number, petId: number): Promise<Pet> {
    const owner = await this.findOwnerById(ownerId);
    const pet = owner.getPet(petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found for owner ${ownerId}.`);
    }
    return pet;
  }

  /**
   * Creates a new pet for a specific owner.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {CreatePetDto} createPetDto - Data to create the new pet.
   * @returns {Promise<Owner>} The updated owner with the new pet.
   * @throws {NotFoundException} If the owner or pet type is not found.
   * @throws {Error} If a pet with the same name already exists for the owner.
   */
  async createPet(ownerId: number, createPetDto: CreatePetDto): Promise<Owner> {
    const owner = await this.findOwnerById(ownerId);
    const petType = await this.petTypeRepository.findOne({ where: { name: createPetDto.type } });

    if (!petType) {
      throw new NotFoundException(`Pet type '${createPetDto.type}' not found.`);
    }

    if (owner.getPetByNameWithNewFlag(createPetDto.name, true)) {
      throw new Error('duplicate'); // Custom error code for validation
    }
    
    // Convert birthDate string to Date object
    const birthDate = createPetDto.birthDate ? dayjs(createPetDto.birthDate).toDate() : null;

    const newPet = new Pet();
    newPet.name = createPetDto.name;
    newPet.birthDate = birthDate;
    newPet.type = petType;
    newPet.owner = owner;

    owner.addPet(newPet);
    return this.ownerRepository.save(owner);
  }

  /**
   * Updates an existing pet for a specific owner.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet to update.
   * @param {UpdatePetDto} updatePetDto - Data to update the pet.
   * @returns {Promise<Owner>} The updated owner.
   * @throws {NotFoundException} If the owner, pet, or pet type is not found.
   * @throws {Error} If a pet with the same name already exists for the owner (excluding the current pet).
   */
  async updatePet(ownerId: number, petId: number, updatePetDto: UpdatePetDto): Promise<Owner> {
    const owner = await this.findOwnerById(ownerId);
    const pet = owner.getPet(petId);

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found for owner ${ownerId}.`);
    }

    const petType = await this.petTypeRepository.findOne({ where: { name: updatePetDto.type } });
    if (!petType) {
      throw new NotFoundException(`Pet type '${updatePetDto.type}' not found.`);
    }

    // Check for duplicate name among other pets of the same owner
    const existingPetWithSameName = owner.getPetByNameWithNewFlag(updatePetDto.name, false);
    if (existingPetWithSameName && existingPetWithSameName.id !== petId) {
      throw new Error('duplicate'); // Custom error code for validation
    }

    Object.assign(pet, {
      name: updatePetDto.name,
      birthDate: dayjs(updatePetDto.birthDate).toDate(), // Convert birthDate string to Date object
      type: petType,
    });

    return this.ownerRepository.save(owner);
  }

  /**
   * Adds a new visit for a specific pet belonging to an owner.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet.
   * @param {CreateVisitDto} createVisitDto - Data to create the new visit.
   * @returns {Promise<Owner>} The updated owner.
   * @throws {NotFoundException} If the owner or pet is not found.
   */
  async addVisitToPet(ownerId: number, petId: number, createVisitDto: CreateVisitDto): Promise<Owner> {
    const owner = await this.findOwnerById(ownerId);
    const pet = owner.getPet(petId);

    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found for owner ${ownerId}.`);
    }

    // Convert date string to Date object
    const visitDate = createVisitDto.date ? dayjs(createVisitDto.date).toDate() : dayjs().toDate();

    const newVisit = new Visit();
    newVisit.date = visitDate;
    newVisit.description = createVisitDto.description;
    newVisit.pet = pet; // Link the visit to the pet

    pet.addVisit(newVisit); // Add the visit to the pet's collection
    return this.ownerRepository.save(owner); // Save the owner, which cascades to pet and visit
  }
}
