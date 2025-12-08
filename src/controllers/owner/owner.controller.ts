/**
 * @module controllers/owner/owner.controller
 * @description
 * Handles HTTP requests related to Owner entities.
 * Provides endpoints for listing, finding, creating, updating, and displaying owner details.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Owner } from '../../models/owner/owner.entity';
import { OwnerRepository } from '../../repositories/owner.repository';
import { appConfig } from '../../config/app.config';
import { paginationService } from '../../services/pagination.service';
import { formatValidationErrors } from '../../utils/constants';

const router = Router();
const VIEWS_OWNER_CREATE_OR_UPDATE_FORM = 'owners/createOrUpdateOwnerForm';

/**
 * Middleware to find an owner by ID and attach it to the request locals.
 * This mimics Spring's @ModelAttribute behavior for path variables.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
const findOwnerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  if (isNaN(ownerId)) {
    // If ownerId is not a valid number, create a new owner instance.
    // This handles the '/owners/new' case where no ownerId is present.
    res.locals.owner = new Owner();
    return next();
  }

  try {
    const owner = await OwnerRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      // If owner not found, set an error message and redirect or throw an error.
      // For consistency with Java, throwing an error is fine.
      throw new Error(`Owner not found with id: ${ownerId}. Please ensure the ID is correct and the owner exists in the database.`);
    }
    res.locals.owner = owner;
    next();
  } catch (error) {
    next(error); // Pass error to the error handling middleware
  }
};

/**
 * GET /owners/new
 * Displays the form to create a new owner.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/new', (req: Request, res: Response) => {
  // An empty owner object is already available via findOwnerMiddleware
  res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner: res.locals.owner, menu: 'owners' });
});

/**
 * POST /owners/new
 * Processes the form submission for creating a new owner.
 * Validates input and saves the owner to the database.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
router.post('/new', async (req: Request, res: Response, next: NextFunction) => {
  const owner = plainToInstance(Owner, req.body);

  // Perform validation using class-validator
  const errors = await validate(owner);
  if (errors.length > 0) {
    // If validation fails, render the form again with error messages
    (req.session as any).error = formatValidationErrors(errors); // Store error in session for flash message
    return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner, menu: 'owners', errors: errors });
  }

  try {
    await OwnerRepository.save(owner);
    (req.session as any).message = 'New Owner Created'; // Flash message
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    next(error); // Pass database error to the error handling middleware
  }
});

/**
 * GET /owners/find
 * Displays the owner search form.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/find', (req: Request, res: Response) => {
  res.render('owners/findOwners', { owner: new Owner(), menu: 'owners' });
});

/**
 * GET /owners
 * Processes the owner search form, finds owners by last name, and displays results.
 * Supports pagination.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string || '1', 10);
  let lastName = req.query.lastName as string || '';

  // If no last name is provided, search for all owners (empty string signifies broadest search)
  if (!lastName) {
    lastName = '';
  }

  try {
    const { items, totalItems, totalPages, currentPage } = await paginationService.findPaginated(
      OwnerRepository,
      page,
      appConfig.pageSize,
      { lastName: lastName } // Search criteria
    );

    if (items.length === 0) {
      // No owners found, display an error on the search form
      (req.session as any).error = req.t('notFound', { field: req.t('lastName') }); // Using i18n
      return res.render('owners/findOwners', { owner: { lastName: lastName }, menu: 'owners' });
    }

    if (items.length === 1 && !lastName) {
      // If exactly one owner is found without a specific search query, redirect to their details page
      res.redirect(`/owners/${items[0].id}`);
    } else {
      // Multiple owners found or one owner found via search, display the list
      res.render('owners/ownersList', {
        listOwners: items,
        totalItems,
        totalPages,
        currentPage,
        menu: 'owners',
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /owners/:ownerId/edit
 * Displays the form to update an existing owner.
 * Uses findOwnerMiddleware to load the owner.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/:ownerId/edit', findOwnerMiddleware, (req: Request, res: Response) => {
  res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner: res.locals.owner, menu: 'owners' });
});

/**
 * POST /owners/:ownerId/edit
 * Processes the form submission for updating an existing owner.
 * Validates input and saves changes to the database.
 * Uses findOwnerMiddleware to load the owner.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
router.post('/:ownerId/edit', findOwnerMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const existingOwner = res.locals.owner as Owner; // Owner loaded by middleware

  if (existingOwner.id !== ownerId) {
    // This should ideally not happen if routing is correct, but as a safeguard
    (req.session as any).error = 'Owner ID mismatch. Please try again.';
    return res.redirect(`/owners/${ownerId}/edit`);
  }

  // Update existing owner with new data from the form
  Object.assign(existingOwner, req.body);

  // Perform validation
  const errors = await validate(existingOwner);
  if (errors.length > 0) {
    (req.session as any).error = formatValidationErrors(errors);
    return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, { owner: existingOwner, menu: 'owners', errors: errors });
  }

  try {
    await OwnerRepository.save(existingOwner);
    (req.session as any).message = 'Owner Values Updated';
    res.redirect(`/owners/${ownerId}`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /owners/:ownerId
 * Displays the details of a single owner, including their pets and visits.
 * Uses findOwnerMiddleware to load the owner.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
router.get('/:ownerId', findOwnerMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // The owner is already loaded by findOwnerMiddleware and available in res.locals.owner
    const owner = res.locals.owner as Owner;
    res.render('owners/ownerDetails', { owner, menu: 'owners' });
  } catch (error) {
    next(error);
  }
});

export default router;
