import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

/**
 * DTO for creating a new Owner.
 * Contains validation rules for owner properties.
 */
export class CreateOwnerDto {
  /**
   * The first name of the owner.
   * Must not be empty and must be a string.
   */
  @IsString({ message: 'firstName.invalid' })
  @IsNotEmpty({ message: 'firstName.required' })
  firstName: string;

  /**
   * The last name of the owner.
   * Must not be empty and must be a string.
   */
  @IsString({ message: 'lastName.invalid' })
  @IsNotEmpty({ message: 'lastName.required' })
  lastName: string;

  /**
   * The address of the owner.
   * Must not be empty and must be a string.
   */
  @IsString({ message: 'address.invalid' })
  @IsNotEmpty({ message: 'address.required' })
  address: string;

  /**
   * The city of the owner.
   * Must not be empty and must be a string.
   */
  @IsString({ message: 'city.invalid' })
  @IsNotEmpty({ message: 'city.required' })
  city: string;

  /**
   * The telephone number of the owner.
   * Must not be empty and must be a 10-digit numeric string.
   */
  @IsString({ message: 'telephone.invalid' })
  @IsNotEmpty({ message: 'telephone.required' })
  @Matches(/^\d{10}$/, { message: 'telephone.invalid' }) // Matches 10 digits
  telephone: string;
}
