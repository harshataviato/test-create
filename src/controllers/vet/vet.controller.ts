/**
 * @module controllers/vet/vet.controller
 * @description
 * Handles HTTP requests related to Veterinarian (Vet) entities.
 * Provides endpoints for listing all vets, with pagination for HTML views
 * and a JSON API endpoint.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { VetRepository } from '../../repositories/vet.repository';
import { VetsDto } from '../../models/vet/vets.dto';
import { appConfig } from '../../config/app.config';
import { paginationService } from '../../services/pagination.service';
import { Vet } from '../../models/vet/vet.entity';

const router = Router();

/**
 * GET /vets.html
 * Displays a paginated list of veterinarians in HTML format.
 * Includes information about current page, total pages, and total items.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
router.get('/vets.html', async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string || '1', 10);
  const pageSize = appConfig.pageSize; // Use configured page size

  try {
    // Retrieve paginated vets from the repository
    const { items, totalItems, totalPages, currentPage } = await paginationService.findPaginated(
      VetRepository,
      page,
      pageSize,
      {}, // No specific search criteria for vets list, fetch all
      ['specialties'] // Eagerly load specialties
    );

    // Render the vet list EJS template with pagination data
    res.render('vets/vetList', {
      listVets: items,
      totalItems,
      totalPages,
      currentPage,
      menu: 'vets',
    });
  } catch (error) {
    next(error); // Pass any errors to the error handling middleware
  }
});

/**
 * GET /vets
 * Provides a JSON API endpoint to retrieve all veterinarians.
 * Wraps the list of vets in a `VetsDto` object for consistency with original Java structure.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
router.get('/vets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Retrieve all vets from the repository, including their specialties
    const allVets = await VetRepository.find({ relations: ['specialties'] });
    const vetsDto = new VetsDto();
    vetsDto.vetList = allVets;

    // Send the VetsDto as a JSON response
    res.json(vetsDto);
  } catch (error) {
    next(error); // Pass any errors to the error handling middleware
  }
});

export default router;
