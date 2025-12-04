import {
  Controller,
  Get,
  Post,
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
import { CreateVisitDto } from './dto/create-visit.dto';
import { HttpExceptionFilter } from '../system/http-exception.filter';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';

/**
 * @module Visits
 * @description
 * Controller for managing pet visits.
 * Handles displaying the visit creation form and processing new visit submissions.
 * This controller is analogous to Spring PetClinic's `VisitController`.
 */
@Controller('owners/:ownerId/pets/:petId/visits')
@UseFilters(HttpExceptionFilter) // Apply the custom exception filter to handle rendering errors
export class VisitsController {
  private readonly VIEWS_PETS_CREATE_OR_UPDATE_VISIT_FORM = 'pets/create-or-update-visit-form';

  constructor(
    private readonly ownersService: OwnersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Initializes the new visit form for a specific pet.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet for which the visit is being created.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<object>} An object containing the owner, pet, a new `CreateVisitDto`,
   *                           and i18n messages for the form.
   * @throws {HttpException} If the owner or pet is not found.
   */
  @Get('new')
  @Render(this.VIEWS_PETS_CREATE_OR_UPDATE_VISIT_FORM)
  async initNewVisitForm(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Param('petId', ParseIntPipe) petId: number,
    @I18n() i18n: I18nContext,
  ): Promise<object> {
    try {
      const owner = await this.ownersService.findOwnerById(ownerId);
      const pet = owner.getPet(petId);

      if (!pet) {
        throw new HttpException(`Pet with ID ${petId} not found for owner with ID ${ownerId}.`, HttpStatus.NOT_FOUND);
      }

      return {
        owner,
        pet,
        visit: { date: dayjs().format('YYYY-MM-DD') } as CreateVisitDto, // Default date to today
        currentMenu: 'owners',
        // Pass i18n messages to the template
        new: i18n.t('new'),
        petTitle: i18n.t('pet'),
        name: i18n.t('name'),
        birthDate: i18n.t('birthDate'),
        type: i18n.t('type'),
        ownerLabel: i18n.t('owner'),
        date: i18n.t('date'),
        description: i18n.t('description'),
        addVisit: i18n.t('addVisit'),
        previousVisits: i18n.t('previousVisits'),
        error: '',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Processes the new visit form submission for a specific pet.
   * If validation succeeds, it adds the visit to the pet and redirects to the owner's details page.
   * If validation fails, it re-renders the form with error messages.
   *
   * @param {number} ownerId - The ID of the owner.
   * @param {number} petId - The ID of the pet.
   * @param {CreateVisitDto} createVisitDto - Data submitted for the new visit.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<any>} A redirection object or template rendering context.
   * @throws {HttpException} For invalid data or if owner/pet is not found.
   */
  @Post('new')
  @Redirect('/owners/:ownerId')
  async processNewVisitForm(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Param('petId', ParseIntPipe) petId: number,
    @Body() createVisitDto: CreateVisitDto,
    @I18n() i18n: I18nContext,
  ): Promise<any> {
    try {
      await this.ownersService.addVisitToPet(ownerId, petId, createVisitDto);
      // Clear relevant cache entries after a successful write operation
      await this.cacheManager.del(`/owners/${ownerId}`); // Invalidate specific owner details
      return { url: `/owners/${ownerId}`, message: i18n.t('your visit has been booked') };
    } catch (error) {
      // If validation or service logic fails, re-render the form
      const owner = await this.ownersService.findOwnerById(ownerId);
      const pet = owner.getPet(petId);
      const errorMsg = i18n.t(error.message) || error.message;

      return {
        template: this.VIEWS_PETS_CREATE_OR_UPDATE_VISIT_FORM,
        data: {
          owner,
          pet,
          visit: createVisitDto,
          currentMenu: 'owners',
          new: i18n.t('new'),
          petTitle: i18n.t('pet'),
          name: i18n.t('name'),
          birthDate: i18n.t('birthDate'),
          type: i18n.t('type'),
          ownerLabel: i18n.t('owner'),
          date: i18n.t('date'),
          description: i18n.t('description'),
          addVisit: i18n.t('addVisit'),
          previousVisits: i18n.t('previousVisits'),
          error: errorMsg,
        },
      };
    }
  }
}
