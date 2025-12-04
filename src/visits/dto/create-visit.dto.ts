import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * @module Visits
 * @description
 * Data Transfer Object (DTO) for creating a new `Visit`.
 * This DTO defines the expected structure and validation rules
 * for incoming data when creating a visit.
 */
export class CreateVisitDto {
  /**
   * The date of the visit.
   * Required and must be a valid date string in 'YYYY-MM-DD' format.
   * The error message 'typeMismatch.date' is intended for i18n lookup.
   */
  @IsDateString({}, { message: 'typeMismatch.date' }) // Validates as a date string
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  /**
   * A description of the visit.
   * Required and must be a non-empty string with a maximum length of 255 characters.
   */
  @IsString()
  @IsNotEmpty({ message: 'Description cannot be blank' })
  @MaxLength(255)
  description: string;
}
