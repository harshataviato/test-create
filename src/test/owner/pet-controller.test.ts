/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a TypeScript adaptation of PetControllerTests.java.
// It uses Jest for testing and Supertest for making HTTP requests
// against a conceptual Express.js application representing the PetClinic backend.
// It focuses on pet management (create/update) and validation.

import request from 'supertest';
import express, { Application, Router, Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';
import { validate, ValidationError } from 'class-validator'; // Common validation library in TS
import { plainToInstance } from 'class-transformer'; // For transforming plain objects to class instances

// --- Conceptual Model Definitions ---
// These would typically be in shared domain files.

interface NamedEntity {
  id?: number;
  name: string;
}

class PetType implements NamedEntity {
  id?: number;
  name: string;

  constructor(name: string, id?: number) {
    this.name = name;
    this.id = id;
  }
}

class Pet implements NamedEntity {
  id?: number;
  name: string = '';
  birthDate?: string; // Using string for simplicity, could be Date object
  type?: PetType;
  ownerId?: number; // Added to link to owner
  visits: Visit[] = []; // Not used in this test, but part of model

  constructor(name: string = '') {
    this.name = name;
  }

  addVisit(visit: Visit): void {
    this.visits.push(visit);
  }
}

class Owner implements NamedEntity {
  id?: number;
  firstName: string = '';
  lastName: string = '';
  address: string = '';
  city: string = '';
  telephone: string = '';
  pets: Pet[] = [];

  constructor(id?: number) {
    this.id = id;
  }

  addPet(pet: Pet): void {
    this.pets.push(pet);
    pet.ownerId = this.id; // Link pet to owner
  }

  getPet(name: string, ignoreId?: number): Pet | undefined {
    return this.pets.find(pet => pet.name === name && pet.id !== ignoreId);
  }
}

interface Visit {
  id?: number;
  date: string;
  description: string;
  petId?: number; // Added to link to pet
}

// --- Conceptual Repository Interfaces ---
interface OwnerRepository {
  findById(id: number): Promise<Owner | undefined>;
  save(owner: Owner): Promise<Owner>;
}

interface PetTypeRepository {
  findPetTypes(): Promise<PetType[]>;
}
// --- End Conceptual Definitions ---

// --- Conceptual Validation DTOs and Logic ---

// DTO for Pet creation/update, with validation rules
class PetDto {
  name: string = '';
  birthDate?: string; // yyyy-MM-dd format
  type?: string; // Name of the pet type

  // Example validation using class-validator
  // @IsNotEmpty({ message: 'required' })
  // @IsString()
  // name: string;

  // @IsDateString({ message: 'typeMismatch.birthDate' })
  // @IsPast({ message: 'futureDate' })
  // birthDate?: string;

  // @IsNotEmpty({ message: 'required' })
  // type?: string; // Would need custom validator for existing type

  // Custom validation logic
  static async validate(pet: PetDto, owner: Owner, existingPetId?: number): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Simulate Spring's `@NotEmpty` or `@NotBlank` for name
    if (!pet.name || pet.name.trim() === '') {
      errors.push({
        property: 'name',
        constraints: { required: 'name is required' },
      } as ValidationError);
    } else if (owner.getPet(pet.name, existingPetId)) {
      // Simulate Spring's custom validation for duplicate name
      errors.push({
        property: 'name',
        constraints: { duplicate: 'duplicate pet name' },
      } as ValidationError);
    }

    // Simulate Spring's `@NotNull` for type
    if (!pet.type || pet.type.trim() === '') {
      errors.push({
        property: 'type',
        constraints: { required: 'type is required' },
      } as ValidationError);
    }

    // Simulate Spring's `@Past` for birthDate (assuming format yyyy-MM-dd)
    if (pet.birthDate) {
      try {
        const date = new Date(pet.birthDate);
        if (isNaN(date.getTime())) { // Invalid date string format
          errors.push({
            property: 'birthDate',
            constraints: { typeMismatch: 'invalid birthDate format' },
          } as ValidationError);
        } else if (date.getTime() > new Date().getTime()) { // Future date
          errors.push({
            property: 'birthDate',
            constraints: { futureDate: 'birthDate cannot be in the future' },
          } as ValidationError);
        }
      } catch (e) {
        errors.push({
          property: 'birthDate',
          constraints: { typeMismatch: 'invalid birthDate format' },
        } as ValidationError);
      }
    } else {
      errors.push({
        property: 'birthDate',
        constraints: { required: 'birthDate is required' },
      } as ValidationError);
    }

    return errors;
  }
}


// Middleware to parse form data (Express built-in for urlencoded)
const urlencoded = express.urlencoded({ extended: true });

// --- Conceptual PetController as an Express Router ---
const createPetController = (
  ownerRepository: OwnerRepository,
  petTypeRepository: PetTypeRepository
): Router => {
  const router = express.Router();

  // Middleware to fetch owner and pet (if petId is present)
  router.use(
    '/owners/:ownerId/pets/:petId?/:action?',
    async (req: Request, res: Response, next: NextFunction) => {
      const ownerId = parseInt(req.params.ownerId, 10);
      const owner = await ownerRepository.findById(ownerId);
      if (!owner) {
        return res.status(404).send('Owner not found');
      }
      res.locals.owner = owner; // Attach owner to res.locals for subsequent handlers

      if (req.params.petId) {
        const petId = parseInt(req.params.petId, 10);
        const pet = owner.pets.find(p => p.id === petId);
        if (!pet) {
          return res.status(404).send('Pet not found');
        }
        res.locals.pet = pet; // Attach pet to res.locals
      }
      next();
    }
  );

  // GET /owners/{ownerId}/pets/new
  router.get('/owners/:ownerId/pets/new', async (req, res) => {
    const owner = res.locals.owner as Owner;
    const petTypes = await petTypeRepository.findPetTypes();
    res.status(200).json({
      template: 'pets/createOrUpdatePetForm',
      model: {
        owner: owner,
        pet: new Pet(), // Empty pet for the form
        types: petTypes
      }
    });
  });

  // POST /owners/{ownerId}/pets/new
  router.post('/owners/:ownerId/pets/new', urlencoded, async (req, res) => {
    const owner = res.locals.owner as Owner;
    const petDto = plainToInstance(PetDto, req.body); // Transform request body to DTO

    const validationErrors = await PetDto.validate(petDto, owner);

    if (validationErrors.length > 0) {
      const petTypes = await petTypeRepository.findPetTypes();
      // Mimic Spring MVC errors structure for simplified assertion
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.property && err.constraints) {
          errorMap[err.property] = Object.values(err.constraints)[0]; // Take first constraint message
        }
      });

      return res.status(200).json({
        template: 'pets/createOrUpdatePetForm',
        model: {
          owner: owner,
          pet: { ...new Pet(), ...petDto }, // Keep form data
          types: petTypes,
          errors: errorMap, // Pass errors to the conceptual view
          attributeErrors: { // Simplified for assertions
            pet: {
              name: errorMap.name ? true : false,
              type: errorMap.type ? true : false,
              birthDate: errorMap.birthDate ? true : false,
            }
          },
          attributeErrorCodes: {
            pet: {
              name: errorMap.name ? (errorMap.name.includes('required') ? 'required' : 'duplicate') : undefined,
              type: errorMap.type ? 'required' : undefined,
              birthDate: errorMap.birthDate ? (errorMap.birthDate.includes('invalid') ? 'typeMismatch.birthDate' : undefined) : undefined,
            }
          }
        }
      });
    }

    const pet = new Pet(petDto.name.trim());
    pet.birthDate = petDto.birthDate;
    // Find petType by name. In a real app, this would query the DB.
    const allPetTypes = await petTypeRepository.findPetTypes();
    pet.type = allPetTypes.find(pt => pt.name === petDto.type);

    owner.addPet(pet); // Add to owner's pets
    // Assign a mock ID for new pet
    pet.id = Math.max(...(owner.pets.map(p => p.id || 0)), 0) + 1;

    await ownerRepository.save(owner); // Save owner (conceptually)

    res.status(302).set('Location', `/owners/${owner.id}`).send(); // Redirect
  });

  // GET /owners/{ownerId}/pets/{petId}/edit
  router.get('/owners/:ownerId/pets/:petId/edit', async (req, res) => {
    const owner = res.locals.owner as Owner;
    const pet = res.locals.pet as Pet;
    const petTypes = await petTypeRepository.findPetTypes();
    res.status(200).json({
      template: 'pets/createOrUpdatePetForm',
      model: {
        owner: owner,
        pet: pet,
        types: petTypes
      }
    });
  });

  // POST /owners/{ownerId}/pets/{petId}/edit
  router.post('/owners/:ownerId/pets/:petId/edit', urlencoded, async (req, res) => {
    const owner = res.locals.owner as Owner;
    const pet = res.locals.pet as Pet; // Original pet
    const petDto = plainToInstance(PetDto, req.body);

    const validationErrors = await PetDto.validate(petDto, owner, pet.id);

    if (validationErrors.length > 0) {
      const petTypes = await petTypeRepository.findPetTypes();
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.property && err.constraints) {
          errorMap[err.property] = Object.values(err.constraints)[0];
        }
      });

      return res.status(200).json({
        template: 'pets/createOrUpdatePetForm',
        model: {
          owner: owner,
          pet: { ...pet, ...petDto }, // Keep form data in the model
          types: petTypes,
          errors: errorMap,
          attributeErrors: {
            pet: {
              name: errorMap.name ? true : false,
              type: errorMap.type ? true : false,
              birthDate: errorMap.birthDate ? true : false,
            }
          },
          attributeErrorCodes: {
            pet: {
              name: errorMap.name ? (errorMap.name.includes('required') ? 'required' : 'duplicate') : undefined,
              type: errorMap.type ? 'required' : undefined,
              birthDate: errorMap.birthDate ? (errorMap.birthDate.includes('invalid') ? 'typeMismatch' : undefined) : undefined, // typeMismatch for update
            }
          }
        }
      });
    }

    // Update pet fields
    pet.name = petDto.name.trim();
    pet.birthDate = petDto.birthDate;
    const allPetTypes = await petTypeRepository.findPetTypes();
    pet.type = allPetTypes.find(pt => pt.name === petDto.type);

    await ownerRepository.save(owner); // Save owner (conceptually)

    res.status(302).set('Location', `/owners/${owner.id}`).send(); // Redirect
  });

  return router;
};
// --- End Conceptual PetController ---

describe('PetControllerTests', () => {
  const TEST_OWNER_ID = 1;
  const TEST_PET_ID = 1;
  const TEST_PET_ID_2 = 2; // For 'doggy'

  let app: Application;
  let mockOwnerRepository: jest.Mocked<OwnerRepository>;
  let mockPetTypeRepository: jest.Mocked<PetTypeRepository>;

  const catType = new PetType('cat', 1);
  const dogType = new PetType('dog', 2);
  const hamsterType = new PetType('hamster', 3);

  const ownerWithPets = new Owner(TEST_OWNER_ID);
  const petty = new Pet('petty');
  petty.id = TEST_PET_ID;
  petty.type = catType;
  ownerWithPets.addPet(petty);

  const doggy = new Pet('doggy');
  doggy.id = TEST_PET_ID_2;
  doggy.type = dogType;
  ownerWithPets.addPet(doggy);


  beforeEach(() => {
    // Mimic @MockitoBean
    mockOwnerRepository = {
      findById: jest.fn<(_id: number) => Promise<Owner | undefined>>(),
      save: jest.fn<(_owner: Owner) => Promise<Owner>>(),
    };
    mockPetTypeRepository = {
      findPetTypes: jest.fn<() => Promise<PetType[]>>(),
    };

    // Mimic Mockito `given(...).willReturn(...)`
    mockPetTypeRepository.findPetTypes.mockResolvedValue([catType, dogType, hamsterType]);
    mockOwnerRepository.findById.mockImplementation(async (id) => {
        if (id === TEST_OWNER_ID) {
            // Return a deep copy to prevent tests from modifying the original mock state
            return JSON.parse(JSON.stringify(ownerWithPets));
        }
        return undefined;
    });
    mockOwnerRepository.save.mockImplementation(async (owner) => owner); // Just return the saved owner

    // Setup Express app
    app = express();
    app.use('/', createPetController(mockOwnerRepository, mockPetTypeRepository));
  });

  // @DisabledInNativeImage and @DisabledInAotMode are Java-specific and omitted in TypeScript.

  it('should test initCreationForm', async () => {
    const response = await request(app).get(`/owners/${TEST_OWNER_ID}/pets/new`);

    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('pets/createOrUpdatePetForm');
    expect(response.body.model.pet).toEqual(expect.objectContaining({ name: '' })); // New empty pet
    expect(response.body.model.owner.id).toBe(TEST_OWNER_ID);
    expect(response.body.model.types).toEqual([catType, dogType, hamsterType]);
  });

  it('should test processCreationFormSuccess', async () => {
    const response = await request(app)
      .post(`/owners/${TEST_OWNER_ID}/pets/new`)
      .send('name=Betty&type=hamster&birthDate=2015-02-12'); // Send form data

    expect(response.statusCode).toBe(302); // Redirect
    expect(response.headers['location']).toBe(`/owners/${TEST_OWNER_ID}`);
    expect(mockOwnerRepository.save).toHaveBeenCalledTimes(1);
    const savedOwner = mockOwnerRepository.save.mock.calls[0][0];
    expect(savedOwner.pets.find(p => p.name === 'Betty')).toBeDefined();
  });

  // Mimic JUnit 5's @Nested classes
  describe('ProcessCreationFormHasErrors', () => {

    it('should test processCreationFormWithBlankName', async () => {
      const response = await request(app)
        .post(`/owners/${TEST_OWNER_ID}/pets/new`)
        .send('name=%09+%0A&birthDate=2015-02-12'); // Blank/whitespace name

      expect(response.statusCode).toBe(200);
      expect(response.body.template).toBe('pets/createOrUpdatePetForm');
      expect(response.body.model.attributeErrors.pet.name).toBe(true);
      expect(response.body.model.attributeErrorCodes.pet.name).toBe('required');
      expect(mockOwnerRepository.save).not.toHaveBeenCalled();
    });

    it('should test processCreationFormWithDuplicateName', async () => {
      const response = await request(app)
        .post(`/owners/${TEST_OWNER_ID}/pets/new`)
        .send('name=petty&birthDate=2015-02-12'); // Duplicate name 'petty'

      expect(response.statusCode).toBe(200);
      expect(response.body.template).toBe('pets/createOrUpdatePetForm');
      expect(response.body.model.attributeErrors.pet.name).toBe(true);
      expect(response.body.model.attributeErrorCodes.pet.name).toBe('duplicate');
      expect(mockOwnerRepository.save).not.toHaveBeenCalled();
    });

    it('should test processCreationFormWithMissingPetType', async () => {
      const response = await request(app)
        .post(`/owners/${TEST_OWNER_ID}/pets/new`)
        .send('name=Betty&birthDate=2015-02-12'); // Missing 'type' parameter

      expect(response.statusCode).toBe(200);
      expect(response.body.template).toBe('pets/createOrUpdatePetForm');
      expect(response.body.model.attributeErrors.pet.type).toBe(true);
      expect(response.body.model.attributeErrorCodes.pet.type).toBe('required');
      expect(mockOwnerRepository.save).not.toHaveBeenCalled();
    });

    it('should test processCreationFormWithInvalidBirthDate (future date)', async () => {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() + 1); // Future date
      const futureBirthDate = currentDate.toISOString().split('T')[0];

      const response = await request(app)
        .post(`/owners/${TEST_OWNER_ID}/pets/new`)
        .send(`name=Betty&type=hamster&birthDate=${futureBirthDate}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.template).toBe('pets/createOrUpdatePetForm');
      expect(response.body.model.attributeErrors.pet.birthDate).toBe(true);
      expect(response.body.model.attributeErrorCodes.pet.birthDate).toBe('typeMismatch.birthDate'); // Mimic Spring error code
      expect(mockOwnerRepository.save).not.toHaveBeenCalled();
    });

    it('should test initUpdateForm', async () => {
      const response = await request(app).get(`/owners/${TEST_OWNER_ID}/pets/${TEST_PET_ID}/edit`);

      expect(response.statusCode).toBe(200);
      expect(response.body.template).toBe('pets/createOrUpdatePetForm');
      expect(response.body.model.pet.id).toBe(TEST_PET_ID);
      expect(response.body.model.owner.id).toBe(TEST_OWNER_ID);
      expect(response.body.model.types).toEqual([catType, dogType, hamsterType]);
    });
  });

  it('should test processUpdateFormSuccess', async () => {
    const response = await request(app)
      .post(`/owners/${TEST_OWNER_ID}/pets/${TEST_PET_ID}/edit`)
      .send('name=UpdatedBetty&type=hamster&birthDate=2015-02-12');

    expect(response.statusCode).toBe(302);
    expect(response.headers['location']).toBe(`/owners/${TEST_OWNER_ID}`);
    expect(mockOwnerRepository.save).toHaveBeenCalledTimes(1);
    const updatedOwner = mockOwnerRepository.save.mock.calls[0][0];
    const updatedPet = updatedOwner.pets.find(p => p.id === TEST_PET_ID);
    expect(updatedPet?.name).toBe('UpdatedBetty');
    expect(updatedPet?.birthDate).toBe('2015-02-12');
    expect(updatedPet?.type?.name).toBe('hamster');
  });

  describe('ProcessUpdateFormHasErrors', () => {

    it('should test processUpdateFormWithInvalidBirthDate', async () => {
      const response = await request(app)
        .post(`/owners/${TEST_OWNER_ID}/pets/${TEST_PET_ID}/edit`)
        .send('name=petty&birthDate=2015/02/12'); // Invalid date format

      expect(response.statusCode).toBe(200);
      expect(response.body.template).toBe('pets/createOrUpdatePetForm');
      expect(response.body.model.attributeErrors.pet.birthDate).toBe(true);
      expect(response.body.model.attributeErrorCodes.pet.birthDate).toBe('typeMismatch');
      expect(mockOwnerRepository.save).not.toHaveBeenCalled();
    });

    it('should test processUpdateFormWithBlankName', async () => {
      const response = await request(app)
        .post(`/owners/${TEST_OWNER_ID}/pets/${TEST_PET_ID}/edit`)
        .send('name=  &birthDate=2015-02-12'); // Blank name

      expect(response.statusCode).toBe(200);
      expect(response.body.template).toBe('pets/createOrUpdatePetForm');
      expect(response.body.model.attributeErrors.pet.name).toBe(true);
      expect(response.body.model.attributeErrorCodes.pet.name).toBe('required');
      expect(mockOwnerRepository.save).not.toHaveBeenCalled();
    });

  });
});
