import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PetType } from '../entities/pet-type.entity';

/**
 * DTO for creating a new Pet.
 * Contains validation rules for pet properties.
 */
export class CreatePetDto {
  /**
   * The name of the pet.
   * Must not be empty and must be a string.
   */
  @IsString({ message: 'name.invalid' })
  @IsNotEmpty({ message: 'name.required' })
  name: string;

  /**
   * The birth date of the pet.
   * Must be a valid date string (e.g., "YYYY-MM-DD") and not in the future.
   * We use `IsDateString` for string-based date validation and a custom validator or logic
   * in the controller/service to check if it's not in the future.
   */
  @IsDateString({}, { message: 'birthDate.invalid' })
  @IsNotEmpty({ message: 'birthDate.required' })
  birthDate: string; // Use string for DTO, convert to Date/LocalDate in service if needed

  /**
   * The type of the pet. This should be an object containing at least the 'id' of the PetType.
   * Or, if received as a string name, it will be validated and converted by PetTypeFormatter.
   * In DTOs for nested objects, we usually expect an ID or a nested DTO.
   * For this application, we expect the name as a string and the formatter handles conversion.
   */
  @IsNotEmpty({ message: 'type.required' })
  @Type(() => PetType) // Use class-transformer to potentially transform to PetType object
  type: PetType; // This will actually be a string from the form, handled by PetTypeFormatter
}
