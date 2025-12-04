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

// This file is a conceptual TypeScript adaptation of VisitController.java.
// It implements an Express.js router to handle requests related to pet visits.

import { Router, Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Owner, Pet, Visit } from '../types/models'; // Assuming models are defined
import { OwnerService } from '../services/OwnerService'; // Assuming OwnerService
import { VisitDto } from '../types/dtos'; // Assuming VisitDto for validation

/**
 * Express.js Router for Pet Visit operations.
 * Mimics `org.springframework.samples.petclinic.owner.VisitController`.
 *
 * @author Juergen Hoeller
 * @author Ken Krebs
 * @author Arjen Poutsma
 * @author Michael Isvy
 * @author Dave Syer
 * @author Wick Dynex
 * @author Michael Isvy (TypeScript adaptation)
 */
export class VisitController {
  public router: Router;

  constructor(private ownerService: OwnerService) {
    this.router = Router();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  /**
   * Initializes middleware specific to visit routes.
   * Mimics `@InitBinder` and `@ModelAttribute("visit")` logic.
   */
  private initializeMiddleware(): void {
    // Middleware to load owner and pet for all /owners/:ownerId/pets/:petId/visits/* routes
    this.router.use(
      '/owners/:ownerId/pets/:petId/visits/*',
      async (req: Request, res: Response, next: NextFunction) => {
        const ownerId = parseInt(req.params.ownerId, 10);
        const petId = parseInt(req.params.petId, 10);

        // Mimics `owners.findById(ownerId)` and handling `orElseThrow`
        const owner = await this.ownerService.findOwnerById(ownerId);
        if (!owner) {
          return res.status(404).render('error', {
            t: req.t,
            status: 404,
            message: `Owner not found with id: ${ownerId}. Please ensure the ID is correct.`,
          });
        }
        res.locals.owner = owner;

        // Mimics `owner.getPet(petId)` and handling `null`
        const pet = owner.getPet(petId);
        if (!pet) {
          return res.status(404).render('error', {
            t: req.t,
            status: 404,
            message: `Pet with id ${petId} not found for owner with id ${ownerId}.`,
          });
        }
        res.locals.pet = pet;

        // Mimics `dataBinder.setDisallowedFields("id")` (ID not allowed in form)
        // In Express, this is usually handled by DTOs (VisitDto) that exclude ID
        // or by explicitly picking/omitting fields from req.body.

        // Mimics `pet.addVisit(visit)` for a new visit, setting up the model attribute.
        // For GET, we prepare an empty visit. For POST, req.body will be validated.
        if (req.method === 'GET') { // Always prepare a new visit object for GET
          const newVisit = new Visit();
          // The Java `pet.addVisit(visit)` (which adds to the pet's collection) on the @ModelAttribute method
          // is effectively setting up the `visit` object in the model *context*.
          // Here, we just put it into `res.locals` to be passed to the view, without modifying the persistent `pet.visits` yet.
          res.locals.visit = newVisit;
        }

        next();
      }
    );
  }

  private initializeRoutes(): void {
    // Mimics @GetMapping("/owners/{ownerId}/pets/{petId}/visits/new")
    this.router.get('/owners/:ownerId/pets/:petId/visits/new', this.initNewVisitForm.bind(this));

    // Mimics @PostMapping("/owners/{ownerId}/pets/{petId}/visits/new")
    this.router.post('/owners/:ownerId/pets/:petId/visits/new', this.processNewVisitForm.bind(this));
  }

  /**
   * Renders the form to create a new visit.
   * Mimics `public String initNewVisitForm()`.
   */
  private async initNewVisitForm(req: Request, res: Response): Promise<void> {
    const owner: Owner = res.locals.owner;
    const pet: Pet = res.locals.pet;
    const visit: Visit = res.locals.visit; // An empty visit prepared by middleware

    res.render('pets/createOrUpdateVisitForm', {
      t: req.t,
      activeMenu: 'owners',
      isNew: true,
      owner: owner,
      pet: pet,
      visit: visit,
      // Pass any flash messages or errors from query params
      message: req.query.message,
      error: req.query.error,
    });
  }

  /**
   * Processes the form submission for a new visit.
   * Mimics `public String processNewVisitForm(...)`.
   */
  private async processNewVisitForm(req: Request, res: Response): Promise<void> {
    const owner: Owner = res.locals.owner;
    const pet: Pet = res.locals.pet;
    const visitData = plainToInstance(VisitDto, req.body); // Use DTO for validation

    // Manual validation mimicking `@Valid` and `BindingResult result`
    const validationErrors = await validate(visitData);

    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      // Construct a simplified error map for rendering in EJS/React template
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.property && err.constraints) {
          errorMap[err.property] = Object.values(err.constraints)[0]; // Take first message
        }
      });

      // Mimics re-rendering the form with errors.
      return res.render('pets/createOrUpdateVisitForm', {
        t: req.t,
        activeMenu: 'owners',
        isNew: true,
        owner: owner,
        pet: pet,
        visit: visitData, // Pass the submitted data back to pre-fill the form
        errors: errorMap, // Pass validation errors
        // Add specific field error flags for template rendering, e.g. `attributeHasErrors('description')`
      });
    }

    // Create a new Visit instance and add it to the pet
    const newVisit = new Visit();
    Object.assign(newVisit, visitData); // Copy validated data to the new visit object
    owner.addVisit(pet.id!, newVisit); // Add visit to pet, which is part of the owner

    // Mimics `owners.save(owner)`
    await this.ownerService.saveOwner(owner); // Saving owner will cascade save to pets and visits.

    // Mimics `redirectAttributes.addFlashAttribute("message", "Your visit has been booked");`
    // and `return "redirect:/owners/{ownerId}";`
    res.redirect(`/owners/${owner.id}?message=${encodeURIComponent(req.t('visitBooked'))}`); // Flash message via query param
  }
}

// Export an instance of the controller
import { ownerService } from '../services/OwnerService';
export const visitController = new VisitController(ownerService);
