/**
 * @module controllers/owner/VisitController
 * @description Handles HTTP requests related to `Visit` entities.
 *              Mimics Spring's `VisitController.java`.
 */

import { Request, Response, NextFunction } from 'express';
import { visitService } from '@services/owner/VisitService';
import { ownerService } from '@services/owner/OwnerService';
import { Visit } from '@models/owner/Visit';
import { Owner } from '@models/owner/Owner';
import { Pet } from '@models/owner/Pet';
import { HttpError } from '@utils/errors';
import i18n from 'i18next';
import moment from 'moment';

/**
 * @class VisitController
 * @description Controller responsible for handling visit-related requests,
 *              specifically for adding new visits to a pet.
 */
export class VisitController {
  private visitService = visitService;
  private ownerService = ownerService;

  /**
   * @method loadPetWithVisit
   * @description Middleware to load the owner and pet, then create a new visit instance,
   *              attaching them to `res.locals`. This is equivalent to Spring's `@ModelAttribute` logic.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async loadPetWithVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = parseInt(req.params.ownerId, 10);
      const petId = parseInt(req.params.petId, 10);

      const owner = await this.ownerService.findOwnerById(ownerId);
      if (!owner) {
        throw new HttpError(404, i18n.t('notFound', { field: 'Owner', id: ownerId }));
      }

      const pet = owner.getPetById(petId);
      if (!pet) {
        throw new HttpError(404, i18n.t('notFound', { field: 'Pet', id: petId }));
      }

      // If rendering the form, create a new Visit instance
      const visit = new Visit();
      visit.pet = pet; // Associate the new visit with the pet

      res.locals.owner = owner;
      res.locals.pet = pet;
      res.locals.visit = visit; // Make the new visit available to the template

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method initNewVisitForm
   * @description Displays the form for adding a new visit to a pet.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  initNewVisitForm(req: Request, res: Response): void {
    const owner: Owner = res.locals.owner;
    const pet: Pet = res.locals.pet;
    const visit: Visit = res.locals.visit; // New visit object created by loadPetWithVisit

    res.render('pets/createOrUpdateVisitForm', { owner, pet, visit });
  }

  /**
   * @method processNewVisitForm
   * @description Processes the form submission for adding a new visit to a pet.
   * @param {Request} req - The Express request object, containing new visit data in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async processNewVisitForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const owner: Owner = res.locals.owner; // Owner from loadPetWithVisit
      const pet: Pet = res.locals.pet; // Pet from loadPetWithVisit
      const ownerId = parseInt(req.params.ownerId, 10);
      const petId = parseInt(req.params.petId, 10);

      const visitData: Partial<Visit> = {
        date: moment(req.body.date).toDate(), // Convert string to Date
        description: req.body.description,
      };

      await this.visitService.addVisitToPet(ownerId, petId, visitData);
      req.flash('message', i18n.t('Your visit has been booked'));
      res.redirect(`/owners/${ownerId}`);
    } catch (error) {
      if (error instanceof HttpError) {
        // Validation errors, re-render the form with existing data and errors
        const owner: Owner = res.locals.owner;
        const pet: Pet = res.locals.pet;
        const visit = new Visit(req.body);
        visit.pet = pet; // Ensure pet is linked for re-rendering

        res.render('pets/createOrUpdateVisitForm', { owner, pet, visit, errors: error.message });
      } else {
        next(error);
      }
    }
  }
}

export const visitController = new VisitController();
