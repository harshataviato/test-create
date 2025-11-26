/**
 * @module controllers/ownerController
 * @description Handles HTTP requests related to Owner entities.
 * Provides endpoints for creating, finding, updating, and displaying owners.
 */

import { Request, Response, NextFunction, Router } from 'express';
import { z } from 'zod';
import { OwnerService } from '@services/ownerService';
import { Owner } from '@models/owner';
import { ownerSchema } from '@utils/validator';

// Initialize OwnerService
const ownerService = new OwnerService();
const router = Router();

/**
 * @function getOwnerById
 * @description Middleware to fetch an owner by ID and attach it to the request object.
 * This acts as a similar function to Spring's @ModelAttribute method that finds the entity.
 * If ownerId is present in path, fetches the owner, otherwise initializes a new Owner.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @param {string} ownerId - The ID of the owner to fetch.
 */
router.param('ownerId', (req: Request, res: Response, next: NextFunction, ownerId: string) => {
  const id = parseInt(ownerId, 10);
  if (isNaN(id)) {
    // If ownerId is not a number, it might be a 'new' string for create form.
    // In Spring, a null ownerId might mean a new owner. We handle this explicitly
    // in initCreationForm and initFindForm for clarity.
    return next(); // Skip param logic if not a valid ID
  }

  const owner = ownerService.findById(id);
  if (!owner) {
    req.flash('error', req.__('Owner not found with id: {{id}}', { id: ownerId }));
    return res.redirect('/owners/find'); // Redirect or show error if not found
  }
  (req as any).owner = owner; // Attach owner to request for subsequent middleware/handlers
  next();
});

/**
 * GET /owners/new
 * @description Displays the form for creating a new owner.
 * Sets the active menu item to 'owners'.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/new', (req: Request, res: Response) => {
  res.render('owners/createOrUpdateOwnerForm', {
    owner: { isNew: true }, // Indicate it's a new owner for the template
    menu: 'owners'
  });
});

/**
 * POST /owners/new
 * @description Processes the form submission for creating a new owner.
 * Validates the input, saves the owner, and redirects to the owner details page on success.
 * Renders the form again with errors if validation fails.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.post('/new', (req: Request, res: Response) => {
  const result = ownerSchema.safeParse(req.body);

  if (!result.success) {
    // Collect validation errors and prepare for re-rendering the form
    const errors: { [key: string]: string[] } = {};
    result.error.issues.forEach(issue => {
      if (issue.path.length > 0) {
        const fieldName = issue.path[0];
        if (!errors[fieldName]) {
          errors[fieldName] = [];
        }
        errors[fieldName].push(issue.message);
      }
    });

    req.flash('error', req.__('There was an error in creating the owner.'));
    return res.render('owners/createOrUpdateOwnerForm', {
      owner: { ...req.body, isNew: true }, // Repopulate form with submitted data
      errors, // Pass errors to the template
      menu: 'owners'
    });
  }

  const newOwner: Owner = {
    id: undefined, // ID will be assigned by the service
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    address: result.data.address,
    city: result.data.city,
    telephone: result.data.telephone,
    pets: [], // New owners start with no pets
    isNew: true
  };

  const savedOwner = ownerService.save(newOwner);
  req.flash('message', req.__('New Owner Created'));
  res.redirect(`/owners/${savedOwner.id}`);
});

/**
 * GET /owners/find
 * @description Displays the form for finding owners by last name.
 * Initializes a new Owner object for the form.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/find', (req: Request, res: Response) => {
  res.render('owners/findOwners', { owner: { lastName: '' }, menu: 'owners' });
});

/**
 * GET /owners
 * @description Processes the owner search form.
 * Finds owners by last name (or all if last name is empty) with pagination.
 * Redirects to owner details if exactly one owner is found.
 * Renders a list of owners if multiple are found, or the find form with an error if none are found.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/', (req: Request, res: Response) => {
  const lastName: string = (req.query.lastName as string || '').trim();
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = 5;

  const ownersResults = ownerService.findByLastNameStartingWith(lastName, page, pageSize);

  if (ownersResults.length === 0) {
    // No owners found
    const errors: { [key: string]: string[] } = { lastName: [req.__('notFound')] };
    return res.render('owners/findOwners', { owner: { lastName }, errors, menu: 'owners' });
  }

  if (ownersResults.length === 1 && !req.query.page) { // Only redirect if not explicitly paginating
    // Exactly one owner found, redirect to their details page
    return res.redirect(`/owners/${ownersResults[0].id}`);
  }

  // Multiple owners found or explicit pagination
  const totalItems = ownerService.countByLastNameStartingWith(lastName);
  const totalPages = Math.ceil(totalItems / pageSize);

  res.render('owners/ownersList', {
    listOwners: ownersResults,
    currentPage: page,
    totalPages,
    totalItems,
    menu: 'owners'
  });
});

/**
 * GET /owners/:ownerId/edit
 * @description Displays the form for updating an existing owner.
 * Fetches the owner details and populates the form.
 * @param {Request} req - The Express request object, expected to have `owner` attached by `router.param`.
 * @param {Response} res - The Express response object.
 */
router.get('/:ownerId/edit', (req: Request, res: Response) => {
  const owner = (req as any).owner; // Owner is attached by the router.param middleware
  if (!owner) {
    req.flash('error', req.__('Owner not found.'));
    return res.redirect('/owners/find');
  }
  res.render('owners/createOrUpdateOwnerForm', { owner, menu: 'owners' });
});

/**
 * POST /owners/:ownerId/edit
 * @description Processes the form submission for updating an existing owner.
 * Validates the input, updates the owner, and redirects to the owner details page on success.
 * Renders the form again with errors if validation fails.
 * @param {Request} req - The Express request object, expected to have `owner` attached.
 * @param {Response} res - The Express response object.
 */
router.post('/:ownerId/edit', (req: Request, res: Response) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const existingOwner = (req as any).owner as Owner; // Owner fetched by router.param

  if (!existingOwner) {
    req.flash('error', req.__('Owner not found for update.'));
    return res.redirect('/owners/find');
  }

  const result = ownerSchema.safeParse(req.body);

  if (!result.success) {
    const errors: { [key: string]: string[] } = {};
    result.error.issues.forEach(issue => {
      if (issue.path.length > 0) {
        const fieldName = issue.path[0];
        if (!errors[fieldName]) {
          errors[fieldName] = [];
        }
        errors[fieldName].push(issue.message);
      }
    });

    req.flash('error', req.__('There was an error in updating the owner.'));
    return res.render('owners/createOrUpdateOwnerForm', {
      owner: { ...req.body, id: ownerId, isNew: false }, // Repopulate with submitted data
      errors,
      menu: 'owners'
    });
  }

  const updatedOwner: Owner = {
    ...existingOwner, // Keep existing properties like pets
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    address: result.data.address,
    city: result.data.city,
    telephone: result.data.telephone,
    isNew: false // Explicitly set to false for existing entity
  };

  // Ensure the ID from the path is used
  updatedOwner.id = ownerId;

  ownerService.save(updatedOwner);
  req.flash('message', req.__('Owner Values Updated'));
  res.redirect(`/owners/${ownerId}`);
});

/**
 * GET /owners/:ownerId
 * @description Displays the detailed information for a single owner, including their pets and visits.
 * @param {Request} req - The Express request object, expected to have `owner` attached.
 * @param {Response} res - The Express response object.
 */
router.get('/:ownerId', (req: Request, res: Response) => {
  const owner = (req as any).owner; // Owner is attached by the router.param middleware
  if (!owner) {
    // This case should ideally be caught by router.param, but good for defensive programming
    req.flash('error', req.__('Owner not found.'));
    return res.redirect('/owners/find');
  }
  res.render('owners/ownerDetails', { owner, menu: 'owners' });
});

export default router;
