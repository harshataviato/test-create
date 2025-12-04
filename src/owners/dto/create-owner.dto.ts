import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

/**
 * @module Owners
 * @description
 * Data Transfer Object (DTO) for creating a new `Owner`.
 * This DTO defines the expected structure and validation rules
 * for incoming data when creating an owner.
 */
export class CreateOwnerDto {
  /**
   * The first name of the owner.
   * Required and must be a string with a maximum length of 30 characters.
   */
  @IsString()
  @IsNotEmpty({ message: 'First name cannot be blank' })
  @MaxLength(30)
  firstName: string;

  /**
   * The last name of the owner.
   * Required and must be a string with a maximum length of 30 characters.
   */
  @IsString()
  @IsNotEmpty({ message: 'Last name cannot be blank' })
  @MaxLength(30)
  lastName: string;

  /**
   * The address of the owner.
   * Required and must be a string with a maximum length of 255 characters.
   */
  @IsString()
  @IsNotEmpty({ message: 'Address cannot be blank' })
  @MaxLength(255)
  address: string;

  /**
   * The city of the owner.
   * Required and must be a string with a maximum length of 80 characters.
   */
  @IsString()
  @IsNotEmpty({ message: 'City cannot be blank' })
  @MaxLength(80)
  city: string;

  /**
   * The telephone number of the owner.
   * Required, must be a string, and must match a 10-digit number pattern.
   * The error message 'telephone.invalid' is intended for i18n lookup.
   */
  @IsString()
  @IsNotEmpty({ message: 'Telephone cannot be blank' })
  @Matches(/^\d{10}$/, { message: 'telephone.invalid' })
  @MaxLength(20)
  telephone: string;
}
