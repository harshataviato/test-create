/**
 * @module controllers/petController
 * @description Handles HTTP requests related to Pet entities.
 * Provides endpoints for creating and updating pets for a specific owner.
 */

import { Request, Response, NextFunction, Router } from 'express';
import { PetService } from '@services/petService';
import { OwnerService } from '@services/ownerService';
import { PetTypeRepository } from '@repositories/petTypeRepository';
import { Pet } from '@models/pet';
import { Owner } from '@models/owner';
import { petSchema } from '@utils/validator';
import { PetType } from '@models/petType';
import { formatDateToYYYYMMDD } from '@utils/formatter';

// Initialize services and repositories
const ownerService = new OwnerService();
const petTypeRepository = new PetTypeRepository();
const petService = new PetService(); // Using petService for pet-specific operations

const router = Router({ mergeParams: true }); // Merge params from parent router (/owners/:ownerId)

/**
 * @function populatePetTypes
 * @description Middleware to populate pet types for forms.
 * Analogous to Spring's @ModelAttribute("types")
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
router.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.types = petTypeRepository.findAll();
  next();
});

/**
 * @function findOwner
 * @description Middleware to find the owner from the URL parameter.
 * Analogous to Spring's @ModelAttribute("owner") Owner findOwner(@PathVariable("ownerId") int ownerId)
 * Attaches the owner object to `res.locals` for use in templates and subsequent middleware.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
router.use((req: Request, res: Response, next: NextFunction) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  const owner = ownerService.findById(ownerId);
  if (!owner) {
    req.flash('error', req.__('Owner not found with id: {{id}}', { id: ownerId }));
    return res.redirect('/owners/find');
  }
  res.locals.owner = owner;
  next();
});

/**
 * @function findPet
 * @description Middleware to find the pet from the URL parameter, or create a new one.
 * Analogous to Spring's @ModelAttribute("pet") Pet findPet(...)
 * Attaches the pet object to `res.locals` for use in templates and subsequent middleware.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
router.use((req: Request, res: Response, next: NextFunction) => {
  const owner: Owner = res.locals.owner;
  const petId = parseInt(req.params.petId, 10);

  if (isNaN(petId)) {
    // If petId is not a number, it means we are creating a new pet.
    res.locals.pet = { isNew: true, ownerId: owner.id };
  } else {
    // We are editing an existing pet
    const pet = owner.pets.find(p => p.id === petId);
    if (!pet) {
      req.flash('error', req.__('Pet not found with id: {{petId}} for owner: {{ownerId}}', { petId: req.params.petId, ownerId: owner.id }));
      return res.redirect(`/owners/${owner.id}`);
    }
    res.locals.pet = { ...pet, isNew: false, birthDate: formatDateToYYYYMMDD(pet.birthDate) };
  }
  next();
});

/**
 * GET /owners/:ownerId/pets/new
 * @description Displays the form for adding a new pet to an owner.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/new', (req: Request, res: Response) => {
  // pet and owner are already available in res.locals from middleware
  res.render('pets/createOrUpdatePetForm', {
    owner: res.locals.owner,
    pet: res.locals.pet,
    types: res.locals.types,
    menu: 'owners'
  });
});

/**
 * POST /owners/:ownerId/pets/new
 * @description Processes the form submission for creating a new pet.
 * Validates the input, adds the pet to the owner, and redirects to owner details on success.
 * Renders the form again with errors if validation fails.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.post('/new', (req: Request, res: Response) => {
  const owner: Owner = res.locals.owner;
  const petData = req.body;
  petData.ownerId = owner.id; // Ensure pet is linked to the current owner

  const result = petSchema(owner).safeParse(petData); // Pass owner for duplicate name check

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

    req.flash('error', req.__('There was an error in adding the pet.'));
    return res.render('pets/createOrUpdatePetForm', {
      owner,
      pet: { ...petData, isNew: true },
      types: res.locals.types,
      errors,
      menu: 'owners'
    });
  }

  // Find the PetType object from the name
  const petType: PetType | undefined = petTypeRepository.findByName(result.data.type);
  if (!petType) {
    // This should ideally be caught by Zod schema if type is required and must exist
    // Adding a fallback error for robustness
    const errors: { [key: string]: string[] } = { type: [req.__('type not found: {{type}}', { type: result.data.type })] };
    req.flash('error', req.__('There was an error in adding the pet.'));
    return res.render('pets/createOrUpdatePetForm', {
      owner,
      pet: { ...petData, isNew: true },
      types: res.locals.types,
      errors,
      menu: 'owners'
    });
  }

  const newPet: Pet = {
    id: undefined, // Will be assigned by service
    name: result.data.name,
    birthDate: new Date(result.data.birthDate), // Convert string to Date object
    type: petType,
    ownerId: owner.id!,
    visits: [], // New pet starts with no visits
    isNew: true
  };

  petService.addPetToOwner(owner.id!, newPet);
  req.flash('message', req.__('New Pet has been Added'));
  res.redirect(`/owners/${owner.id}`);
});

/**
 * GET /owners/:ownerId/pets/:petId/edit
 * @description Displays the form for updating an existing pet.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/:petId/edit', (req: Request, res: Response) => {
  // pet and owner are already available in res.locals from middleware
  res.render('pets/createOrUpdatePetForm', {
    owner: res.locals.owner,
    pet: res.locals.pet,
    types: res.locals.types,
    menu: 'owners'
  });
});

/**
 * POST /owners/:ownerId/pets/:petId/edit
 * @description Processes the form submission for updating an existing pet.
 * Validates the input, updates the pet, and redirects to owner details on success.
 * Renders the form again with errors if validation fails.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.post('/:petId/edit', (req: Request, res: Response) => {
  const owner: Owner = res.locals.owner;
  const petId = parseInt(req.params.petId, 10);
  const petData = req.body;
  petData.id = petId; // Ensure ID is present for validation/update
  petData.ownerId = owner.id;

  const result = petSchema(owner).safeParse(petData);

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

    req.flash('error', req.__('There was an error in editing the pet.'));
    return res.render('pets/createOrUpdatePetForm', {
      owner,
      pet: { ...petData, isNew: false },
      types: res.locals.types,
      errors,
      menu: 'owners'
    });
  }

  const petType: PetType | undefined = petTypeRepository.findByName(result.data.type);
  if (!petType) {
    const errors: { [key: string]: string[] } = { type: [req.__('type not found: {{type}}', { type: result.data.type })] };
    req.flash('error', req.__('There was an error in editing the pet.'));
    return res.render('pets/createOrUpdatePetForm', {
      owner,
      pet: { ...petData, isNew: false },
      types: res.locals.types,
      errors,
      menu: 'owners'
    });
  }

  const updatedPet: Pet = {
    ...res.locals.pet, // Preserve existing visits and other fields not in form
    id: petId,
    name: result.data.name,
    birthDate: new Date(result.data.birthDate),
    type: petType,
    ownerId: owner.id!,
    isNew: false
  };

  petService.updatePetForOwner(owner.id!, updatedPet);
  req.flash('message', req.__('Pet details has been edited'));
  res.redirect(`/owners/${owner.id}`);
});

export default router;
