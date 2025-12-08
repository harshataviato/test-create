/**
 * @module routes/index
 * @description Aggregates and exports all application routes into a single Express Router.
 *              This acts as the central router for the entire application.
 */

import { Router } from 'express';
import ownerRoutes from './owner.routes';
import vetRoutes from './vet.routes';
import systemRoutes from './system.routes';

const router = Router();

/**
 * Register all specific feature routes.
 */
router.use('/', systemRoutes); // Mount system routes (e.g., welcome, error) at the root
router.use('/', ownerRoutes);  // Mount owner and pet/visit routes
router.use('/', vetRoutes);    // Mount vet routes

export default router;
