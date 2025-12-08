/**
 * @module controllers/vet/VetController
 * @description Handles HTTP requests related to `Vet` entities.
 *              Mimics Spring's `VetController.java`.
 */

import { Request, Response, NextFunction } from 'express';
import { vetService } from '@services/vet/VetService';
import { Vets } from '@models/vet/Vets'; // Use the Vets wrapper class for consistent API
import i18n from 'i18next';

/**
 * @class VetController
 * @description Controller responsible for handling veterinarian-related requests,
 *              including listing vets with pagination and exposing them as a JSON API.
 */
export class VetController {
  private vetService = vetService;
  private PAGE_SIZE = 5; // Number of vets per page for listing

  /**
   * @method showVetListHtml
   * @description Displays the list of veterinarians with pagination in HTML format.
   * @param {Request} req - The Express request object, potentially containing `page` query parameter.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  async showVetListHtml(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const { vets, totalCount, totalPages } = await this.vetService.findVetsPaginated(page, this.PAGE_SIZE);

      res.render('vets/vetList', {
        listVets: vets.getVetList(), // Pass the actual list of vets to the template
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method showResourcesVetList
   * @description Returns the list of veterinarians as JSON.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The next middleware function in the stack.
   */
  async showResourcesVetList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vets = await this.vetService.findAllVets();
      res.json(vets); // Directly return the Vets object, which will be serialized to JSON
    } catch (error) {
      next(error);
    }
  }
}

export const vetController = new VetController();
