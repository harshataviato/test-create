import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { OwnerRepository } from './owner.repository';
import { Owner } from './entities/owner.entity';
import { Pet } from './entities/pet.entity';
import { PetType } from './entities/pet-type.entity';
import { Visit } from './entities/visit.entity';
import { PetTypeRepository } from './pet-type.repository';
import { IPaginationMeta, IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { I18nService } from 'nestjs-i18n';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';


/**
 * Service class for managing Owner, Pet, and Visit entities.
 * Encapsulates business logic and interacts with the repositories.
 */
@Injectable()
export class OwnerService {
  constructor(
    private readonly ownerRepository: OwnerRepository,
    private readonly petTypeRepository: PetTypeRepository,
    private readonly i18n: I18nService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Finds an owner by their ID, including their pets and visits.
   * @param id The ID of the owner.
   * @returns The Owner entity or null if not found.
   */
  async findOwnerWithPetsAndVisits(id: number): Promise<Owner | null> {
    return this.ownerRepository.findOne({
      where: { id },
      relations: ['pets', 'pets.visits', 'pets.type'], // Eagerly load pets, their visits, and pet types
      order: {
        pets: {
          name: 'ASC', // Order pets by name
          visits: {
            date: 'ASC', // Order visits by date
          },
        },
      },
    });
  }

  /**
   * Retrieves all owners whose last name starts with a given string, with pagination.
   * @param lastName The starting string for the last name.
   * @param page The page number to retrieve.
   * @param limit The maximum number of items per page.
   * @returns A paginated list of owners.
   */
  async findByLastNameStartingWith(
    lastName: string,
    page: number,
    limit: number,
  ): Promise<Pagination<Owner, IPaginationMeta>> {
    const options: IPaginationOptions = { page, limit };
    return this.ownerRepository.paginateOwnersByLastName(lastName, options);
  }

  /**
   * Finds an owner by their ID.
   * @param id The ID of the owner.
   * @returns The Owner entity or null if not found.
   */
  async findById(id: number): Promise<Owner | null> {
    return this.ownerRepository.findOne({ where: { id } });
  }

  /**
   * Saves an owner entity (either new or existing).
   * @param owner The owner entity to save.
   * @returns The saved owner entity.
   */
  async save(owner: Owner): Promise<Owner> {
    // Clear cache for 'vets' as it might be affected (though not directly here, common in Spring PetClinic)
    await this.cacheManager.del('vets');
    return this.ownerRepository.save(owner);
  }

  /**
   * Retrieves all available pet types.
   * @returns A list of PetType entities.
   */
  async findPetTypes(): Promise<PetType[]> {
    return this.petTypeRepository.find({ order: { name: 'ASC' } });
  }

  /**
   * Adds a new pet to an owner.
   * @param ownerId The ID of the owner.
   * @param pet The pet entity to add.
   * @param i18nLang The language for translation.
   * @returns The newly added pet.
   * @throws NotFoundException if the owner is not found.
   * @throws ConflictException if a pet with the same name already exists for this owner.
   */
  async addPetToOwner(ownerId: number, pet: Pet, i18nLang: string): Promise<Pet> {
    const owner = await this.findOwnerWithPetsAndVisits(ownerId);
    if (!owner) {
      throw new NotFoundException(
        this.i18n.translate('messages.ownerNotFound', { lang: i18nLang, args: { id: ownerId } }),
      );
    }

    // Check for duplicate pet name (case-insensitive) for the same owner
    const existingPet = owner.pets.find(
      (p) => p.name.toLowerCase() === pet.name.toLowerCase() && p.id !== pet.id,
    );
    if (existingPet) {
      throw new ConflictException(this.i18n.translate('messages.duplicate', { lang: i18nLang, args: { field: this.i18n.translate('messages.name', { lang: i18nLang }) } }));
    }

    pet.owner = owner; // Assign the owner to the pet
    owner.pets.push(pet); // Add pet to owner's collection
    await this.ownerRepository.save(owner); // Save the owner (cascades to pet)
    return pet;
  }

  /**
   * Updates an existing pet.
   * @param ownerId The ID of the owner.
   * @param petId The ID of the pet to update.
   * @param updatedPetData The new data for the pet.
   * @param i18nLang The language for translation.
   * @returns The updated pet.
   * @throws NotFoundException if the owner or pet is not found.
   * @throws ConflictException if the updated pet name conflicts with an existing pet of the same owner.
   */
  async updatePet(ownerId: number, petId: number, updatedPetData: Partial<Pet>, i18nLang: string): Promise<Pet> {
    const owner = await this.findOwnerWithPetsAndVisits(ownerId);
    if (!owner) {
      throw new NotFoundException(
        this.i18n.translate('messages.ownerNotFound', { lang: i18nLang, args: { id: ownerId } }),
      );
    }

    const petToUpdate = owner.pets.find((p) => p.id === petId);
    if (!petToUpdate) {
      throw new NotFoundException(
        this.i18n.translate('messages.petNotFound', { lang: i18nLang, args: { id: petId, ownerId: ownerId } }),
      );
    }

    // Check for duplicate pet name (case-insensitive) for the same owner, excluding the pet being updated
    if (updatedPetData.name) {
      const existingPetWithSameName = owner.pets.find(
        (p) => p.name.toLowerCase() === updatedPetData.name.toLowerCase() && p.id !== petId,
      );
      if (existingPetWithSameName) {
        throw new ConflictException(this.i18n.translate('messages.duplicate', { lang: i18nLang, args: { field: this.i18n.translate('messages.name', { lang: i18nLang }) } }));
      }
    }

    Object.assign(petToUpdate, updatedPetData); // Apply partial updates
    await this.ownerRepository.save(owner); // Save the owner (cascades to pet)
    return petToUpdate;
  }

  /**
   * Retrieves a specific pet of an owner.
   * @param ownerId The ID of the owner.
   * @param petId The ID of the pet.
   * @param i18nLang The language for translation.
   * @returns The Pet entity or null if not found.
   * @throws NotFoundException if the owner or pet is not found.
   */
  async findOwnerPet(ownerId: number, petId: number, i18nLang: string): Promise<{ owner: Owner, pet: Pet }> {
    const owner = await this.findOwnerWithPetsAndVisits(ownerId);
    if (!owner) {
      throw new NotFoundException(
        this.i18n.translate('messages.ownerNotFound', { lang: i18nLang, args: { id: ownerId } }),
      );
    }
    const pet = owner.pets.find(p => p.id === petId);
    if (!pet) {
      throw new NotFoundException(
        this.i18n.translate('messages.petNotFound', { lang: i18nLang, args: { id: petId, ownerId: ownerId } }),
      );
    }
    return { owner, pet };
  }

  /**
   * Adds a visit to a specific pet of an owner.
   * @param ownerId The ID of the owner.
   * @param petId The ID of the pet to add the visit to.
   * @param visit The visit entity to add.
   * @param i18nLang The language for translation.
   * @returns The newly added visit.
   * @throws NotFoundException if the owner or pet is not found.
   */
  async addVisitToPet(ownerId: number, petId: number, visit: Visit, i18nLang: string): Promise<Visit> {
    const owner = await this.findOwnerWithPetsAndVisits(ownerId);
    if (!owner) {
      throw new NotFoundException(
        this.i18n.translate('messages.ownerNotFound', { lang: i18nLang, args: { id: ownerId } }),
      );
    }

    const pet = owner.pets.find(p => p.id === petId);
    if (!pet) {
      throw new NotFoundException(
        this.i18n.translate('messages.petNotFound', { lang: i18nLang, args: { id: petId, ownerId: ownerId } }),
      );
    }

    visit.pet = pet; // Assign the pet to the visit
    if (!pet.visits) {
      pet.visits = [];
    }
    pet.visits.push(visit); // Add visit to pet's collection
    await this.ownerRepository.save(owner); // Save the owner (cascades to pet and visit)
    return visit;
  }
}
