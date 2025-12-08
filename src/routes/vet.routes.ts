/**
 * @module routes/vet.routes
 * @description Defines API routes for `Vet` entities,
 *              mapping them to `VetController` methods.
 *              Mimics Spring's `VetController.java`.
 */

import { Router } from 'express';
import { vetController } from '@controllers/vet/VetController';

const vetRouter = Router();

/**
 * Vet Routes
 * Corresponds to VetController.java
 */
vetRouter.get('/vets.html', vetController.showVetListHtml); // HTML view with pagination
vetRouter.get('/vets', vetController.showResourcesVetList);   // JSON API endpoint for vets

export default vetRouter;
