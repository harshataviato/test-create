/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a TypeScript adaptation of VisitControllerTests.java.
// It uses Jest for testing and Supertest for making HTTP requests
// against a conceptual Express.js application representing the PetClinic backend.

import request from 'supertest';
import express, { Application, Router, Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { LocalDate } from '@js-joda/core'; // Replacement for Java's LocalDate

// --- Conceptual Model Definitions (from previous batches) ---

interface NamedEntity {
  id?: number;
  name: string;
}

class Visit {
  id?: number;
  date: string = LocalDate.now().toString(); // Default to current date string
  description: string = '';
  petId?: number;

  constructor(date: string = LocalDate.now().toString(), description: string = '') {
    this.date = date;
    this.description = description;
  }
}

class Pet implements NamedEntity {
  id?: number;
  name: string = '';
  birthDate?: string;
  type?: any; // Assuming PetType structure is defined elsewhere
  ownerId?: number;
  visits: Visit[] = [];

  constructor(name: string = '') {
    this.name = name;
  }

  addVisit(visit: Visit): void {
    this.visits.push(visit);
    visit.petId = this.id;
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
    pet.ownerId = this.id;
  }

  getPetById(petId: number): Pet | undefined {
    return this.pets.find(p => p.id === petId);
  }
}

// --- Conceptual Repository Interfaces ---
interface OwnerRepository {
  findById(id: number): Promise<Owner | undefined>;
  save(owner: Owner): Promise<Owner>;
}
// --- End Conceptual Definitions ---

// --- Conceptual Validation DTOs and Logic ---
class VisitDto {
  date: string = LocalDate.now().toString();
  description: string = '';

  static async validate(visitDto: VisitDto): Promise<Record<string, string>> {
    const errors: Record<string, string> = {};

    // Simulate Spring's `@NotNull` for description
    if (!visitDto.description || visitDto.description.trim() === '') {
      errors.description = 'required';
    }

    // Simulate date validation
    if (!visitDto.date) {
      errors.date = 'required';
    } else {
      try {
        const parsedDate = LocalDate.parse(visitDto.date);
        // Additional checks could be for future dates, etc.
      } catch (e) {
        errors.date = 'invalid format'; // Simulating typeMismatch
      }
    }

    return errors;
  }
}

// Middleware to parse form data (Express built-in for urlencoded)
const urlencoded = express.urlencoded({ extended: true });

// --- Conceptual VisitController as an Express Router ---
const createVisitController = (ownerRepository: OwnerRepository): Router => {
  const router = express.Router();

  // Middleware to fetch owner and pet
  router.use(
    '/owners/:ownerId/pets/:petId/visits/:action?',
    async (req: Request, res: Response, next: NextFunction) => {
      const ownerId = parseInt(req.params.ownerId, 10);
      const petId = parseInt(req.params.petId, 10);

      const owner = await ownerRepository.findById(ownerId);
      if (!owner) {
        return res.status(404).send('Owner not found');
      }
      res.locals.owner = owner;

      const pet = owner.getPetById(petId);
      if (!pet) {
        return res.status(404).send('Pet not found');
      }
      res.locals.pet = pet;
      next();
    }
  );

  // GET /owners/{ownerId}/pets/{petId}/visits/new
  router.get('/owners/:ownerId/pets/:petId/visits/new', async (req, res) => {
    const owner = res.locals.owner as Owner;
    const pet = res.locals.pet as Pet;

    res.status(200).json({
      template: 'pets/createOrUpdateVisitForm',
      model: {
        owner: owner,
        pet: pet,
        visit: new Visit() // Empty visit for the form
      }
    });
  });

  // POST /owners/{ownerId}/pets/{petId}/visits/new
  router.post('/owners/:ownerId/pets/:petId/visits/new', urlencoded, async (req, res) => {
    const owner = res.locals.owner as Owner;
    const pet = res.locals.pet as Pet;
    const visitDto = plainToInstance(VisitDto, req.body);

    const validationErrors = await VisitDto.validate(visitDto);

    if (Object.keys(validationErrors).length > 0) {
      // Mimic Spring MVC errors structure for simplified assertion
      return res.status(200).json({
        template: 'pets/createOrUpdateVisitForm',
        model: {
          owner: owner,
          pet: pet,
          visit: { ...new Visit(), ...visitDto }, // Keep form data
          errors: validationErrors,
          attributeErrors: { visit: validationErrors }, // Simplified for assertion
          attributeHasErrors: (field: string) => !!validationErrors[field], // Function for assertion
        }
      });
    }

    const newVisit = new Visit(visitDto.date, visitDto.description.trim());
    pet.addVisit(newVisit); // Add visit to pet
    // Assign a mock ID for new visit
    newVisit.id = Math.floor(Math.random() * 1000) + 1000;

    await ownerRepository.save(owner); // Save owner (conceptually, saves pets and visits too)

    res.status(302).set('Location', `/owners/${owner.id}`).send(); // Redirect
  });

  return router;
};
// --- End Conceptual VisitController ---

describe('VisitControllerTests', () => {
  const TEST_OWNER_ID = 1;
  const TEST_PET_ID = 1;

  let app: Application;
  let mockOwnerRepository: jest.Mocked<OwnerRepository>;

  const ownerWithPet = (() => {
    const owner = new Owner(TEST_OWNER_ID);
    const pet = new Pet('Buddy');
    pet.id = TEST_PET_ID;
    owner.addPet(pet);
    return owner;
  })();

  beforeEach(() => {
    mockOwnerRepository = {
      findById: jest.fn<(_id: number) => Promise<Owner | undefined>>(),
      save: jest.fn<(_owner: Owner) => Promise<Owner>>(),
    };

    mockOwnerRepository.findById.mockImplementation(async (id) => {
      // Return a deep copy to prevent tests from modifying the original mock state
      if (id === TEST_OWNER_ID) {
        return JSON.parse(JSON.stringify(ownerWithPet));
      }
      return undefined;
    });
    mockOwnerRepository.save.mockImplementation(async (owner) => JSON.parse(JSON.stringify(owner)));

    app = express();
    app.use(urlencoded); // For POST form data
    app.use('/', createVisitController(mockOwnerRepository));
  });

  // @DisabledInNativeImage and @DisabledInAotMode are Java-specific and omitted in TypeScript.

  it('should test initNewVisitForm', async () => {
    const response = await request(app).get(`/owners/${TEST_OWNER_ID}/pets/${TEST_PET_ID}/visits/new`);

    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('pets/createOrUpdateVisitForm');
    expect(response.body.model.owner.id).toBe(TEST_OWNER_ID);
    expect(response.body.model.pet.id).toBe(TEST_PET_ID);
    expect(response.body.model.visit.description).toBe(''); // New empty visit
  });

  it('should test processNewVisitFormSuccess', async () => {
    const visitData = {
      date: '2023-01-15',
      description: 'Visit Description'
    };
    const response = await request(app)
      .post(`/owners/${TEST_OWNER_ID}/pets/${TEST_PET_ID}/visits/new`)
      .send(visitData);

    expect(response.statusCode).toBe(302);
    expect(response.headers['location']).toBe(`/owners/${TEST_OWNER_ID}`);
    expect(mockOwnerRepository.save).toHaveBeenCalledTimes(1);
    const savedOwner = mockOwnerRepository.save.mock.calls[0][0];
    const savedPet = savedOwner.getPetById(TEST_PET_ID);
    expect(savedPet?.visits).toHaveLength(1);
    expect(savedPet?.visits[0]).toEqual(expect.objectContaining({
      date: visitData.date,
      description: visitData.description
    }));
  });

  it('should test processNewVisitFormHasErrors (missing description)', async () => {
    const invalidVisitData = {
      date: '2023-01-15',
      // Missing description
    };
    const response = await request(app)
      .post(`/owners/${TEST_OWNER_ID}/pets/${TEST_PET_ID}/visits/new`)
      .send(invalidVisitData);

    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('pets/createOrUpdateVisitForm');
    expect(response.body.model.attributeErrors.visit.description).toBe('required');
    expect(response.body.model.attributeHasErrors('description')).toBe(true);
    expect(mockOwnerRepository.save).not.toHaveBeenCalled();
  });
});
