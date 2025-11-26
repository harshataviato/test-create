/**
 * @module controllers/visitController
 * @description Handles HTTP requests related to Visit entities.
 * Provides endpoints for creating visits for a specific pet of an owner.
 */

import { Request, Response, NextFunction, Router } from 'express';
import { OwnerService } from '@services/ownerService';
import { PetService } from '@services/petService';
import { Visit } from '@models/visit';
import { Owner } from '@models/owner';
import { Pet } from '@models/pet';
import { visitSchema } from '@utils/validator';
import { formatDateToYYYYMMDD } from '@utils/formatter';

// Initialize services
const ownerService = new OwnerService();
const petService = new PetService(); // Use petService for pet-related operations

const router = Router({ mergeParams: true }); // Merge params from parent router (/owners/:ownerId/pets/:petId)

/**
 * @function loadPetWithVisit
 * @description Middleware to load the owner and pet, and create a new visit instance.
 * Analogous to Spring's @ModelAttribute("visit") Visit loadPetWithVisit(...)
 * Attaches owner, pet, and a new visit object to `res.locals` for use in templates and subsequent middleware.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
router.use((req: Request, res: Response, next: NextFunction) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const petId = parseInt(req.params.petId, 10);

  const owner = ownerService.findById(ownerId);
  if (!owner) {
    req.flash('error', req.__('Owner not found with id: {{id}}', { id: ownerId }));
    return res.redirect('/owners/find');
  }

  const pet = petService.findPetByIdForOwner(owner.id!, petId);
  if (!pet) {
    req.flash('error', req.__('Pet with id {{petId}} not found for owner with id {{ownerId}}.', { petId, ownerId }));
    return res.redirect(`/owners/${owner.id}`);
  }

  // Attach owner and pet to res.locals for template and subsequent use
  res.locals.owner = owner;
  res.locals.pet = { ...pet, birthDate: formatDateToYYYYMMDD(pet.birthDate) }; // Format birthdate for display

  // Create a new Visit instance for the form
  const visit: Visit = {
    id: undefined, // ID will be assigned by the service
    date: new Date(), // Default to current date
    description: '',
    petId: pet.id!,
    isNew: true
  };
  res.locals.visit = visit;

  next();
});

/**
 * GET /owners/:ownerId/pets/:petId/visits/new
 * @description Displays the form for adding a new visit to a pet.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/new', (req: Request, res: Response) => {
  // owner, pet, and visit are already available in res.locals from middleware
  res.render('pets/createOrUpdateVisitForm', {
    owner: res.locals.owner,
    pet: res.locals.pet,
    visit: res.locals.visit,
    menu: 'owners'
  });
});

/**
 * POST /owners/:ownerId/pets/:petId/visits/new
 * @description Processes the form submission for creating a new visit.
 * Validates the input, adds the visit to the pet, and redirects to owner details on success.
 * Renders the form again with errors if validation fails.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.post('/new', (req: Request, res: Response) => {
  const owner: Owner = res.locals.owner;
  const pet: Pet = res.locals.pet;
  const visitData = req.body;
  visitData.petId = pet.id; // Ensure visit is linked to the current pet

  const result = visitSchema.safeParse(visitData);

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

    req.flash('error', req.__('There was an error in booking the visit.'));
    return res.render('pets/createOrUpdateVisitForm', {
      owner,
      pet,
      visit: { ...visitData, isNew: true },
      errors,
      menu: 'owners'
    });
  }

  const newVisit: Visit = {
    id: undefined, // Will be assigned by service
    date: new Date(result.data.date), // Convert string to Date object
    description: result.data.description,
    petId: pet.id!,
    isNew: true
  };

  petService.addVisitToPet(owner.id!, pet.id!, newVisit);
  req.flash('message', req.__('Your visit has been booked'));
  res.redirect(`/owners/${owner.id}`);
});

export default router;
