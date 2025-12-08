import { Controller, Get, Render, Query, Logger, UseInterceptors, CacheInterceptor, Session, Req } from '@nestjs/common';
import { VetService } from './vet.service';
import { VetListDto } from './dto/vet-list.dto';
import { I18nService } from 'nestjs-i18n';
import { Request } from 'express';


/**
 * Controller for handling veterinarian-related operations.
 * Manages the retrieval and listing of veterinarians, supporting pagination and caching.
 */
@Controller()
export class VetController {
  private readonly logger = new Logger(VetController.name);

  constructor(private readonly vetService: VetService, private readonly i18n: I18nService) {}

  /**
   * Displays a paginated list of veterinarians in HTML format.
   * Renders the `vets/vetList` template.
   *
   * @param page The current page number (defaults to 1).
   * @returns An object containing the list of vets and pagination details for the view.
   */
  @Get('vets.html')
  @Render('vets/vetList')
  @UseInterceptors(CacheInterceptor) // Cache the response for this endpoint
  async showVetListHtml(
    @Query('page') page: number = 1,
    @Session() session: Record<string, any>,
    @Req() req: Request,
  ): Promise<any> {
    const pageSize = 5; // Define page size
    const paginatedVets = await this.vetService.findAllPaginated(page, pageSize);

    // Prepare data for the EJS template
    return {
      listVets: paginatedVets.items,
      currentPage: paginatedVets.meta.currentPage,
      totalPages: paginatedVets.meta.totalPages,
      totalItems: paginatedVets.meta.totalItems,
      // Pass translated labels for the view
      nameLabel: this.i18n.translate('messages.name', { lang: req.i18nLang }),
      specialtiesLabel: this.i18n.translate('messages.specialties', { lang: req.i18nLang }),
      noneLabel: this.i18n.translate('messages.none', { lang: req.i18nLang }),
      pagesLabel: this.i18n.translate('messages.pages', { lang: req.i18nLang }),
      firstLabel: this.i18n.translate('messages.first', { lang: req.i18nLang }),
      nextLabel: this.i18n.translate('messages.next', { lang: req.i18nLang }),
      previousLabel: this.i18n.translate('messages.previous', { lang: req.i18nLang }),
      lastLabel: this.i18n.translate('messages.last', { lang: req.i18nLang }),
    };
  }

  /**
   * Retrieves a list of all veterinarians in JSON format.
   * This is an API endpoint, returning structured data.
   *
   * @returns A `VetListDto` object containing a list of `Vet` entities.
   */
  @Get('vets')
  @UseInterceptors(CacheInterceptor) // Cache the response for this endpoint
  async showResourcesVetList(): Promise<VetListDto> {
    const vets = await this.vetService.findAll();
    const vetListDto = new VetListDto();
    vetListDto.vetList = vets;
    return vetListDto;
  }
}
