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

// This file is a conceptual TypeScript adaptation of OwnerController.java.
// It implements an Express.js router to handle requests related to owners.

import { Router, Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Owner } from '../types/models'; // Assuming Owner model is defined
import { OwnerService } from '../services/OwnerService'; // Assuming OwnerService
import { OwnerDto } from '../types/dtos'; // Assuming OwnerDto for validation
import { Page, Pageable } from '../types/pagination';

// Define a static string for view names, mimicking Java constant
const VIEWS_OWNER_CREATE_OR_UPDATE_FORM = 'owners/createOrUpdateOwnerForm';
const OWNERS_PAGE_SIZE = 5; // Fixed page size as in original Java `findPaginatedForOwnersLastName`

/**
 * Express.js Router for Owner-related operations.
 * Mimics `org.springframework.samples.petclinic.owner.OwnerController`.
 *
 * @author Juergen Hoeller
 * @author Ken Krebs
 * @author Arjen Poutsma
 * @author Michael Isvy
 * @author Wick Dynex
 * @author Michael Isvy (TypeScript adaptation)
 */
export class OwnerController {
  public router: Router;

  constructor(private ownerService: OwnerService) {
    this.router = Router();
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  /**
   * Initializes middleware specific to owner routes.
   * Mimics `@InitBinder` and `@ModelAttribute("owner")` logic.
   */
  private initializeMiddleware(): void {
    // Mimics `@InitBinder`
    // In Express, this is often handled by DTOs for incoming data, or explicit
    // field filtering, rather than a global binder for all requests.
    // dataBinder.setDisallowedFields("id"); // Handled by `OwnerDto` not having `id` for creation.

    // Mimics `@ModelAttribute("owner")` logic to load an owner by ID
    this.router.use(
      '/owners/:ownerId/*', // Apply to all routes under /owners/:ownerId
      async (req: Request, res: Response, next: NextFunction) => {
        const ownerId = parseInt(req.params.ownerId, 10);
        // Only attempt to load if ownerId is a valid number and not for 'new' or 'find' paths
        if (!isNaN(ownerId) && req.params.ownerId !== 'new' && req.params.ownerId !== 'find') {
          try {
            const owner = await this.ownerService.findOwnerById(ownerId);
            if (!owner) {
              throw new Error(`Owner not found with id: ${ownerId}. Please ensure the ID is correct and the owner exists in the database.`);
            }
            res.locals.owner = owner; // Attach loaded owner to response locals
          } catch (error: any) {
            // Handle IllegalArgumentException equivalent
            return res.status(404).render('error', { t: req.t, status: 404, message: error.message });
          }
        } else {
            res.locals.owner = new Owner(); // For 'new' or 'find', start with an empty owner object
        }
        next();
      }
    );
  }

  private initializeRoutes(): void {
    // Mimics @GetMapping("/owners/new")
    this.router.get('/owners/new', this.initCreationForm.bind(this));

    // Mimics @PostMapping("/owners/new")
    this.router.post('/owners/new', this.processCreationForm.bind(this));

    // Mimics @GetMapping("/owners/find")
    this.router.get('/owners/find', this.initFindForm.bind(this));

    // Mimics @GetMapping("/owners")
    this.router.get('/owners', this.processFindForm.bind(this));

    // Mimics @GetMapping("/owners/{ownerId}/edit")
    this.router.get('/owners/:ownerId/edit', this.initUpdateOwnerForm.bind(this));

    // Mimics @PostMapping("/owners/{ownerId}/edit")
    this.router.post('/owners/:ownerId/edit', this.processUpdateOwnerForm.bind(this));

    // Mimics @GetMapping("/owners/{ownerId}")
    this.router.get('/owners/:ownerId', this.showOwner.bind(this));
  }

  /**
   * Renders the form to create a new owner.
   * Mimics `public String initCreationForm()`.
   */
  private async initCreationForm(req: Request, res: Response): Promise<void> {
    // @ModelAttribute("owner") already created a new Owner via middleware for '/owners/new'
    const owner: Owner = res.locals.owner; // Should be a new Owner instance

    res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
      t: req.t,
      activeMenu: 'owners',
      isNew: true,
      owner: owner,
      message: req.query.message,
      error: req.query.error,
    });
  }

  /**
   * Processes the form submission for creating a new owner.
   * Mimics `public String processCreationForm(...)`.
   */
  private async processCreationForm(req: Request, res: Response): Promise<void> {
    const ownerData = plainToInstance(OwnerDto, req.body); // Use DTO for validation
    const result = await validate(ownerData); // Mimics BindingResult

    if (result.length > 0) {
      // Mimics `result.hasErrors()`
      console.log('Validation errors:', result);
      const errorMap: Record<string, string> = {};
      result.forEach(err => {
        if (err.property && err.constraints) {
          errorMap[err.property] = Object.values(err.constraints)[0];
        }
      });
      // Mimics `redirectAttributes.addFlashAttribute("error", ...)` for re-rendering form
      return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
        t: req.t,
        activeMenu: 'owners',
        isNew: true,
        owner: req.body, // Pass submitted data back
        errors: errorMap,
        error: req.t('creationError') || 'There was an error in creating the owner.', // Specific error message
      });
    }

    const newOwner = new Owner();
    Object.assign(newOwner, ownerData); // Map DTO to entity

    await this.ownerService.saveOwner(newOwner); // Mimics `this.owners.save(owner)`
    // Mimics `redirectAttributes.addFlashAttribute("message", ...)`
    res.redirect(`/owners/${newOwner.id}?message=${encodeURIComponent(req.t('newOwnerAdded'))}`);
  }

  /**
   * Renders the form to find owners.
   * Mimics `public String initFindForm()`.
   */
  private async initFindForm(req: Request, res: Response): Promise<void> {
    res.render('owners/findOwners', {
      t: req.t,
      activeMenu: 'owners',
      owner: new Owner(), // Empty owner for form
      message: req.query.message,
      error: req.query.error,
    });
  }

  /**
   * Processes the find owner form submission.
   * Mimics `public String processFindForm(...)`.
   */
  private async processFindForm(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string || '1', 10);
    let lastName = (req.query.lastName as string || '').trim();

    // Mimics `if (lastName == null) { lastName = ""; }`
    if (lastName === null || lastName === undefined) {
      lastName = ''; // empty string signifies broadest possible search
    }

    // find owners by last name
    const ownersResults: Page<Owner> = await this.ownerService.findOwnersByLastNameStartingWith(
      lastName,
      page - 1, // Convert to 0-indexed page for service
      OWNERS_PAGE_SIZE
    );

    if (ownersResults.content.length === 0) {
      // no owners found - Mimics `result.rejectValue("lastName", "notFound", "not found");`
      return res.render('owners/findOwners', {
        t: req.t,
        activeMenu: 'owners',
        owner: { lastName: lastName }, // Keep search term in form
        errors: { lastName: req.t('notFound') }, // Example error message
        error: 'notFound', // Specific error code for template
      });
    }

    if (ownersResults.totalElements === 1) {
      // 1 owner found
      const owner = ownersResults.content[0];
      return res.redirect(`/owners/${owner.id}`);
    }

    // multiple owners found - Mimics `addPaginationModel(...)`
    res.render('owners/ownersList', {
      t: req.t,
      activeMenu: 'owners',
      currentPage: page,
      totalPages: ownersResults.totalPages,
      totalItems: ownersResults.totalElements,
      listOwners: ownersResults.content,
      // Add message/error if any
      message: req.query.message,
      error: req.query.error,
    });
  }

  /**
   * Renders the form to update an existing owner.
   * Mimics `public String initUpdateOwnerForm()`.
   */
  private async initUpdateOwnerForm(req: Request, res: Response): Promise<void> {
    // @ModelAttribute("owner") already loaded the owner via middleware for '/owners/:ownerId/edit'
    const owner: Owner = res.locals.owner;

    res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
      t: req.t,
      activeMenu: 'owners',
      isNew: false,
      owner: owner,
      message: req.query.message,
      error: req.query.error,
    });
  }

  /**
   * Processes the form submission for updating an owner.
   * Mimics `public String processUpdateOwnerForm(...)`.
   */
  private async processUpdateOwnerForm(req: Request, res: Response): Promise<void> {
    const ownerIdFromPath = parseInt(req.params.ownerId, 10);
    const existingOwner: Owner = res.locals.owner; // Owner loaded by middleware

    const ownerData = plainToInstance(OwnerDto, req.body); // DTO from form submission
    const result = await validate(ownerData);

    // Mimics `if (!Objects.equals(owner.getId(), ownerId))`
    if (ownerData.id !== undefined && !isNaN(ownerData.id) && ownerData.id !== ownerIdFromPath) {
        // ID in form body mismatches ID in URL path
        // Mimics `result.rejectValue("id", "mismatch", ...)` and RedirectAttributes.
        return res.redirect(`/owners/${ownerIdFromPath}/edit?error=${encodeURIComponent(req.t('idMismatch'))}`);
    }

    if (result.length > 0) {
      console.log('Validation errors:', result);
      const errorMap: Record<string, string> = {};
      result.forEach(err => {
        if (err.property && err.constraints) {
          errorMap[err.property] = Object.values(err.constraints)[0];
        }
      });
      return res.render(VIEWS_OWNER_CREATE_OR_UPDATE_FORM, {
        t: req.t,
        activeMenu: 'owners',
        isNew: false,
        owner: { ...existingOwner, ...req.body }, // Merge original with submitted for form pre-fill
        errors: errorMap,
        error: req.t('updateError') || 'There was an error in updating the owner.',
      });
    }

    // Update the existing owner entity with new data
    // Use `Object.assign` or manual mapping to update properties from DTO
    Object.assign(existingOwner, ownerData);
    existingOwner.id = ownerIdFromPath; // Ensure ID is set from path variable

    await this.ownerService.saveOwner(existingOwner);
    res.redirect(`/owners/${existingOwner.id}?message=${encodeURIComponent(req.t('ownerUpdated'))}`);
  }

  /**
   * Custom handler for displaying an owner.
   * Mimics `public ModelAndView showOwner(...)`.
   */
  private async showOwner(req: Request, res: Response): Promise<void> {
    // @ModelAttribute("owner") already loaded the owner via middleware for '/owners/:ownerId'
    const owner: Owner = res.locals.owner;

    res.render('owners/ownerDetails', {
      t: req.t,
      activeMenu: 'owners',
      owner: owner,
      message: req.query.message, // Example of flash message
      error: req.query.error,
    });
  }
}

// Export an instance of the controller.
import { ownerService } from '../services/OwnerService';
export const ownerController = new OwnerController(ownerService);
