import { IsDateString, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

/**
 * @module Pets
 * @description
 * Data Transfer Object (DTO) for creating a new `Pet`.
 * This DTO defines the expected structure and validation rules
 * for incoming data when creating a pet.
 */
export class CreatePetDto {
  /**
   * The name of the pet.
   * Required and must be a string with a maximum length of 30 characters.
   */
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(30)
  name: string;

  /**
   * The birth date of the pet.
   * Required and must be a valid date string in 'YYYY-MM-DD' format.
   * The error message 'typeMismatch.birthDate' is intended for i18n lookup.
   */
  @IsDateString({}, { message: 'typeMismatch.birthDate' }) // Validates as a date string
  @IsNotEmpty({ message: 'Birth Date is required' })
  birthDate: string;

  /**
   * The type of the pet (e.g., 'cat', 'dog').
   * This is expected to be a string that can be used to look up a `PetType` entity.
   * Required and must be a string with a maximum length of 80 characters.
   */
  @IsString()
  @IsNotEmpty({ message: 'Type is required' })
  @MaxLength(80)
  type: string; // Represented as string name for form submission
}
