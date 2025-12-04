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

// This file is a conceptual TypeScript equivalent of PetClinicApplication.java.
// It serves as the main entry point for a Node.js/TypeScript application,
// specifically demonstrating how an Express.js server might be bootstrapped.
//
// @SpringBootApplication is replaced by standard Node.js/Express.js setup.
// @ImportRuntimeHints(PetClinicRuntimeHints.class) is a Spring Native specific annotation;
// its conceptual equivalent would involve build-time configuration or separate scripts (as discussed in Batch 16).

import express, { Express, Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import i18n from '../i18n'; // Assuming i18n setup from Batch 14 layout example
import { i18nMiddleware } from 'i18next-http-middleware';
import * as path from 'path'; // For serving static files
import { PetClinicRuntimeHints } from '../main/config/PetClinicRuntimeHints'; // Conceptual hints from Batch 16

// Load environment variables from .env file
dotenv.config();

// --- Conceptual Application Setup ---
// In a real application, you would have your controllers, services, and repositories here.
// For this conceptual example, we'll use simple mock endpoints.

// Mock data and repository/service interfaces (reused from tests for consistency)
interface NamedEntity { id?: number; name: string; }
interface PetType extends NamedEntity {}
interface Visit { id?: number; date: string; description: string; petId?: number; }
interface Pet extends NamedEntity { birthDate?: string; type?: PetType; ownerId?: number; visits?: Visit[]; }
interface Owner extends NamedEntity { firstName: string; lastName: string; address: string; city: string; telephone: string; pets?: Pet[]; }

// Dummy Data (replace with actual database integration)
const mockOwners: Owner[] = [
  { id: 1, firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023', pets: [
    { id: 1, name: 'Leo', birthDate: '2000-09-07', type: { id: 1, name: 'cat' }, visits: [{ id: 1, date: '2013-01-01', description: 'rabies shot' }] }
  ]},
  { id: 2, firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749', pets: [
    { id: 2, name: 'Basil', birthDate: '2002-08-06', type: { id: 6, name: 'hamster' } }
  ]}
];
const mockVets = [
  { id: 1, firstName: 'James', lastName: 'Carter', specialties: [] },
  { id: 2, firstName: 'Helen', lastName: 'Leary', specialties: [{ id: 2, name: 'surgery' }] }
];
const mockPetTypes: PetType[] = [
  { id: 1, name: 'cat' }, { id: 2, name: 'dog' }, { id: 3, name: 'lizard' },
  { id: 4, name: 'snake' }, { id: 5, name: 'bird' }, { id: 6, name: 'hamster' }
];


// --- Express Application Instance ---
const app: Express = express();

// --- Configuration and Middleware ---

// i18n middleware (using i18next-http-middleware)
app.use(i18nMiddleware.handle(i18n)); // This should come before any routes that need translation

// Serve static assets (CSS, JS, images, fonts)
// In a full conversion, this would serve compiled CSS from `src/main/scss` and potentially bundled JS from a frontend build.
// `static/resources` in Spring maps to `/resources` path
app.use('/resources', express.static(path.join(__dirname, 'resources')));
app.use('/webjars', express.static(path.join(__dirname, '../../node_modules'))); // Serve node_modules for webjars

// Body parsers for form submissions
app.use(express.urlencoded({ extended: true })); // For HTML form submissions
app.use(express.json()); // For API JSON requests

// Set up a conceptual templating engine (e.g., EJS for simple HTML rendering)
// For a full React app, this would be a custom SSR setup or not used if it's a SPA.
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs'); // Using EJS as a generic templating engine example

// --- Routes/Controllers ---

// Home Page
app.get('/', (req: Request, res: Response) => {
  res.render('welcome', { // Render conceptual welcome.html
    t: req.t, // Pass translation function to template
    activeMenu: 'home',
    message: req.query.message // Example of flash message from query
  });
});

// Vets List (conceptual rendering)
app.get('/vets.html', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const size = 10; // Fixed page size
  const start = (page - 1) * size;
  const end = start + size;
  const paginatedVets = mockVets.slice(start, end);
  const totalPages = Math.ceil(mockVets.length / size);

  res.render('vets/vetList', {
    t: req.t,
    activeMenu: 'vets',
    listVets: paginatedVets,
    currentPage: page,
    totalPages: totalPages,
  });
});

// Owners Find Form
app.get('/owners/find', (req: Request, res: Response) => {
  res.render('owners/findOwners', {
    t: req.t,
    activeMenu: 'owners',
    owner: {}, // Empty owner for the form
    error: req.query.error // Example of error from query
  });
});

// Owners List (Search Results)
app.get('/owners', (req: Request, res: Response) => {
  const lastName = (req.query.lastName as string || '').toLowerCase();
  const page = parseInt(req.query.query as string || '1', 10); // Use 'query' for page to avoid conflict
  const size = 10;

  let filteredOwners = mockOwners.filter(owner =>
    owner.lastName.toLowerCase().startsWith(lastName)
  );

  if (filteredOwners.length === 0) {
    return res.render('owners/findOwners', {
      t: req.t,
      activeMenu: 'owners',
      owner: { lastName: req.query.lastName },
      error: 'notFound' // Simulate notFound error
    });
  }

  if (filteredOwners.length === 1 && !req.query.query) { // If only one owner found and not explicitly paginating
    return res.redirect(`/owners/${filteredOwners[0].id}`);
  }

  const start = (page - 1) * size;
  const end = start + size;
  const paginatedOwners = filteredOwners.slice(start, end);
  const totalPages = Math.ceil(filteredOwners.length / size);

  res.render('owners/ownersList', {
    t: req.t,
    activeMenu: 'owners',
    listOwners: paginatedOwners,
    currentPage: page,
    totalPages: totalPages,
  });
});

// Owner Details
app.get('/owners/:ownerId', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const owner = mockOwners.find(o => o.id === ownerId);

  if (!owner) {
    return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });
  }

  res.render('owners/ownerDetails', {
    t: req.t,
    activeMenu: 'owners',
    owner: owner,
    message: req.query.message, // Example of flash message
    error: req.query.error
  });
});

// Add/Update Owner Form
app.get('/owners/new', (req: Request, res: Response) => {
  res.render('owners/createOrUpdateOwnerForm', {
    t: req.t,
    activeMenu: 'owners',
    isNew: true,
    owner: {} // Empty owner object
  });
});
app.post('/owners/new', (req: Request, res: Response) => {
  // Simple mock for saving new owner
  const newOwner: Owner = { id: Math.max(...mockOwners.map(o => o.id || 0), 0) + 1, pets: [], ...req.body };
  mockOwners.push(newOwner);
  res.redirect(`/owners/${newOwner.id}?message=Owner added successfully!`);
});

app.get('/owners/:ownerId/edit', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const owner = mockOwners.find(o => o.id === ownerId);
  if (!owner) {
    return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });
  }
  res.render('owners/createOrUpdateOwnerForm', {
    t: req.t,
    activeMenu: 'owners',
    isNew: false,
    owner: owner
  });
});
app.post('/owners/:ownerId/edit', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const ownerIndex = mockOwners.findIndex(o => o.id === ownerId);
  if (ownerIndex === -1) {
    return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });
  }
  // Simulate ID mismatch handling
  if (req.body.id && parseInt(req.body.id, 10) !== ownerId) {
    return res.redirect(`/owners/${ownerId}/edit?error=idMismatch`);
  }

  // Simple mock for updating owner
  Object.assign(mockOwners[ownerIndex], req.body);
  res.redirect(`/owners/${ownerId}?message=Owner updated successfully!`);
});


// Pet creation form
app.get('/owners/:ownerId/pets/new', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const owner = mockOwners.find(o => o.id === ownerId);
  if (!owner) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });

  res.render('pets/createOrUpdatePetForm', {
    t: req.t,
    activeMenu: 'owners',
    isNew: true,
    owner: owner,
    pet: {},
    petTypes: mockPetTypes
  });
});
app.post('/owners/:ownerId/pets/new', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const owner = mockOwners.find(o => o.id === ownerId);
  if (!owner) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });

  const newPet: Pet = { id: Math.max(...(owner.pets || []).map(p => p.id || 0), 0) + 1, ...req.body, ownerId: ownerId, visits: [] };
  if (!owner.pets) owner.pets = [];
  owner.pets.push(newPet);
  res.redirect(`/owners/${ownerId}?message=Pet added successfully!`);
});

// Pet edit form
app.get('/owners/:ownerId/pets/:petId/edit', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const petId = parseInt(req.params.petId, 10);
  const owner = mockOwners.find(o => o.id === ownerId);
  if (!owner) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });
  const pet = (owner.pets || []).find(p => p.id === petId);
  if (!pet) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });

  res.render('pets/createOrUpdatePetForm', {
    t: req.t,
    activeMenu: 'owners',
    isNew: false,
    owner: owner,
    pet: pet,
    petTypes: mockPetTypes
  });
});
app.post('/owners/:ownerId/pets/:petId/edit', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const petId = parseInt(req.params.petId, 10);
  const owner = mockOwners.find(o => o.id === ownerId);
  if (!owner) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });
  const petIndex = (owner.pets || []).findIndex(p => p.id === petId);
  if (petIndex === -1) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });

  Object.assign(owner.pets![petIndex], req.body);
  res.redirect(`/owners/${ownerId}?message=Pet updated successfully!`);
});


// Visit creation form
app.get('/owners/:ownerId/pets/:petId/visits/new', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const petId = parseInt(req.params.petId, 10);
  const owner = mockOwners.find(o => o.id === ownerId);
  if (!owner) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });
  const pet = (owner.pets || []).find(p => p.id === petId);
  if (!pet) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });

  res.render('pets/createOrUpdateVisitForm', {
    t: req.t,
    activeMenu: 'owners',
    isNew: true,
    owner: owner,
    pet: pet,
    visit: {}
  });
});
app.post('/owners/:ownerId/pets/:petId/visits/new', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const petId = parseInt(req.params.petId, 10);
  const owner = mockOwners.find(o => o.id === ownerId);
  if (!owner) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });
  const pet = (owner.pets || []).find(p => p.id === petId);
  if (!pet) return res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });

  const newVisit: Visit = { id: Math.max(...(pet.visits || []).map(v => v.id || 0), 0) + 1, ...req.body, petId: petId };
  if (!pet.visits) pet.visits = [];
  pet.visits.push(newVisit);
  res.redirect(`/owners/${ownerId}?message=Visit added successfully!`);
});


// Error Page route (for direct access or fallback)
app.get('/oups', (req: Request, res: Response) => {
  res.status(500).render('error', {
    t: req.t,
    status: 500,
    message: 'Expected: controller used to showcase what happens when an exception is thrown',
  });
});

// Generic 404 fallback
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).render('error', { t: req.t, status: 404, message: req.t('error.404') });
});

// Error handling middleware (mimics Spring Boot's error handling for consistency)
// This must be the last middleware added.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR]', err);
  const status = (err as any).status || 500; // Get status from error or default to 500
  res.status(status).render('error', {
    t: req.t,
    status: status,
    message: process.env.NODE_ENV === 'development' ? err.message : req.t('error.general'),
  });
});

/**
 * Main function to start the PetClinic Node.js application.
 */
export const startApplication = async (): Promise<void> => {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`PetClinic Node.js Application listening on port ${port}`);
    console.log(`Access at http://localhost:${port}`);
    // Optionally apply runtime hints if this were a native-compiled Node.js app
    // PetClinicRuntimeHints.applyBuildHints(); // This would be a build-time step conceptually
  });
};

// If this script is run directly, start the application
if (require.main === module) {
  startApplication().catch(console.error);
}
