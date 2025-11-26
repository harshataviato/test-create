/**
 * @module controllers/vetController
 * @description Handles HTTP requests related to Vet entities.
 * Provides endpoints for displaying a list of veterinarians, including paginated and API views.
 */

import { Request, Response, Router } from 'express';
import { VetService } from '@services/vetService';
import { Vets } from '@models/vet'; // Assuming Vets is a simple wrapper for a list of Vet

// Initialize VetService
const vetService = new VetService();
const router = Router();

/**
 * GET /vets.html
 * @description Displays a paginated list of veterinarians in HTML format.
 * Sets the active menu item to 'vets'.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/vets.html', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = 5; // Fixed page size as in the Java example

  const paginatedVets = vetService.findAllPaginated(page, pageSize);
  const totalItems = vetService.countAllVets();
  const totalPages = Math.ceil(totalItems / pageSize);

  res.render('vets/vetList', {
    listVets: paginatedVets,
    currentPage: page,
    totalPages: totalPages,
    totalItems: totalItems,
    menu: 'vets' // Set active menu item for layout.ejs
  });
});

/**
 * GET /vets
 * @description Returns a list of all veterinarians in JSON format.
 * This serves as a REST API endpoint.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/', (req: Request, res: Response) => {
  const allVets = vetService.findAll();
  const vetsWrapper: Vets = { vetList: allVets }; // Wrap in Vets object for consistency with original API
  res.json(vetsWrapper);
});

export default router;
