import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Render,
  Redirect,
  Logger,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
  Session,
  Query,
  Req
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { Owner } from './entities/owner.entity';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';


/**
 * Controller for handling owner-related operations.
 * Manages creation, retrieval, updating, and listing of owners.
 */
@Controller('owners')
export class OwnerController {
  private readonly logger = new Logger(OwnerController.name);

  constructor(private readonly ownerService: OwnerService, private readonly i18n: I18nService) {}

  /**
   * Initializes the owner creation form.
   * Renders the `owners/createOrUpdateOwnerForm` template with an empty Owner object.
   * @returns An object containing an empty Owner instance.
   */
  @Get('new')
  @Render('owners/createOrUpdateOwnerForm')
  initCreationForm(): { owner: Owner } {
    return { owner: new Owner() };
  }

  /**
   * Processes the submission of the owner creation form.
   * If validation passes, saves the new owner and redirects to their details page.
   * If validation fails, re-renders the form with error messages.
   * @param createOwnerDto The data for the new owner.
   * @param session The session object to store flash messages.
   * @returns A redirect command or renders the form again with errors.
   */
  @Post('new')
  @Render('owners/createOrUpdateOwnerForm')
  async processCreationForm(
    @Body() createOwnerDto: CreateOwnerDto,
    @Session() session: Record<string, any>,
    @Req() req: Request,
  ): Promise<any> {
    try {
      const owner = new Owner();
      Object.assign(owner, createOwnerDto); // Assign DTO properties to the entity
      const savedOwner = await this.ownerService.save(owner);
      session.message = this.i18n.translate('messages.newOwner', { lang: req.i18nLang });
      return { redirect: `/owners/${savedOwner.id}` }; // Redirect on success
    } catch (error) {
      this.logger.error('Error creating owner:', error);
      session.error = this.i18n.translate('messages.error', { lang: req.i18nLang });
      return { owner: createOwnerDto, errors: error.response?.message || [error.message] }; // Render form with errors
    }
  }

  /**
   * Initializes the owner search form.
   * Renders the `owners/findOwners` template with an empty Owner object for search criteria.
   * @returns An object containing an empty Owner instance.
   */
  @Get('find')
  @Render('owners/findOwners')
  initFindForm(): { owner: Owner } {
    return { owner: new Owner() };
  }

  /**
   * Processes the owner search form, either by last name or returning all owners.
   * Supports pagination.
   * @param page The current page number (defaults to 1).
   * @param ownerQuery An `Owner` object potentially containing `lastName` for search.
   * @param session The session object for flash messages.
   * @returns Renders `owners/ownersList` with paginated results or `owners/ownerDetails` if only one found.
   */
  @Get()
  @Render('owners/ownersList')
  async processFindForm(
    @Query('page') page = 1,
    @Query() ownerQuery: { lastName?: string }, // Use @Query to directly get query parameters
    @Session() session: Record<string, any>,
    @Req() req: Request,
  ): Promise<any> {
    const lastName = ownerQuery.lastName || ''; // Default to empty string for broadest search
    const pageSize = 5;

    // Retrieve paginated owners based on last name
    const paginatedOwners = await this.ownerService.findByLastNameStartingWith(lastName, page, pageSize);

    if (paginatedOwners.length === 0) {
      // If no owners found, set error and re-render find form
      session.error = this.i18n.translate('messages.notFound', { lang: req.i18nLang, args: { field: this.i18n.translate('messages.lastName', { lang: req.i18nLang }) } });
      return { redirect: '/owners/find' }; // Redirect to find form on no results
    }

    if (paginatedOwners.length === 1 && paginatedOwners[0].id) {
      // If exactly one owner found, redirect to their details page
      return { redirect: `/owners/${paginatedOwners[0].id}` };
    }

    // Multiple owners found, render list with pagination details
    const totalItems = paginatedOwners.meta.totalItems;
    const totalPages = paginatedOwners.meta.totalPages;
    const currentPage = paginatedOwners.meta.currentPage;

    return {
      listOwners: paginatedOwners.items,
      currentPage,
      totalPages,
      totalItems,
      lastName: lastName, // Pass back search criteria for form
      // Pass translated pagination labels
      pagesLabel: this.i18n.translate('messages.pages', { lang: req.i18nLang }),
      firstLabel: this.i18n.translate('messages.first', { lang: req.i18nLang }),
      nextLabel: this.i18n.translate('messages.next', { lang: req.i18nLang }),
      previousLabel: this.i18n.translate('messages.previous', { lang: req.i18nLang }),
      lastLabel: this.i18n.translate('messages.last', { lang: req.i18nLang }),
    };
  }

  /**
   * Initializes the owner update form.
   * Fetches the existing owner by ID and renders the `owners/createOrUpdateOwnerForm` template.
   * @param ownerId The ID of the owner to update.
   * @returns An object containing the Owner instance to be updated.
   * @throws HttpException if the owner is not found.
   */
  @Get(':ownerId/edit')
  @Render('owners/createOrUpdateOwnerForm')
  async initUpdateOwnerForm(@Param('ownerId') ownerId: number): Promise<{ owner: Owner }> {
    const owner = await this.ownerService.findById(ownerId);
    if (!owner) {
      throw new HttpException(`Owner not found with id: ${ownerId}`, HttpStatus.NOT_FOUND);
    }
    return { owner };
  }

  /**
   * Processes the submission of the owner update form.
   * Validates the updated owner data and saves changes.
   * If validation passes, redirects to the owner's details page.
   * If validation fails or ID mismatch, re-renders the form with errors.
   * @param ownerId The ID of the owner being updated.
   * @param updateOwnerDto The updated data for the owner.
   * @param session The session object to store flash messages.
   * @returns A redirect command or renders the form again with errors.
   * @throws HttpException if the owner ID in the form does not match the URL.
   */
  @Post(':ownerId/edit')
  @Render('owners/createOrUpdateOwnerForm')
  async processUpdateOwnerForm(
    @Param('ownerId') ownerId: number,
    @Body() updateOwnerDto: UpdateOwnerDto,
    @Session() session: Record<string, any>,
    @Req() req: Request,
  ): Promise<any> {
    if (updateOwnerDto.id && updateOwnerDto.id !== ownerId) {
      // Simulate Spring's BindingResult.rejectValue for ID mismatch
      session.error = this.i18n.translate('messages.ownerIdMismatch', { lang: req.i18nLang });
      return { redirect: `/owners/${ownerId}/edit` }; // Redirect back with error
    }

    try {
      const existingOwner = await this.ownerService.findById(ownerId);
      if (!existingOwner) {
        throw new HttpException(`Owner not found with id: ${ownerId}`, HttpStatus.NOT_FOUND);
      }
      Object.assign(existingOwner, updateOwnerDto); // Assign updated properties
      const updatedOwner = await this.ownerService.save(existingOwner);
      session.message = this.i18n.translate('messages.updateOwner', { lang: req.i18nLang });
      return { redirect: `/owners/${updatedOwner.id}` };
    } catch (error) {
      this.logger.error('Error updating owner:', error);
      session.error = this.i18n.translate('messages.error', { lang: req.i18nLang });
      return { owner: { ...updateOwnerDto, id: ownerId }, errors: error.response?.message || [error.message] };
    }
  }

  /**
   * Displays the details of a single owner, including their pets and visits.
   * Renders the `owners/ownerDetails` template.
   * @param ownerId The ID of the owner to display.
   * @returns An object containing the Owner instance with associated pets and visits.
   * @throws HttpException if the owner is not found.
   */
  @Get(':ownerId')
  @Render('owners/ownerDetails')
  async showOwner(@Param('ownerId') ownerId: number, @Session() session: Record<string, any>, @Req() req: Request): Promise<any> {
    const owner = await this.ownerService.findOwnerWithPetsAndVisits(ownerId);
    if (!owner) {
      throw new HttpException(this.i18n.translate('messages.ownerNotFound', { lang: req.i18nLang, args: { id: ownerId } }), HttpStatus.NOT_FOUND);
    }
    // Pass flash messages from session to the view
    const message = session.message;
    const error = session.error;
    delete session.message; // Clear message after use
    delete session.error;   // Clear error after use

    // Translate common labels for the view
    const translatedLabels = {
      name: this.i18n.translate('messages.name', { lang: req.i18nLang }),
      address: this.i18n.translate('messages.address', { lang: req.i18nLang }),
      city: this.i18n.translate('messages.city', { lang: req.i18nLang }),
      telephone: this.i18n.translate('messages.telephone', { lang: req.i18nLang }),
      editOwner: this.i18n.translate('messages.editOwner', { lang: req.i18nLang }),
      addNewPet: this.i18n.translate('messages.addNewPet', { lang: req.i18nLang }),
      petsAndVisits: this.i18n.translate('messages.petsAndVisits', { lang: req.i18nLang }),
      birthDate: this.i18n.translate('messages.birthDate', { lang: req.i18nLang }),
      type: this.i18n.translate('messages.type', { lang: req.i18nLang }),
      visitDate: this.i18n.translate('messages.visitDate', { lang: req.i18nLang }),
      description: this.i18n.translate('messages.description', { lang: req.i18nLang }),
      editPet: this.i18n.translate('messages.editPet', { lang: req.i18nLang }),
      addVisit: this.i18n.translate('messages.addVisit', { lang: req.i18nLang }),
      ownerInformation: this.i18n.translate('messages.ownerInformation', { lang: req.i18nLang })
    };

    return { owner, message, error, ...translatedLabels };
  }
}
