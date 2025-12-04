/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a conceptual TypeScript adaptation of VetController.java.
// It implements an Express.js router to handle requests related to veterinarians,
// including displaying lists with pagination and providing a JSON API.

import { Router, Request, Response } from 'express';
import { VetService } from '../services/VetService'; // Assuming VetService from previous conversion
import { Vets, Vet } from '../types/models'; // Assuming Vets and Vet models
import { Page } from '../types/pagination';

/**
 * Express.js Router for Vet-related operations.
 * Mimics `org.springframework.samples.petclinic.vet.VetController`.
 *
 * @author Juergen Hoeller
 * @author Mark Fisher
 * @author Ken Krebs
 * @author Arjen Poutsma
 * @author Michael Isvy (TypeScript adaptation)
 */
export class VetController {
  public router: Router;

  constructor(private vetService: VetService) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Mimics @GetMapping("/vets.html")
    this.router.get('/vets.html', this.showVetListHtml.bind(this));

    // Mimics @GetMapping({ "/vets" }) and @ResponseBody
    this.router.get('/vets', this.showResourcesVetList.bind(this));
  }

  /**
   * Handles GET requests to "/vets.html".
   * Renders the HTML page showing a paginated list of vets.
   * Mimics `public String showVetList(...)`.
   */
  private async showVetListHtml(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string || '1', 10);
    const pageSize = 5; // Fixed page size as in original Java `findPaginated` method

    const paginated: Page<Vet> = await this.vetService.getPaginatedVets(page - 1, pageSize); // page - 1 for 0-indexed pagination

    // Mimics `addPaginationModel` method logic
    res.render('vets/vetList', {
      t: req.t, // Pass translation function to template
      activeMenu: 'vets',
      currentPage: page,
      totalPages: paginated.totalPages,
      totalItems: paginated.totalElements,
      listVets: paginated.content,
      // Pass any flash messages or errors if applicable
      message: req.query.message,
      error: req.query.error,
    });
  }

  /**
   * Handles GET requests to "/vets".
   * Returns a JSON representation of all vets.
   * Mimics `public @ResponseBody Vets showResourcesVetList()`.
   */
  private async showResourcesVetList(req: Request, res: Response): Promise<void> {
    // Here we are returning an object of type 'Vets' rather than a collection of Vet
    // objects so it is simpler for JSON/Object mapping.
    const vetsContainer: Vets = await this.vetService.getAllVets();
    res.json(vetsContainer); // Express automatically converts to JSON
  }
}

// Export an instance of the controller.
// This instance would then be used in your main Express app setup.
// Example: `app.use('/', new VetController(vetService).router);`
// (Assuming `vetService` is an initialized instance of `VetService`)
//
// For simplicity in this conversion, we directly instantiate it using the exported service.
import { vetService } from '../services/VetService';
export const vetController = new VetController(vetService);
