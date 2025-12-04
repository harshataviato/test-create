import { Controller, Get, Render, Query, ParseIntPipe, UseInterceptors, CacheInterceptor, Inject } from '@nestjs/common';
import { VetsService } from './vets.service';
import { VetsDto } from './vets.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * @module Vets
 * @description
 * Controller for managing veterinarian-related requests.
 * Handles displaying a list of vets (both HTML and JSON) and supports pagination for the HTML view.
 * This controller is analogous to Spring PetClinic's `VetController`.
 */
@Controller()
export class VetsController {
  private readonly PAGE_SIZE = 5; // Number of vets per page for pagination

  constructor(
    private readonly vetsService: VetsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, // Inject CacheManager for manual cache operations if needed
  ) {}

  /**
   * Displays a paginated list of veterinarians in HTML format.
   * Uses `@Render` to specify the Handlebars template.
   * Caches the result to improve performance for frequent requests.
   *
   * @param {number} page - The current page number, defaults to 1.
   * @param {I18nContext} i18n - The i18n context for translating messages.
   * @returns {Promise<object>} An object containing data for the `vet-list.hbs` template.
   */
  @Get('vets.html')
  @Render('vets/vet-list') // Renders the 'vets/vet-list.hbs' template
  @UseInterceptors(CacheInterceptor) // Cache this endpoint's response
  async showVetListHtml(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @I18n() i18n: I18nContext,
  ): Promise<object> {
    const paginationOptions = { page, limit: this.PAGE_SIZE };
    const paginatedResult = await this.vetsService.findAllVetsPaginated(paginationOptions);

    return {
      listVets: paginatedResult.items,
      currentPage: paginatedResult.currentPage,
      totalPages: paginatedResult.totalPages,
      totalItems: paginatedResult.totalItems,
      currentMenu: 'vets', // Highlight 'Veterinarians' in the navigation
      // Pass i18n messages to the template
      pages: i18n.t('pages'),
      first: i18n.t('first'),
      next: i18n.t('next'),
      previous: i18n.t('previous'),
      last: i18n.t('last'),
      name: i18n.t('name'),
      specialties: i18n.t('specialties'),
      none: i18n.t('none'),
      vets: i18n.t('vets'),
    };
  }

  /**
   * Retrieves a list of all veterinarians in JSON format.
   * This endpoint is intended for API consumption.
   * Caches the result to improve performance.
   *
   * @returns {Promise<VetsDto>} A `VetsDto` object containing a list of all `Vet`s.
   */
  @Get('vets')
  @UseInterceptors(CacheInterceptor) // Cache this endpoint's response
  async showResourcesVetList(): Promise<VetsDto> {
    const vets = await this.vetsService.findAllVets();
    const vetsDto = new VetsDto();
    vetsDto.setVetList(vets);
    return vetsDto;
  }
}
