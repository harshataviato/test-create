/**
 * @module controllers/owner/visit.controller
 * @description
 * Handles HTTP requests related to Visit entities, nested under a specific Pet and Owner.
 * Provides endpoints for adding new visits for a given pet.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Owner } from '../../models/owner/owner.entity';
import { Pet } from '../../models/owner/pet.entity';
import { Visit } from '../../models/owner/visit.entity';
import { OwnerRepository } from '../../repositories/owner.repository';
import { formatValidationErrors } from '../../utils/constants';

const router = Router({ mergeParams: true }); // Merge params from parent routers

/**
 * Middleware to load owner, pet, and prepare a new visit object.
 * Attaches these objects to `res.locals` for use in subsequent middleware or route handlers.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
const loadPetWithVisitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const petId = parseInt(req.params.petId, 10);

  try {
    // Fetch owner with pets and visits
    const owner = await OwnerRepository.findOne({
      where: { id: ownerId },
      relations: ['pets', 'pets.visits'], // Eagerly load pets and their visits
    });

    if (!owner) {
      throw new Error(`Owner not found with id: ${ownerId}. Please ensure the ID is correct.`);
    }

    const pet = owner.pets.find(p => p.id === petId);
    if (!pet) {
      throw new Error(`Pet with id ${petId} not found for owner with id ${ownerId}.`);
    }

    // Create a new Visit instance for the form
    const visit = new Visit();
    visit.date = new Date(); // Default to current date, mimicking Java's `LocalDate.now()`

    // Attach to res.locals
    res.locals.owner = owner;
    res.locals.pet = pet;
    res.locals.visit = visit; // This will be the form's target object

    next();
  } catch (error) {
    next(error); // Pass error to the error handling middleware
  }
};

/**
 * GET /owners/:ownerId/pets/:petId/visits/new
 * Displays the form to add a new visit for a specific pet.
 * Uses `loadPetWithVisitMiddleware` to prepare data.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/new', loadPetWithVisitMiddleware, (req: Request, res: Response) => {
  const { owner, pet, visit } = res.locals;
  res.render('pets/createOrUpdateVisitForm', { owner, pet, visit, menu: 'owners' });
});

/**
 * POST /owners/:ownerId/pets/:petId/visits/new
 * Processes the form submission for adding a new visit.
 * Validates input and saves the visit to the database.
 * Uses `loadPetWithVisitMiddleware` to prepare data.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
router.post('/new', loadPetWithVisitMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  const { owner, pet, visit } = res.locals; // Objects loaded by middleware

  // Map request body to the visit object
  Object.assign(visit, req.body);
  visit.date = new Date(req.body.date); // Ensure date is correctly parsed

  // Perform validation using class-validator
  const errors = await validate(visit);
  if (errors.length > 0) {
    // If validation fails, re-render the form with error messages
    (req.session as any).error = formatValidationErrors(errors);
    return res.render('pets/createOrUpdateVisitForm', { owner, pet, visit, menu: 'owners' });
  }

  try {
    // Add the new visit to the pet's visits collection
    pet.visits.push(visit);
    // Saving the owner will cascade and save the new visit
    await OwnerRepository.save(owner);
    (req.session as any).message = 'Your visit has been booked'; // Flash message
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    next(error); // Pass database error to the error handling middleware
  }
});

export default router;
