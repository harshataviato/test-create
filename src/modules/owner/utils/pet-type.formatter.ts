import { Injectable, BadRequestException } from '@nestjs/common';
import { PetTypeRepository } from '../pet-type.repository';
import { PetType } from '../entities/pet-type.entity';
import { I18nService } from 'nestjs-i18n';

/**
 * PetTypeFormatter is responsible for converting between `PetType` objects and their string representations.
 * This is useful for form submissions where pet types are selected by name.
 */
@Injectable()
export class PetTypeFormatter {
  constructor(
    private readonly petTypeRepository: PetTypeRepository,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Converts a `PetType` object to its string representation (its name).
   * @param petType The `PetType` object to convert.
   * @param lang The language locale for formatting (not directly used for PetType name, but common formatter parameter).
   * @returns The name of the pet type, or "<null>" if the name is not set.
   */
  print(petType: PetType, lang: string): string {
    return petType.name ?? '<null>';
  }

  /**
   * Parses a string representation (pet type name) into a `PetType` object.
   * It searches the repository for a matching pet type by name.
   * @param text The string name of the pet type to parse.
   * @param lang The language locale for error messages.
   * @returns A Promise that resolves to the found `PetType` object.
   * @throws BadRequestException if the pet type is not found.
   */
  async parse(text: string, lang: string): Promise<PetType> {
    const findPetTypes = await this.petTypeRepository.findPetTypes();
    const foundType = findPetTypes.find((type) => type.name === text);

    if (foundType) {
      return foundType;
    }

    // If type not found, throw an error with a translated message
    throw new BadRequestException(
      this.i18n.translate('messages.typeNotFound', { lang, args: { type: text } }),
    );
  }
}
