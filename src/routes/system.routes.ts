/**
 * @module routes/system.routes
 * @description Defines system-related routes, such as welcome and crash pages.
 *              Mimics Spring's `WelcomeController.java` and `CrashController.java`.
 */

import { Router } from 'express';
import { welcomeController } from '@controllers/system/WelcomeController';
import { crashController } from '@controllers/system/CrashController';

const systemRouter = Router();

/**
 * Welcome Page Route
 * Corresponds to WelcomeController.java
 */
systemRouter.get('/', welcomeController.welcome);

/**
 * Crash Page Route
 * Corresponds to CrashController.java
 */
systemRouter.get('/oups', crashController.triggerException);

export default systemRouter;
