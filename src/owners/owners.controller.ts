import {
  Controller,
  Get,
  Post,
  Put,
  Render,
  Body,
  Param,
  Redirect,
  Query,
  UseFilters,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  UseInterceptors,
  CacheInterceptor,
  Inject,
} from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { HttpExceptionFilter } from '../system/http-exception.filter';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Owner } from './entities/owner.entity';
import { PaginatedResult } from '../common/pagination.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

/**
 * @module Owners
 * @description
 * Controller for managing owner-related requests.
 * Handles creation, searching, updating, and displaying details of owners.
 * This controller is analogous to Spring PetClinic's `OwnerController`.
 */
@Controller('owners')
@UseFilters(HttpExceptionFilter) // Apply the custom exception filter to handle rendering errors
export class OwnersController {
  private readonly VIEWS_OWNER_CREATE_OR_UPDATE_FORM = 'owners/create-or-update-owner-form';
  private readonly PAGE_SIZE = 5; // Number of owners per page for pagination

  constructor(
    private readonly ownersService: OwnersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Initializes the owner creation form.
   *
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {object} An object containing a new `CreateOwnerDto` and i18n messages for the form.
   */
  @Get('new')
  @Render(this.VIEWS_OWNER_CREATE_OR_UPDATE_FORM)
  initCreationForm(@I18n() i18n: I18nContext): object {
    return {
      owner: new CreateOwnerDto(),
      currentMenu: 'owners',
      // Pass i18n messages for form fields and button
      firstName: i18n.t('firstName'),
      lastName: i18n.t('lastName'),
      address: i18n.t('address'),
      city: i18n.t('city'),
      telephone: i18n.t('telephone'),
      addOwner: i18n.t('addOwner'),
      updateOwner: i18n.t('updateOwner'),
      ownerTitle: i18n.t('owner'),
      error: '',
    };
  }

  /**
   * Processes the owner creation form.
   * If validation succeeds, it saves the new owner and redirects to their details page.
   * If validation fails, it re-renders the form with error messages.
   *
   * @param {CreateOwnerDto} createOwnerDto - Data submitted for the new owner.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<any>} A redirection object or template rendering context.
   */
  @Post('new')
  @Redirect('/owners/:id') // Redirect to the owner's details page after creation
  async processCreationForm(@Body() createOwnerDto: CreateOwnerDto, @I18n() i18n: I18nContext): Promise<any> {
    try {
      const newOwner = await this.ownersService.createOwner(createOwnerDto);
      // Clear relevant cache entries after a successful write operation
      await this.cacheManager.del('/owners'); // Invalidate all owners list
      await this.cacheManager.del(`/owners/${newOwner.id}`); // Invalidate specific owner details
      return { url: `/owners/${newOwner.id}`, message: i18n.t('new') + ' ' + i18n.t('owner') + ' Created' };
    } catch (error) {
      // Re-render the form with errors and flash message
      return {
        template: this.VIEWS_OWNER_CREATE_OR_UPDATE_FORM,
        data: {
          owner: createOwnerDto,
          currentMenu: 'owners',
          firstName: i18n.t('firstName'),
          lastName: i18n.t('lastName'),
          address: i18n.t('address'),
          city: i18n.t('city'),
          telephone: i18n.t('telephone'),
          addOwner: i18n.t('addOwner'),
          updateOwner: i18n.t('updateOwner'),
          ownerTitle: i18n.t('owner'),
          error: i18n.t('error') + ': ' + (i18n.t(error.message) || error.message),
        },
      };
    }
  }

  /**
   * Initializes the owner search form.
   *
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {object} An object containing a new `Owner` instance for binding and i18n messages.
   */
  @Get('find')
  @Render('owners/find-owners')
  initFindForm(@I18n() i18n: I18nContext): object {
    return {
      owner: new Owner(),
      currentMenu: 'owners',
      // Pass i18n messages to the template
      lastName: i18n.t('lastName'),
      findOwner: i18n.t('findOwner'),
      addOwner: i18n.t('addOwner'),
      findOwnersTitle: i18n.t('findOwners'),
    };
  }

  /**
   * Processes the owner search form.
   * If a single owner is found, redirects to their details page.
   * If multiple owners are found, displays a list.
   * If no owners are found, re-renders the search form with an error.
   *
   * @param {number} page - The current page number, defaults to 1.
   * @param {string} lastName - The last name (or a prefix) to search for.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<any>} A redirection object or template rendering context.
   */
  @Get()
  async processFindForm(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('lastName') lastName: string = '', // Allow parameterless GET
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    const paginationOptions = { page, limit: this.PAGE_SIZE };
    const paginatedResult: PaginatedResult<Owner> = await this.ownersService.findOwnersByLastName(
      lastName,
      paginationOptions,
    );

    if (paginatedResult.totalItems === 0) {
      // No owners found
      return {
        template: 'owners/find-owners',
        data: {
          owner: { lastName }, // Pass back the search term
          currentMenu: 'owners',
          lastName: i18n.t('lastName'),
          findOwner: i18n.t('findOwner'),
          addOwner: i18n.t('addOwner'),
          findOwnersTitle: i18n.t('findOwners'),
          error: i18n.t('lastName') + ' ' + i18n.t('notFound'),
        },
      };
    }

    if (paginatedResult.totalItems === 1) {
      // One owner found, redirect to owner details
      return { url: `/owners/${paginatedResult.items[0].id}` };
    }

    // Multiple owners found, display list
    return {
      template: 'owners/owners-list',
      data: {
        listOwners: paginatedResult.items,
        currentPage: paginatedResult.currentPage,
        totalPages: paginatedResult.totalPages,
        totalItems: paginatedResult.totalItems,
        currentMenu: 'owners',
        // Pass i18n messages to the template
        ownersTitle: i18n.t('owners'),
        name: i18n.t('name'),
        address: i18n.t('address'),
        city: i18n.t('city'),
        telephone: i18n.t('telephone'),
        pets: i18n.t('pets'),
        pages: i18n.t('pages'),
        first: i18n.t('first'),
        next: i18n.t('next'),
        previous: i18n.t('previous'),
        last: i18n.t('last'),
      },
    };
  }

  /**
   * Initializes the owner update form.
   *
   * @param {number} ownerId - The ID of the owner to update.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<object>} An object containing the owner's data and i18n messages for the form.
   * @throws {HttpException} If the owner is not found.
   */
  @Get(':ownerId/edit')
  @Render(this.VIEWS_OWNER_CREATE_OR_UPDATE_FORM)
  async initUpdateOwnerForm(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @I18n() i18n: I18nContext,
  ): Promise<object> {
    try {
      const owner = await this.ownersService.findOwnerById(ownerId);
      return {
        owner,
        currentMenu: 'owners',
        // Pass i18n messages for form fields and button
        firstName: i18n.t('firstName'),
        lastName: i18n.t('lastName'),
        address: i18n.t('address'),
        city: i18n.t('city'),
        telephone: i18n.t('telephone'),
        addOwner: i18n.t('addOwner'),
        updateOwner: i18n.t('updateOwner'),
        ownerTitle: i18n.t('owner'),
        error: '',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Processes the owner update form.
   * If validation succeeds, it updates the owner and redirects to their details page.
   * If validation fails, it re-renders the form with error messages.
   *
   * @param {number} ownerId - The ID of the owner being updated.
   * @param {UpdateOwnerDto} updateOwnerDto - Data submitted for updating the owner.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<any>} A redirection object or template rendering context.
   */
  @Post(':ownerId/edit')
  @Redirect('/owners/:ownerId')
  async processUpdateOwnerForm(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Body() updateOwnerDto: UpdateOwnerDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    try {
      // Ensure the ID in the DTO matches the path variable
      if (updateOwnerDto.id && updateOwnerDto.id !== ownerId) {
        throw new Error('ID mismatch. The owner ID in the form does not match the URL.');
      }
      // Explicitly set the ID from the path, as DTO might not contain it or it might be mismatched
      (updateOwnerDto as any).id = ownerId; // Cast to any to set ID, or adjust DTO
      await this.ownersService.updateOwner(ownerId, updateOwnerDto);
      // Clear relevant cache entries after a successful write operation
      await this.cacheManager.del('/owners'); // Invalidate all owners list
      await this.cacheManager.del(`/owners/${ownerId}`); // Invalidate specific owner details
      return { url: `/owners/${ownerId}`, message: i18n.t('owner') + ' Values Updated' };
    } catch (error) {
      const errorMsg = i18n.t(error.message) || error.message;
      return {
        template: this.VIEWS_OWNER_CREATE_OR_UPDATE_FORM,
        data: {
          owner: { ...updateOwnerDto, id: ownerId }, // Pass back current data with ID
          currentMenu: 'owners',
          firstName: i18n.t('firstName'),
          lastName: i18n.t('lastName'),
          address: i18n.t('address'),
          city: i18n.t('city'),
          telephone: i18n.t('telephone'),
          addOwner: i18n.t('addOwner'),
          updateOwner: i18n.t('updateOwner'),
          ownerTitle: i18n.t('owner'),
          error: errorMsg,
        },
      };
    }
  }

  /**
   * Displays the details of a single owner, including their pets and visits.
   * Uses `@Render` to specify the Handlebars template.
   * Caches the result to improve performance for frequent access.
   *
   * @param {number} ownerId - The ID of the owner to display.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<object>} An object containing the owner's data and i18n messages for the `owner-details.hbs` template.
   * @throws {HttpException} If the owner is not found.
   */
  @Get(':ownerId')
  @Render('owners/owner-details')
  @UseInterceptors(CacheInterceptor) // Cache this endpoint's response
  async showOwner(@Param('ownerId', ParseIntPipe) ownerId: number, @I18n() i18n: I18nContext): Promise<object> {
    try {
      const owner = await this.ownersService.findOwnerById(ownerId);
      return {
        owner,
        currentMenu: 'owners',
        // Pass i18n messages to the template
        ownerInformation: i18n.t('ownerInformation'),
        name: i18n.t('name'),
        address: i18n.t('address'),
        city: i18n.t('city'),
        telephone: i18n.t('telephone'),
        editOwner: i18n.t('editOwner'),
        addNewPet: i18n.t('addNewPet'),
        petsAndVisits: i18n.t('petsAndVisits'),
        birthDate: i18n.t('birthDate'),
        type: i18n.t('type'),
        visitDate: i18n.t('visitDate'),
        description: i18n.t('description'),
        editPet: i18n.t('editPet'),
        addVisit: i18n.t('addVisit'),
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
