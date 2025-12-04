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

// This file is a conceptual TypeScript adaptation of PetController.java.
// It implements an Express.js router to handle requests related to pet management
// for a specific owner.

import { Router, Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Owner, Pet, PetType } from '../types/models'; // Assuming models are defined
import { OwnerService } from '../services/OwnerService'; // Assuming OwnerService
import { PetService, PetTypeService } from '../services/PetService'; // Assuming PetService and PetTypeService
import { PetDto } from '../types/dtos'; // Assuming PetDto for validation
import { LocalDate } from '@js-joda/core'; // For date comparisons

// Define a static string for view names
const VIEWS_PETS_CREATE_OR_UPDATE_FORM = 'pets/createOrUpdatePetForm';

/**
 * Express.js Router for Pet-related operations.
 * Mimics `org.springframework.samples.petclinic.owner.PetController`.
 * The `@RequestMapping("/owners/{ownerId}")` implies this router is mounted under that path.
 *
 * @author Juergen Hoeller
 * @author Ken Krebs
 * @author Arjen Poutsma
 * @author Wick Dynex
 * @author Michael Isvy (TypeScript adaptation)
 */
export class PetController {
  public router: Router;

  constructor(
    private ownerService: OwnerService,
    private petService: PetService, // For saving pets directly if needed
    private petTypeService: PetTypeService,
  ) {
    this.router = Router({ mergeParams: true }); // `mergeParams: true` to access parent's `ownerId`
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  /**
   * Initializes middleware for this controller.
   * Mimics `@ModelAttribute("types")`, `@ModelAttribute("owner")`, `@ModelAttribute("pet")`,
   * and `@InitBinder` logic.
   */
  private initializeMiddleware(): void {
    // Middleware to populate pet types (mimics @ModelAttribute("types"))
    this.router.use(async (req: Request, res: Response, next: NextFunction) => {
      res.locals.petTypes = await this.petTypeService.getAllPetTypes();
      next();
    });

    // Middleware to load owner (mimics @ModelAttribute("owner"))
    this.router.use(async (req: Request, res: Response, next: NextFunction) => {
      const ownerId = parseInt(req.params.ownerId, 10);
      try {
        const owner = await this.ownerService.findOwnerById(ownerId);
        if (!owner) {
          throw new Error(`Owner not found with id: ${ownerId}.`);
        }
        res.locals.owner = owner;
        next();
      } catch (error: any) {
        return res.status(404).render('error', { t: req.t, status: 404, message: error.message });
      }
    });

    // Middleware to load pet (mimics @ModelAttribute("pet"))
    this.router.use(
      ['/pets/:petId/edit', '/pets/:petId/visits/new', '/pets/new'], // Apply to these specific paths
      async (req: Request, res: Response, next: NextFunction) => {
        const owner: Owner = res.locals.owner;
        const petId = parseInt(req.params.petId, 10); // Will be NaN for /pets/new

        let pet: Pet;
        if (!isNaN(petId)) { // If petId is present (for edit or visit)
          const foundPet = owner.getPet(petId);
          if (!foundPet) {
            return res.status(404).render('error', { t: req.t, status: 404, message: `Pet with id ${petId} not found.` });
          }
          pet = foundPet;
        } else { // For /pets/new
          pet = new Pet();
          // The Java `owner.addPet(pet)` here adds to a transient collection
          // which is then passed to the model. We'll handle this conceptually.
          // For now, just create a new pet object.
        }
        res.locals.pet = pet;
        next();
      }
    );

    // Mimics @InitBinder("owner") and @InitBinder("pet") - handled by DTOs/validators
    // `dataBinder.setDisallowedFields("id")` is handled by not including 'id' in DTOs.
    // `dataBinder.setValidator(new PetValidator())` is handled by `class-validator` or Yup.
  }

  private initializeRoutes(): void {
    // Mimics @GetMapping("/pets/new")
    this.router.get('/pets/new', this.initCreationForm.bind(this));

    // Mimics @PostMapping("/pets/new")
    this.router.post('/pets/new', this.processCreationForm.bind(this));

    // Mimics @GetMapping("/pets/{petId}/edit")
    this.router.get('/pets/:petId/edit', this.initUpdateForm.bind(this));

    // Mimics @PostMapping("/pets/{petId}/edit")
    this.router.post('/pets/:petId/edit', this.processUpdateForm.bind(this));
  }

  /**
   * Renders the form to create a new pet.
   * Mimics `public String initCreationForm(Owner owner, ModelMap model)`.
   */
  private async initCreationForm(req: Request, res: Response): Promise<void> {
    const owner: Owner = res.locals.owner;
    const pet: Pet = res.locals.pet; // This is a new Pet instance from middleware
    const petTypes: PetType[] = res.locals.petTypes;

    // The Java code directly adds `pet` to `owner.pets` here.
    // We'll manage this when saving in `processCreationForm`.

    res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
      t: req.t,
      activeMenu: 'owners',
      isNew: true,
      owner: owner,
      pet: pet,
      petTypes: petTypes,
      message: req.query.message,
      error: req.query.error,
    });
  }

  /**
   * Processes the form submission for creating a new pet.
   * Mimics `public String processCreationForm(...)`.
   */
  private async processCreationForm(req: Request, res: Response): Promise<void> {
    const owner: Owner = res.locals.owner;
    const petTypes: PetType[] = res.locals.petTypes;
    const petData = plainToInstance(PetDto, req.body); // DTO from form submission

    const validationErrors = await validate(petData); // Mimics @Valid and BindingResult

    // Custom validation logic from PetController.java
    // Mimics `if (StringUtils.hasText(pet.getName()) && pet.isNew() && owner.getPet(pet.getName(), true) != null)`
    if (petData.name && owner.getPet(petData.name, true)) {
      // Pet name already exists for this owner
      validationErrors.push({
        property: 'name',
        constraints: { duplicate: 'already exists' },
      } as ValidationError);
    }
    // Mimics `if (pet.getBirthDate() != null && pet.getBirthDate().isAfter(currentDate))`
    const birthDate = LocalDate.parse(petData.birthDate);
    const currentDate = LocalDate.now();
    if (birthDate.isAfter(currentDate)) {
      validationErrors.push({
        property: 'birthDate',
        constraints: { typeMismatch: 'typeMismatch.birthDate' },
      } as ValidationError);
    }
    // Also PetValidator tests for `required` for name, type, birthDate, which class-validator annotations already handle.

    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.property && err.constraints) {
          errorMap[err.property] = Object.values(err.constraints)[0];
        }
      });
      return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
        t: req.t,
        activeMenu: 'owners',
        isNew: true,
        owner: owner,
        pet: req.body, // Pass submitted data back
        petTypes: petTypes,
        errors: errorMap,
        error: req.t('petCreationError') || 'There was an error in adding the pet.',
      });
    }

    const newPet = new Pet();
    Object.assign(newPet, petData); // Map DTO to entity

    // Find the PetType object based on the submitted type name
    const selectedType = await this.petTypeService.getPetTypeByName(petData.type);
    if (selectedType) {
      newPet.type = selectedType;
      newPet.typeId = selectedType.id;
    } else {
        // This case should ideally be caught by frontend validation, but as a fallback
        validationErrors.push({
            property: 'type',
            constraints: { required: 'type not found' },
        } as ValidationError);
         return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, { /* ... re-render with errors */ });
    }

    owner.addPet(newPet); // Add to owner's pets. This will set pet.owner = owner.
    await this.ownerService.saveOwner(owner); // Cascades save to newPet

    res.redirect(`/owners/${owner.id}?message=${encodeURIComponent(req.t('newPetAdded'))}`);
  }

  /**
   * Renders the form to update an existing pet.
   * Mimics `public String initUpdateForm()`.
   */
  private async initUpdateForm(req: Request, res: Response): Promise<void> {
    const owner: Owner = res.locals.owner;
    const pet: Pet = res.locals.pet; // Loaded pet from middleware
    const petTypes: PetType[] = res.locals.petTypes;

    res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
      t: req.t,
      activeMenu: 'owners',
      isNew: false,
      owner: owner,
      pet: pet,
      petTypes: petTypes,
      message: req.query.message,
      error: req.query.error,
    });
  }

  /**
   * Processes the form submission for updating an existing pet.
   * Mimics `public String processUpdateForm(...)`.
   */
  private async processUpdateForm(req: Request, res: Response): Promise<void> {
    const owner: Owner = res.locals.owner;
    const pet: Pet = res.locals.pet; // Original pet object from middleware
    const petTypes: PetType[] = res.locals.petTypes;
    const petData = plainToInstance(PetDto, req.body);

    const validationErrors = await validate(petData);

    // Custom validation logic from PetController.java
    // Mimics `if (StringUtils.hasText(petName)) { Pet existingPet = owner.getPet(petName, false); ... }`
    if (petData.name) {
      const existingPetWithSameName = owner.getPet(petData.name, false);
      if (existingPetWithSameName && existingPetWithSameName.id !== pet.id) {
        validationErrors.push({
          property: 'name',
          constraints: { duplicate: 'already exists' },
        } as ValidationError);
      }
    }
    // Mimics `if (pet.getBirthDate() != null && pet.getBirthDate().isAfter(currentDate))`
    const birthDate = LocalDate.parse(petData.birthDate);
    const currentDate = LocalDate.now();
    if (birthDate.isAfter(currentDate)) {
      validationErrors.push({
        property: 'birthDate',
        constraints: { typeMismatch: 'typeMismatch.birthDate' },
      } as ValidationError);
    }

    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        if (err.property && err.constraints) {
          errorMap[err.property] = Object.values(err.constraints)[0];
        }
      });
      return res.render(VIEWS_PETS_CREATE_OR_UPDATE_FORM, {
        t: req.t,
        activeMenu: 'owners',
        isNew: false,
        owner: owner,
        pet: { ...pet, ...req.body }, // Merge original pet with submitted data for form pre-fill
        petTypes: petTypes,
        errors: errorMap,
        error: req.t('petUpdateError') || 'There was an error in editing the pet.',
      });
    }

    // Update pet details, mimicking `updatePetDetails` method
    pet.name = petData.name;
    pet.birthDate = petData.birthDate;
    const selectedType = await this.petTypeService.getPetTypeByName(petData.type);
    if (selectedType) {
        pet.type = selectedType;
        pet.typeId = selectedType.id;
    } else {
        // Handle case where type is somehow invalid (should be caught by validation)
        return res.status(400).render('error', { t: req.t, status: 400, message: `Invalid pet type: ${petData.type}` });
    }

    await this.ownerService.saveOwner(owner); // Cascades save to updated pet

    res.redirect(`/owners/${owner.id}?message=${encodeURIComponent(req.t('petDetailsUpdated'))}`);
  }
}

// Export an instance of the controller
import { ownerService } from '../services/OwnerService';
import { petService, petTypeService } from '../services/PetService';
import { ValidationError } from 'class-validator';
export const petController = new PetController(ownerService, petService, petTypeService);
