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

// This file is a TypeScript adaptation of VetControllerTests.java.
// It uses Jest for testing and Supertest for making HTTP requests
// against a conceptual Express.js application representing the PetClinic backend.

import request from 'supertest';
import express, { Application, Router } from 'express';
import { jest } from '@jest/globals';

// --- Conceptual Model Definitions (from Batch 3 and VetTests.ts) ---
interface Specialty {
  id?: number;
  name: string;
}

interface Vet {
  id?: number;
  firstName: string;
  lastName: string;
  specialties: Specialty[];
}
// --- End Conceptual Model Definitions ---

// --- Conceptual Repository and Controller ---

// Mock `VetRepository` for Jest
interface VetRepository {
  findAll(): Promise<Vet[]>;
  findAllPaginated(page: number, size: number): Promise<{ content: Vet[], totalElements: number }>;
}

// Conceptual `VetController` as an Express Router
// In a real application, this would be your actual Express router.
const createVetController = (vetRepository: VetRepository): Router => {
  const router = express.Router();

  router.get('/vets.html', async (req, res) => {
    // This is for server-side rendered HTML. Mocking a simple response.
    // The original Spring test checked for model attributes and view name.
    // In Express with a templating engine (like EJS, Pug), you'd render.
    // Here, we just return a placeholder for the test.
    const page = parseInt(req.query.page as string || '1');
    const size = 10; // Assuming a default page size
    const paginatedVets = await vetRepository.findAllPaginated(page, size);
    res.status(200).send({
      template: 'vets/vetList', // Conceptual view name
      data: {
        listVets: paginatedVets.content,
        currentPage: page,
        totalPages: Math.ceil(paginatedVets.totalElements / size)
      }
    });
  });

  router.get('/vets', async (req, res) => {
    // This is for a REST API endpoint returning JSON.
    const vets = await vetRepository.findAll();
    res.status(200).json({ vetList: vets });
  });

  return router;
};
// --- End Conceptual Repository and Controller ---

describe('VetControllerTests', () => {
  let app: Application;
  let mockVetRepository: jest.Mocked<VetRepository>;

  const james: Vet = { id: 1, firstName: 'James', lastName: 'Carter', specialties: [] };
  const helen: Vet = {
    id: 2,
    firstName: 'Helen',
    lastName: 'Leary',
    specialties: [{ id: 1, name: 'radiology' }],
  };

  beforeEach(() => {
    // Mimic @MockitoBean
    mockVetRepository = {
      findAll: jest.fn<() => Promise<Vet[]>>(),
      findAllPaginated: jest.fn<(_page: number, _size: number) => Promise<{ content: Vet[], totalElements: number }>>(),
    };

    // Mimic Mockito `given(...).willReturn(...)`
    mockVetRepository.findAll.mockResolvedValue([james, helen]);
    mockVetRepository.findAllPaginated.mockImplementation((page, size) => {
      // Simple pagination mock logic
      const allVets = [james, helen];
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const content = allVets.slice(startIndex, endIndex);
      const totalElements = allVets.length;
      return Promise.resolve({ content, totalElements });
    });

    // Setup Express app to use the conceptual controller
    app = express();
    app.use('/', createVetController(mockVetRepository));
  });

  // @DisabledInNativeImage and @DisabledInAotMode are Java-specific and omitted in TypeScript.

  it('should test showVetListHtml', async () => {
    const response = await request(app).get('/vets.html?page=1');

    expect(response.statusCode).toBe(200);
    // In Spring, we assert on model attributes and view name.
    // In a conceptual Express app, we'd check the rendered HTML content
    // or, as done here for simplicity, the conceptual JSON response indicating template data.
    expect(response.body.template).toBe('vets/vetList');
    expect(response.body.data.listVets).toEqual([james, helen]);
    expect(mockVetRepository.findAllPaginated).toHaveBeenCalledWith(1, 10);
  });

  it('should test showResourcesVetList (JSON API)', async () => {
    const response = await request(app)
      .get('/vets')
      .set('Accept', 'application/json'); // Mimic accept header

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/); // Assert JSON content type
    expect(response.body).toEqual({ vetList: [james, helen] }); // Assert full JSON response
    expect(response.body.vetList[0].id).toBe(1); // Assert specific JSON path value
    expect(mockVetRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
