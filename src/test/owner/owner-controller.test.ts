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

// This file is a TypeScript adaptation of OwnerControllerTests.java.
// It uses Jest for testing and Supertest for making HTTP requests
// against a conceptual Express.js application representing the PetClinic backend.

import request from 'supertest';
import express, { Application, Router, Request, Response, NextFunction } from 'express';
import { jest } from '@jest/globals';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LocalDate } from '@js-joda/core'; // Replacement for Java's LocalDate

// --- Conceptual Model Definitions (from previous batches, adjusted) ---

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

class Visit {
  id?: number;
  date: string = LocalDate.now().toString(); // Default to current date string
  description: string = '';
  petId?: number; // Added to link to pet

  constructor(date: string = LocalDate.now().toString(), description: string = '') {
    this.date = date;
    this.description = description;
  }
}

class Pet implements NamedEntity {
  id?: number;
  name: string = '';
  birthDate?: string; // Using string for simplicity, could be LocalDate from @js-joda
  type?: PetType;
  ownerId?: number; // Added to link to owner
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

  getPet(name: string, ignoreId?: number): Pet | undefined {
    return this.pets.find(pet => pet.name === name && pet.id !== ignoreId);
  }
}

// --- Conceptual Repository Interfaces ---
interface OwnerRepository {
  findById(id: number): Promise<Owner | undefined>;
  save(owner: Owner): Promise<Owner>;
  findByLastNameStartingWith(lastName: string, page: number, size: number): Promise<{ content: Owner[], totalElements: number }>;
}
// --- End Conceptual Definitions ---

// --- Conceptual Validation DTOs and Logic ---
class OwnerDto {
  firstName: string = '';
  lastName: string = '';
  address: string = '';
  city: string = '';
  telephone: string = '';

  static async validate(ownerDto: OwnerDto): Promise<Record<string, string>> {
    const errors: Record<string, string> = {};

    if (!ownerDto.firstName || ownerDto.firstName.trim() === '') errors.firstName = 'required';
    if (!ownerDto.lastName || ownerDto.lastName.trim() === '') errors.lastName = 'required';
    if (!ownerDto.address || ownerDto.address.trim() === '') errors.address = 'required';
    if (!ownerDto.city || ownerDto.city.trim() === '') errors.city = 'required';
    // Simple telephone validation (digits only, basic length)
    if (!ownerDto.telephone || !/^\d{10,}$/.test(ownerDto.telephone)) errors.telephone = 'invalid telephone';

    return errors;
  }
}

// Middleware to parse form data (Express built-in for urlencoded)
const urlencoded = express.urlencoded({ extended: true });

// --- Conceptual OwnerController as an Express Router ---
const createOwnerController = (ownerRepository: OwnerRepository): Router => {
  const router = express.Router();

  // Middleware to fetch owner if ID is present
  router.use(
    '/owners/:ownerId/:action?',
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.params.ownerId && req.params.ownerId !== 'new' && req.params.ownerId !== 'find') {
        const ownerId = parseInt(req.params.ownerId, 10);
        const owner = await ownerRepository.findById(ownerId);
        if (!owner) {
          return res.status(404).send('Owner not found');
        }
        res.locals.owner = owner; // Attach owner to res.locals
      }
      next();
    }
  );

  // GET /owners/new
  router.get('/owners/new', (req, res) => {
    res.status(200).json({
      template: 'owners/createOrUpdateOwnerForm',
      model: { owner: new Owner() } // Empty owner for the form
    });
  });

  // POST /owners/new
  router.post('/owners/new', urlencoded, async (req, res) => {
    const ownerDto = plainToInstance(OwnerDto, req.body);
    const validationErrors = await OwnerDto.validate(ownerDto);

    if (Object.keys(validationErrors).length > 0) {
      return res.status(200).json({
        template: 'owners/createOrUpdateOwnerForm',
        model: {
          owner: { ...new Owner(), ...ownerDto },
          errors: validationErrors,
          attributeErrors: { owner: validationErrors }, // Simplified for assertion
          attributeHasFieldErrors: (field: string) => !!validationErrors[field],
          attributeHasFieldErrorCode: (field: string, code: string) => validationErrors[field] === code,
        }
      });
    }

    const newOwner = new Owner();
    Object.assign(newOwner, ownerDto);
    // Assign a mock ID for new owner
    newOwner.id = Math.floor(Math.random() * 1000) + 100; // Simulate new ID
    await ownerRepository.save(newOwner);
    res.status(302).set('Location', `/owners/${newOwner.id}`).send();
  });

  // GET /owners/find
  router.get('/owners/find', (req, res) => {
    res.status(200).json({
      template: 'owners/findOwners',
      model: { owner: new Owner() }
    });
  });

  // GET /owners (search results)
  router.get('/owners', async (req, res) => {
    const lastName = (req.query.lastName as string || '').trim();
    const page = parseInt(req.query.page as string || '1');
    const size = 10; // Default page size

    const ownersPage = await ownerRepository.findByLastNameStartingWith(lastName, page, size);

    if (ownersPage.content.length === 0) {
      // Mimic Spring MVC error for 'notFound'
      return res.status(200).json({
        template: 'owners/findOwners',
        model: {
          owner: { lastName: lastName }, // Keep the search term
          errors: { lastName: 'notFound' },
          attributeHasFieldErrors: (field: string) => field === 'lastName',
          attributeHasFieldErrorCode: (field: string, code: string) => field === 'lastName' && code === 'notFound',
        }
      });
    }

    if (ownersPage.content.length === 1) {
      return res.status(302).set('Location', `/owners/${ownersPage.content[0].id}`).send();
    }

    // Multiple owners found
    res.status(200).json({
      template: 'owners/ownersList',
      model: {
        owners: ownersPage.content,
        currentPage: page,
        totalPages: Math.ceil(ownersPage.totalElements / size),
      }
    });
  });

  // GET /owners/{ownerId}/edit
  router.get('/owners/:ownerId/edit', (req, res) => {
    const owner = res.locals.owner as Owner;
    res.status(200).json({
      template: 'owners/createOrUpdateOwnerForm',
      model: { owner: owner }
    });
  });

  // POST /owners/{ownerId}/edit
  router.post('/owners/:ownerId/edit', urlencoded, async (req, res) => {
    const pathOwnerId = parseInt(req.params.ownerId, 10);
    const existingOwner = res.locals.owner as Owner; // Owner from middleware

    // Simulate `flashAttr` where owner object itself is passed
    // If owner ID in flashAttr (or body) doesn't match path variable, redirect.
    // For `supertest`, we simulate this by passing a different ID in the POST body or mocking `findById` behavior.
    const submittedOwnerData = req.body;
    if (submittedOwnerData.id && parseInt(submittedOwnerData.id, 10) !== pathOwnerId) {
      // This mimics the `testProcessUpdateOwnerFormWithIdMismatch` scenario.
      // In Express, you might redirect with a query param or set a session flash.
      return res.status(302).set('Location', `/owners/${pathOwnerId}/edit?error=idMismatch`).send();
    }

    const ownerDto = plainToInstance(OwnerDto, req.body);
    const validationErrors = await OwnerDto.validate(ownerDto);

    if (Object.keys(validationErrors).length > 0) {
      return res.status(200).json({
        template: 'owners/createOrUpdateOwnerForm',
        model: {
          owner: { ...existingOwner, ...ownerDto }, // Keep form data
          errors: validationErrors,
          attributeErrors: { owner: validationErrors },
          attributeHasFieldErrors: (field: string) => !!validationErrors[field],
          attributeHasFieldErrorCode: (field: string, code: string) => validationErrors[field] === code,
        }
      });
    }

    Object.assign(existingOwner, ownerDto); // Update existing owner
    await ownerRepository.save(existingOwner);
    res.status(302).set('Location', `/owners/${existingOwner.id}`).send();
  });

  // GET /owners/{ownerId}
  router.get('/owners/:ownerId', (req, res) => {
    const owner = res.locals.owner as Owner;
    res.status(200).json({
      template: 'owners/ownerDetails',
      model: { owner: owner }
    });
  });

  return router;
};
// --- End Conceptual OwnerController ---

describe('OwnerControllerTests', () => {
  const TEST_OWNER_ID = 1;

  let app: Application;
  let mockOwnerRepository: jest.Mocked<OwnerRepository>;

  const george: Owner = (() => {
    const owner = new Owner(TEST_OWNER_ID);
    owner.firstName = 'George';
    owner.lastName = 'Franklin';
    owner.address = '110 W. Liberty St.';
    owner.city = 'Madison';
    owner.telephone = '6085551023';
    const max = new Pet('Max');
    max.id = 1;
    max.type = new PetType('dog');
    max.birthDate = LocalDate.now().toString();
    owner.addPet(max);
    max.addVisit(new Visit(LocalDate.now().toString(), 'Routine checkup')); // Add a visit
    return owner;
  })();

  beforeEach(() => {
    mockOwnerRepository = {
      findById: jest.fn<(_id: number) => Promise<Owner | undefined>>(),
      save: jest.fn<(_owner: Owner) => Promise<Owner>>(),
      findByLastNameStartingWith: jest.fn<(_lastName: string, _page: number, _size: number) => Promise<{ content: Owner[], totalElements: number }>>(),
    };

    mockOwnerRepository.findById.mockImplementation(async (id) => {
      // Return a deep copy to prevent tests from modifying the original mock state
      if (id === TEST_OWNER_ID) {
        return JSON.parse(JSON.stringify(george));
      }
      return undefined;
    });
    mockOwnerRepository.save.mockImplementation(async (owner) => {
      // Simulate saving, assign an ID if it's new
      if (!owner.id) {
        owner.id = Math.floor(Math.random() * 1000) + 100;
      }
      return JSON.parse(JSON.stringify(owner));
    });
    mockOwnerRepository.findByLastNameStartingWith.mockImplementation(async (lastName, page, size) => {
      const allOwners = [JSON.parse(JSON.stringify(george))]; // Deep copy
      const filtered = allOwners.filter(o => o.lastName.startsWith(lastName));
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const content = filtered.slice(startIndex, endIndex);
      const totalElements = filtered.length;
      return { content, totalElements };
    });

    app = express();
    app.use(express.json()); // For handling JSON bodies if any (though forms are urlencoded here)
    app.use(urlencoded); // For POST form data
    app.use('/', createOwnerController(mockOwnerRepository));
  });

  // @DisabledInNativeImage and @DisabledInAotMode are Java-specific and omitted in TypeScript.

  it('should test initCreationForm', async () => {
    const response = await request(app).get('/owners/new');
    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('owners/createOrUpdateOwnerForm');
    expect(response.body.model.owner).toEqual(expect.objectContaining({ firstName: '', lastName: '' }));
  });

  it('should test processCreationFormSuccess', async () => {
    const newOwnerData = {
      firstName: 'Joe',
      lastName: 'Bloggs',
      address: '123 Caramel Street',
      city: 'London',
      telephone: '1316761638'
    };
    const response = await request(app).post('/owners/new').send(newOwnerData);
    expect(response.statusCode).toBe(302);
    expect(response.headers['location']).toMatch(/\/owners\/\d+/); // Redirect to new owner's page
    expect(mockOwnerRepository.save).toHaveBeenCalledTimes(1);
    expect(mockOwnerRepository.save.mock.calls[0][0]).toEqual(expect.objectContaining(newOwnerData));
  });

  it('should test processCreationFormHasErrors', async () => {
    const invalidOwnerData = {
      firstName: 'Joe',
      lastName: 'Bloggs',
      city: 'London'
      // Missing address, telephone
    };
    const response = await request(app).post('/owners/new').send(invalidOwnerData);
    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('owners/createOrUpdateOwnerForm');
    expect(response.body.model.attributeErrors.owner.address).toBe('required');
    expect(response.body.model.attributeErrors.owner.telephone).toBe('invalid telephone');
    expect(response.body.model.attributeHasFieldErrors('address')).toBe(true);
    expect(response.body.model.attributeHasFieldErrors('telephone')).toBe(true);
    expect(mockOwnerRepository.save).not.toHaveBeenCalled();
  });

  it('should test initFindForm', async () => {
    const response = await request(app).get('/owners/find');
    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('owners/findOwners');
    expect(response.body.model.owner).toEqual(expect.objectContaining({ firstName: '', lastName: '' }));
  });

  it('should test processFindFormSuccess (multiple owners)', async () => {
    // Mock for multiple owners to force ownersList view
    mockOwnerRepository.findByLastNameStartingWith.mockResolvedValueOnce({
      content: [JSON.parse(JSON.stringify(george)), { ...JSON.parse(JSON.stringify(george)), id: 2, firstName: 'Mary', lastName: 'Franklin' }],
      totalElements: 2
    });
    const response = await request(app).get('/owners?page=1');
    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('owners/ownersList');
    expect(response.body.model.owners).toHaveLength(2);
    expect(mockOwnerRepository.findByLastNameStartingWith).toHaveBeenCalledWith('', 1, 10);
  });

  it('should test processFindFormByLastName (single owner)', async () => {
    const response = await request(app).get('/owners?page=1&lastName=Franklin');
    expect(response.statusCode).toBe(302);
    expect(response.headers['location']).toBe(`/owners/${TEST_OWNER_ID}`);
    expect(mockOwnerRepository.findByLastNameStartingWith).toHaveBeenCalledWith('Franklin', 1, 10);
  });

  it('should test processFindFormNoOwnersFound', async () => {
    mockOwnerRepository.findByLastNameStartingWith.mockResolvedValueOnce({ content: [], totalElements: 0 });
    const response = await request(app).get('/owners?page=1&lastName=Unknown Surname');
    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('owners/findOwners');
    expect(response.body.model.attributeHasFieldErrors('lastName')).toBe(true);
    expect(response.body.model.attributeHasFieldErrorCode('lastName', 'notFound')).toBe(true);
  });

  it('should test initUpdateOwnerForm', async () => {
    const response = await request(app).get(`/owners/${TEST_OWNER_ID}/edit`);
    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('owners/createOrUpdateOwnerForm');
    expect(response.body.model.owner).toEqual(expect.objectContaining({
      lastName: 'Franklin',
      firstName: 'George',
      address: '110 W. Liberty St.',
      city: 'Madison',
      telephone: '6085551023'
    }));
  });

  it('should test processUpdateOwnerFormSuccess', async () => {
    const updatedOwnerData = {
      firstName: 'Joe',
      lastName: 'Bloggs',
      address: '123 Caramel Street',
      city: 'London',
      telephone: '1616291589'
    };
    const response = await request(app).post(`/owners/${TEST_OWNER_ID}/edit`).send(updatedOwnerData);
    expect(response.statusCode).toBe(302);
    expect(response.headers['location']).toBe(`/owners/${TEST_OWNER_ID}`);
    expect(mockOwnerRepository.save).toHaveBeenCalledTimes(1);
    expect(mockOwnerRepository.save.mock.calls[0][0]).toEqual(expect.objectContaining({ ...george, ...updatedOwnerData }));
  });

  it('should test processUpdateOwnerFormUnchangedSuccess', async () => {
    // Send no params, should still update successfully (no validation errors)
    const response = await request(app).post(`/owners/${TEST_OWNER_ID}/edit`).send({});
    expect(response.statusCode).toBe(302);
    expect(response.headers['location']).toBe(`/owners/${TEST_OWNER_ID}`);
    expect(mockOwnerRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should test processUpdateOwnerFormHasErrors', async () => {
    const invalidUpdateData = {
      firstName: 'Joe',
      lastName: 'Bloggs',
      address: '', // Blank address
      telephone: '' // Blank telephone
    };
    const response = await request(app).post(`/owners/${TEST_OWNER_ID}/edit`).send(invalidUpdateData);
    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('owners/createOrUpdateOwnerForm');
    expect(response.body.model.attributeErrors.owner.address).toBe('required');
    expect(response.body.model.attributeErrors.owner.telephone).toBe('invalid telephone');
    expect(mockOwnerRepository.save).not.toHaveBeenCalled();
  });

  it('should test showOwner', async () => {
    const response = await request(app).get(`/owners/${TEST_OWNER_ID}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.template).toBe('owners/ownerDetails');
    const owner = response.body.model.owner;
    expect(owner.lastName).toBe('Franklin');
    expect(owner.firstName).toBe('George');
    expect(owner.address).toBe('110 W. Liberty St.');
    expect(owner.city).toBe('Madison');
    expect(owner.telephone).toBe('6085551023');
    expect(owner.pets).not.toHaveLength(0); // Not empty
    expect(owner.pets[0].visits).toHaveLength(1); // Has a visit
  });

  it('should test processUpdateOwnerFormWithIdMismatch', async () => {
    const pathOwnerId = TEST_OWNER_ID; // 1
    const ownerWithDifferentId = { ...george, id: 2 }; // Submitted owner has ID 2

    // This scenario specifically tests if a submitted owner object's ID (e.g., in a hidden form field)
    // mismatches the ID in the path, leading to a redirect.
    // In Express, we simulate this by checking `req.body.id` against `req.params.ownerId`.
    const response = await request(app)
      .post(`/owners/${pathOwnerId}/edit`)
      .send({ ...ownerWithDifferentId, id: ownerWithDifferentId.id?.toString() }); // Send ID in body as string

    expect(response.statusCode).toBe(302);
    expect(response.headers['location']).toBe(`/owners/${pathOwnerId}/edit?error=idMismatch`);
    // Assert on potential flash attributes (simulated by query param 'error')
    expect(response.headers['location']).toContain('error=idMismatch');
  });

});
