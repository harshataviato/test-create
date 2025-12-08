import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

/**
 * DTO for creating a new Visit.
 * Contains validation rules for visit properties.
 */
export class CreateVisitDto {
  /**
   * The date of the visit.
   * Must be a valid date string (e.g., "YYYY-MM-DD").
   * Automatically defaults to the current date in the Visit entity constructor.
   */
  @IsDateString({}, { message: 'date.invalid' })
  @IsNotEmpty({ message: 'date.required' })
  date: string; // Use string for DTO, convert to Date/LocalDate in service if needed

  /**
   * The description of the visit.
   * Must not be empty and must be a string.
   */
  @IsString({ message: 'description.invalid' })
  @IsNotEmpty({ message: 'description.required' })
  description: string;
}
