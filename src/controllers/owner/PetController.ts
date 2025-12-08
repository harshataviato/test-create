/**
 * @module controllers/owner/PetController
 * @description Handles HTTP requests related to `Pet` entities.
 *              Mimics Spring's `PetController.java`.
 */

import { Request, Response, NextFunction } from 'express';
import { petService } from '@services/owner/PetService';
import { ownerService } from '@services/owner/OwnerService';
import { Pet } from '@models/owner/Pet';
import { Owner } from '@models/owner/Owner';
import { PetType } from '@models/owner/PetType';
import { HttpError } from '@utils/errors';
import i18n from 'i18next';
import moment from 'moment';

/**
 * @class PetController
 * @description Controller responsible for handling pet-related requests,
 *              including creating and updating pets for a specific owner.
 */
export class PetController {
  private petService = petService;
  private ownerService = ownerService;

  /**
   * @method populatePetTypes
   * @description Middleware to populate pet types for forms.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async populatePetTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const types = await this.petService.findPetTypes();
      res.locals.types = types; // Make pet types available to templates
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method findOwner
   * @description Middleware to find an owner by ID and attach it to `res.locals`.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async findOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = parseInt(req.params.ownerId, 10);
      const owner = await this.ownerService.findOwnerById(ownerId);
      if (!owner) {
        throw new HttpError(404, i18n.t('notFound', { field: 'Owner', id: ownerId }));
      }
      res.locals.owner = owner; // Make owner available to templates
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method findPet
   * @description Middleware to find a pet by ID (if `petId` is present) and attach it to `res.locals`.
   *              If `petId` is not present, initializes an empty `Pet` object.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async findPet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const petId = parseInt(req.params.petId, 10);
      let pet: Pet;

      if (!isNaN(petId)) {
        const foundPet = await this.petService.findPetById(petId);
        if (!foundPet) {
          throw new HttpError(404, i18n.t('notFound', { field: 'Pet', id: petId }));
        }
        pet = foundPet;
      } else {
        pet = new Pet();
      }
      res.locals.pet = pet; // Make pet available to templates
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method initCreationForm
   * @description Displays the form for creating a new pet.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  initCreationForm(req: Request, res: Response): void {
    const owner: Owner = res.locals.owner;
    const pet = new Pet();
    pet.owner = owner; // Associate the new pet with the current owner
    res.render('pets/createOrUpdatePetForm', { owner, pet, types: res.locals.types });
  }

  /**
   * @method processCreationForm
   * @description Processes the form submission for creating a new pet.
   * @param {Request} req - The Express request object, containing new pet data in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async processCreationForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const owner: Owner = res.locals.owner;
      const petData: Partial<Pet> = {
        name: req.body.name,
        birthDate: moment(req.body.birthDate).toDate(), // Convert string to Date
        type: { name: req.body.type } as PetType, // Only name needed for lookup
      };

      const newPet = await this.petService.createPet(owner.id!, petData);
      req.flash('message', i18n.t('New Pet has been Added'));
      res.redirect(`/owners/${owner.id}`);
    } catch (error) {
      if (error instanceof HttpError) {
        const owner: Owner = res.locals.owner;
        const pet = new Pet(req.body);
        pet.owner = owner; // Ensure owner is attached for re-rendering
        // Attempt to re-fetch PetType for the form if it was valid before validation failed
        pet.type = res.locals.types.find((t: PetType) => t.name === req.body.type) || new PetType({ name: req.body.type });
        res.render('pets/createOrUpdatePetForm', { owner, pet, types: res.locals.types, errors: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * @method initUpdateForm
   * @description Displays the form for updating an existing pet.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  initUpdateForm(req: Request, res: Response): void {
    const owner: Owner = res.locals.owner;
    const pet: Pet = res.locals.pet;
    res.render('pets/createOrUpdatePetForm', { owner, pet, types: res.locals.types });
  }

  /**
   * @method processUpdateForm
   * @description Processes the form submission for updating an existing pet.
   * @param {Request} req - The Express request object, containing updated pet data in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async processUpdateForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const owner: Owner = res.locals.owner;
      const petId = parseInt(req.params.petId, 10);
      const petData: Partial<Pet> = {
        name: req.body.name,
        birthDate: moment(req.body.birthDate).toDate(), // Convert string to Date
        type: { name: req.body.type } as PetType, // Only name needed for lookup
      };

      const updatedPet = await this.petService.updatePet(owner.id!, petId, petData);
      req.flash('message', i18n.t('Pet details has been edited'));
      res.redirect(`/owners/${owner.id}`);
    } catch (error) {
      if (error instanceof HttpError) {
        const owner: Owner = res.locals.owner;
        const pet = new Pet(req.body);
        pet.id = parseInt(req.params.petId, 10); // Ensure ID is present for re-rendering
        pet.owner = owner;
        // Attempt to re-fetch PetType for the form if it was valid before validation failed
        pet.type = res.locals.types.find((t: PetType) => t.name === req.body.type) || new PetType({ name: req.body.type });
        res.render('pets/createOrUpdatePetForm', { owner, pet, types: res.locals.types, errors: error.message });
      } else {
        next(error);
      }
    }
  }
}

export const petController = new PetController();
