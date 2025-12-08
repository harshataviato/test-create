/**
 * @module controllers/owner/OwnerController
 * @description Handles HTTP requests related to `Owner` entities.
 *              Mimics Spring's `OwnerController.java`.
 */

import { Request, Response, NextFunction } from 'express';
import { ownerService } from '@services/owner/OwnerService';
import { Owner } from '@models/owner/Owner';
import { HttpError } from '@utils/errors';
import i18n from 'i18next';

/**
 * @class OwnerController
 * @description Controller responsible for handling owner-related requests,
 *              including creating, finding, updating, and displaying owners.
 */
export class OwnerController {
  private ownerService = ownerService;
  private PAGE_SIZE = 5; // Number of owners per page for listing

  /**
   * @method initCreationForm
   * @description Displays the form for creating a new owner.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  initCreationForm(req: Request, res: Response): void {
    const owner = new Owner();
    res.render('owners/createOrUpdateOwnerForm', { owner });
  }

  /**
   * @method processCreationForm
   * @description Processes the form submission for creating a new owner.
   * @param {Request} req - The Express request object, containing new owner data in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  async processCreationForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerData: Partial<Owner> = { ...req.body };
      const newOwner = await this.ownerService.createOwner(ownerData as Owner); // Cast to Owner for validation
      req.flash('message', i18n.t('New Owner Created'));
      res.redirect(`/owners/${newOwner.id}`);
    } catch (error) {
      if (error instanceof HttpError) {
        // Validation errors or other controlled errors
        const owner = new Owner(req.body); // Re-render form with current data
        res.render('owners/createOrUpdateOwnerForm', { owner, errors: error.message });
      } else {
        next(error); // Pass other errors to the error handler
      }
    }
  }

  /**
   * @method initFindForm
   * @description Displays the form for finding owners.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   */
  initFindForm(req: Request, res: Response): void {
    const owner = new Owner(); // Empty owner for initial form
    res.render('owners/findOwners', { owner });
  }

  /**
   * @method processFindForm
   * @description Processes the form submission for finding owners.
   *              Handles pagination and redirects if a single owner is found.
   * @param {Request} req - The Express request object, containing `lastName` query param and `page`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  async processFindForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lastName = req.query.lastName as string || ''; // Default to empty string for broadest search
      const page = parseInt(req.query.page as string, 10) || 1;

      const { owners, totalCount, totalPages } = await this.ownerService.findOwnersByLastName(lastName, page, this.PAGE_SIZE);

      if (owners.length === 0) {
        const owner = new Owner();
        owner.lastName = lastName;
        res.render('owners/findOwners', { owner, errors: i18n.t('notFound', { field: 'Owner' }) });
        return;
      }

      if (owners.length === 1 && totalPages === 1) {
        res.redirect(`/owners/${owners[0].id}`);
        return;
      }

      res.render('owners/ownersList', {
        listOwners: owners,
        currentPage: page,
        totalPages,
        totalItems: totalCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method initUpdateOwnerForm
   * @description Displays the form for updating an existing owner.
   * @param {Request} req - The Express request object, containing `ownerId` in `req.params`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  async initUpdateOwnerForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = parseInt(req.params.ownerId, 10);
      const owner = await this.ownerService.findOwnerById(ownerId);
      if (!owner) {
        throw new HttpError(404, i18n.t('notFound', { field: 'Owner', id: ownerId }));
      }
      res.render('owners/createOrUpdateOwnerForm', { owner });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method processUpdateOwnerForm
   * @description Processes the form submission for updating an existing owner.
   * @param {Request} req - The Express request object, containing `ownerId` in `req.params` and updated data in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  async processUpdateOwnerForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = parseInt(req.params.ownerId, 10);
      const ownerData: Partial<Owner> = { ...req.body };

      if (ownerData.id && ownerData.id !== ownerId) {
        // This is a business rule from the Java version: ID in form must match path ID
        req.flash('error', i18n.t('Owner ID mismatch. Please try again.'));
        return res.redirect(`/owners/${ownerId}/edit`);
      }
      ownerData.id = ownerId; // Ensure the ID from the path is used for update

      const updatedOwner = await this.ownerService.updateOwner(ownerId, ownerData as Owner); // Cast for validation

      if (updatedOwner) {
        req.flash('message', i18n.t('Owner Values Updated'));
        res.redirect(`/owners/${updatedOwner.id}`);
      } else {
        throw new HttpError(404, i18n.t('notFound', { field: 'Owner', id: ownerId }));
      }
    } catch (error) {
      if (error instanceof HttpError) {
        const owner = new Owner(req.body);
        owner.id = parseInt(req.params.ownerId, 10); // Ensure ID is present for re-rendering
        res.render('owners/createOrUpdateOwnerForm', { owner, errors: error.message });
      } else {
        next(error);
      }
    }
  }

  /**
   * @method showOwner
   * @description Displays details for a single owner, including their pets and visits.
   * @param {Request} req - The Express request object, containing `ownerId` in `req.params`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  async showOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = parseInt(req.params.ownerId, 10);
      const owner = await this.ownerService.findOwnerById(ownerId);
      if (!owner) {
        throw new HttpError(404, i18n.t('notFound', { field: 'Owner', id: ownerId }));
      }
      res.render('owners/ownerDetails', { owner, message: req.flash('message'), error: req.flash('error') });
    } catch (error) {
      next(error);
    }
  }
}

export const ownerController = new OwnerController();
