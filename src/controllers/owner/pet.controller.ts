/**
 * @module controllers/owner/pet.controller
 * @description
 * Handles HTTP requests related to Pet entities, nested under a specific Owner.
 * Provides endpoints for creating and updating pets for a given owner.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Owner } from '../../models/owner/owner.entity';
import { Pet } from '../../models/owner/pet.entity';
import { PetType } from '../../models/owner/pet-type.entity';
import { OwnerRepository } from '../../repositories/owner.repository';
import { PetTypeRepository } from '../../repositories/pet-type.repository';
import { formatValidationErrors } from '../../utils/constants';

const router = Router({ mergeParams: true }); // Merge params from parent router (/owners/:ownerId)
const VIEWS_PETS_CREATE_OR_UPDATE_FORM = 'pets/createOrUpdatePetForm';

/**
 * Middleware to populate pet types for forms.
 * Attaches a list of all pet types to `res.locals.types`.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
const populatePetTypes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const petTypes = await PetTypeRepository.find({ order: { name: 'ASC' } });
    res.locals.types = petTypes;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to find an owner by ID and attach it to `res.locals.owner`.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
const findOwnerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = parseInt(req.params.ownerId, 10);
  try {
    const owner = await OwnerRepository.findOne({ where: { id: ownerId }, relations: ['pets', 'pets.visits'] });
    if (!owner) {
      throw new Error(`Owner not found with id: ${ownerId}. Please ensure the ID is correct.`);
    }
    res.locals.owner = owner;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to find a pet by ID (if `petId` is present in params) and attach it to `res.locals.pet`.
 * If `petId` is not present, a new `Pet` instance is created.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
const findPetMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const petId = parseInt(req.params.petId, 10);
  const owner: Owner = res.locals.owner;

  if (isNaN(petId)) {
    res.locals.pet = new Pet();
    return next();
  }

  const pet = owner.pets.find(p => p.id === petId);
  if (!pet) {
    throw new Error(`Pet with id ${petId} not found for owner with id ${owner.id}.`);
  }
  res.locals.pet = pet;
  next();
};

router.use(populatePetTypes, findOwnerMiddleware);

/**
 * GET /owners/:ownerId/pets/new
 * Displays the form to create a new pet for the specified owner.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/new', findPetMiddleware, (req: Request, res: Response) => {
  const owner: Owner = res.locals.owner;
  const pet: Pet = res.locals.pet; // This will be a new Pet instance

  owner.addPet(pet); // Associate new pet with owner (temporarily for form)
  res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
});

/**
 * POST /owners/:ownerId/pets/new
 * Processes the form submission for creating a new pet.
 * Validates input, checks for duplicate pet names, and saves the pet.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
router.post('/new', findPetMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  const owner: Owner = res.locals.owner;
  const pet = res.locals.pet as Pet; // New pet instance from middleware or existing
  const newPetData = req.body;

  // Convert incoming petType name to PetType entity
  const petType = res.locals.types.find((type: PetType) => type.name === newPetData.type);
  if (!petType) {
    (req.session as any).error = req.t('typeMismatch.petType');
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
  }

  // Update pet instance with form data
  pet.name = newPetData.name;
  pet.birthDate = newPetData.birthDate ? new Date(newPetData.birthDate) : undefined;
  pet.type = petType;

  // Manual validation for duplicate pet name (case-insensitive) for a new pet
  if (pet.id === undefined && owner.pets.some(p => p.name?.toLowerCase() === pet.name?.toLowerCase())) {
    (req.session as any).error = req.t('duplicate', { field: req.t('name') });
    // Keep pet data for re-rendering the form
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
  }

  // General validation using class-validator
  const errors = await validate(pet);
  if (errors.length > 0) {
    (req.session as any).error = formatValidationErrors(errors);
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
  }

  // Check birth date not in the future
  if (pet.birthDate && pet.birthDate.getTime() > new Date().getTime()) {
    (req.session as any).error = req.t('typeMismatch.birthDate');
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
  }

  try {
    // Add pet to owner if it's new, TypeORM handles relationships
    if (pet.id === undefined) {
      owner.addPet(pet);
    }
    await OwnerRepository.save(owner); // Cascade save will handle the pet
    (req.session as any).message = 'New Pet has been Added';
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /owners/:ownerId/pets/:petId/edit
 * Displays the form to update an existing pet.
 * Uses findPetMiddleware to load the pet.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/:petId/edit', findPetMiddleware, (req: Request, res: Response) => {
  const owner: Owner = res.locals.owner;
  const pet: Pet = res.locals.pet;
  res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
});

/**
 * POST /owners/:ownerId/pets/:petId/edit
 * Processes the form submission for updating an existing pet.
 * Validates input, checks for duplicate pet names (excluding itself), and saves changes.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
router.post('/:petId/edit', findPetMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  const owner: Owner = res.locals.owner;
  const pet = res.locals.pet as Pet; // Existing pet loaded by middleware
  const updatedPetData = req.body;

  // Convert incoming petType name to PetType entity
  const petType = res.locals.types.find((type: PetType) => type.name === updatedPetData.type);
  if (!petType) {
    (req.session as any).error = req.t('typeMismatch.petType');
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
  }

  // Update pet instance with form data
  pet.name = updatedPetData.name;
  pet.birthDate = updatedPetData.birthDate ? new Date(updatedPetData.birthDate) : undefined;
  pet.type = petType;

  // Manual validation for duplicate pet name (case-insensitive), excluding the current pet
  if (owner.pets.some(p => p.name?.toLowerCase() === pet.name?.toLowerCase() && p.id !== pet.id)) {
    (req.session as any).error = req.t('duplicate', { field: req.t('name') });
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
  }

  // General validation using class-validator
  const errors = await validate(pet);
  if (errors.length > 0) {
    (req.session as any).error = formatValidationErrors(errors);
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
  }

  // Check birth date not in the future
  if (pet.birthDate && pet.birthDate.getTime() > new Date().getTime()) {
    (req.session as any).error = req.t('typeMismatch.birthDate');
    return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { owner, pet, types: res.locals.types, menu: 'owners' });
  }

  try {
    await OwnerRepository.save(owner); // Cascade save will handle the pet
    (req.session as any).message = 'Pet details has been edited';
    res.redirect(`/owners/${owner.id}`);
  } catch (error) {
    next(error);
  }
});

export default router;
