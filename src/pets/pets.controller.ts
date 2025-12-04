import {
  Controller,
  Get,
  Post,
  Put,
  Render,
  Body,
  Param,
  Redirect,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  UseFilters,
} from '@nestjs/common';
import { OwnersService } from '../owners/owners.service';
import { PetTypePipe } from '../owners/pet-type.pipe';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { HttpExceptionFilter } from '../system/http-exception.filter';
import { I18n, I18nContext } from 'nestjs-i18n';
import * as dayjs from 'dayjs';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * @module Pets
 * @description
 * Controller for managing pet-related requests within the context of an owner.
 * Handles creation and updating of pets.
 * This controller is analogous to Spring PetClinic's `PetController`.
 */
@Controller('owners/:ownerId/pets')
@UseFilters(HttpExceptionFilter) // Apply the custom exception filter to handle rendering errors
export class PetsController {
  private readonly VIEWS_PETS_CREATE_OR_UPDATE_FORM = 'pets/create-or-update-pet-form';

  constructor(
    private readonly ownersService: OwnersService,
    private readonly petTypePipe: PetTypePipe, // Inject PetTypePipe for transformation
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Initializes the pet creation form for a specific owner.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<object>} An object containing the owner, a new `CreatePetDto`,
   *                           available pet types, and i18n messages for the form.
   * @throws {HttpException} If the owner is not found.
   */
  @Get('new')
  @Render(this.VIEWS_PETS_CREATE_OR_UPDATE_FORM)
  async initCreationForm(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @I18n() i18n: I18nContext,
  ): Promise<object> {
    try {
      const owner = await this.ownersService.findOwnerById(ownerId);
      const types = await this.ownersService.findAllPetTypes();
      return {
        owner,
        pet: new CreatePetDto(), // Provide an empty DTO for the form
        types,
        currentMenu: 'owners',
        // Pass i18n messages to the template
        new: i18n.t('new'),
        petTitle: i18n.t('pet'),
        ownerLabel: i18n.t('owner'),
        name: i18n.t('name'),
        birthDate: i18n.t('birthDate'),
        type: i18n.t('type'),
        addPet: i18n.t('addNewPet'),
        updatePet: i18n.t('updatePet'),
        error: '',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Processes the pet creation form.
   * If validation succeeds, it creates and saves the new pet, then redirects to the owner's details page.
   * Handles duplicate pet names and invalid birth dates.
   * If validation fails, it re-renders the form with error messages.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {CreatePetDto} createPetDto - Data submitted for the new pet.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<any>} A redirection object or template rendering context.
   * @throws {HttpException} For invalid data or business rule violations.
   */
  @Post('new')
  @Redirect('/owners/:ownerId')
  async processCreationForm(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Body() createPetDto: CreatePetDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    try {
      // Custom validation: birthDate cannot be in the future
      const birthDate = dayjs(createPetDto.birthDate);
      if (birthDate.isValid() && birthDate.isAfter(dayjs())) {
        throw new HttpException(i18n.t('typeMismatch.birthDate'), HttpStatus.BAD_REQUEST);
      }

      await this.ownersService.createPet(ownerId, createPetDto);
      // Clear relevant cache entries after a successful write operation
      await this.cacheManager.del('/owners'); // Invalidate all owners list
      await this.cacheManager.del(`/owners/${ownerId}`); // Invalidate specific owner details
      return { url: `/owners/${ownerId}`, message: i18n.t('new') + ' ' + i18n.t('pet') + ' has been Added' };
    } catch (error) {
      const types = await this.ownersService.findAllPetTypes();
      const owner = await this.ownersService.findOwnerById(ownerId);
      const errorMsg = i18n.t(error.message) || error.message;

      // Re-render the form with errors and flash message
      return {
        template: this.VIEWS_PETS_CREATE_OR_UPDATE_FORM,
        data: {
          owner,
          pet: createPetDto,
          types,
          currentMenu: 'owners',
          new: i18n.t('new'),
          petTitle: i18n.t('pet'),
          ownerLabel: i18n.t('owner'),
          name: i18n.t('name'),
          birthDate: i18n.t('birthDate'),
          type: i18n.t('type'),
          addPet: i18n.t('addNewPet'),
          updatePet: i18n.t('updatePet'),
          error: errorMsg,
        },
      };
    }
  }

  /**
   * Initializes the pet update form for a specific pet.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet to update.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<object>} An object containing the owner, pet data, available pet types,
   *                           and i18n messages for the form.
   * @throws {HttpException} If the owner or pet is not found.
   */
  @Get(':petId/edit')
  @Render(this.VIEWS_PETS_CREATE_OR_UPDATE_FORM)
  async initUpdateForm(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Param('petId', ParseIntPipe) petId: number,
    @I18n() i18n: I18nContext,
  ): Promise<object> {
    try {
      const owner = await this.ownersService.findOwnerById(ownerId);
      const pet = await this.ownersService.findPetByOwnerAndId(ownerId, petId);
      const types = await this.ownersService.findAllPetTypes();

      return {
        owner,
        pet: {
          id: pet.id,
          name: pet.name,
          birthDate: dayjs(pet.birthDate).format('YYYY-MM-DD'), // Format for date input
          type: pet.type.name, // Pass the name of the type for selection
        } as UpdatePetDto,
        types,
        currentMenu: 'owners',
        new: i18n.t('new'),
        petTitle: i18n.t('pet'),
        ownerLabel: i18n.t('owner'),
        name: i18n.t('name'),
        birthDate: i18n.t('birthDate'),
        type: i18n.t('type'),
        addPet: i18n.t('addNewPet'),
        updatePet: i18n.t('updatePet'),
        error: '',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Processes the pet update form.
   * If validation succeeds, it updates the pet and redirects to the owner's details page.
   * Handles duplicate pet names and invalid birth dates.
   * If validation fails, it re-renders the form with error messages.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet being updated.
   * @param {UpdatePetDto} updatePetDto - Data submitted for updating the pet.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<any>} A redirection object or template rendering context.
   * @throws {HttpException} For invalid data or business rule violations.
   */
  @Post(':petId/edit')
  @Redirect('/owners/:ownerId')
  async processUpdateForm(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Param('petId', ParseIntPipe) petId: number,
    @Body() updatePetDto: UpdatePetDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    try {
      // Custom validation: birthDate cannot be in the future
      const birthDate = dayjs(updatePetDto.birthDate);
      if (birthDate.isValid() && birthDate.isAfter(dayjs())) {
        throw new HttpException(i18n.t('typeMismatch.birthDate'), HttpStatus.BAD_REQUEST);
      }

      await this.ownersService.updatePet(ownerId, petId, updatePetDto);
      // Clear relevant cache entries after a successful write operation
      await this.cacheManager.del('/owners'); // Invalidate all owners list
      await this.cacheManager.del(`/owners/${ownerId}`); // Invalidate specific owner details
      return { url: `/owners/${ownerId}`, message: i18n.t('pet') + ' details has been edited' };
    } catch (error) {
      const owner = await this.ownersService.findOwnerById(ownerId);
      const types = await this.ownersService.findAllPetTypes();
      const errorMsg = i18n.t(error.message) || error.message;

      // Re-render the form with errors and flash message
      return {
        template: this.VIEWS_PETS_CREATE_OR_UPDATE_FORM,
        data: {
          owner,
          pet: { ...updatePetDto, id: petId },
          types,
          currentMenu: 'owners',
          new: i18n.t('new'),
          petTitle: i18n.t('pet'),
          ownerLabel: i18n.t('owner'),
          name: i18n.t('name'),
          birthDate: i18n.t('birthDate'),
          type: i18n.t('type'),
          addPet: i18n.t('addNewPet'),
          updatePet: i18n.t('updatePet'),
          error: errorMsg,
        },
      };
    }
  }
}
