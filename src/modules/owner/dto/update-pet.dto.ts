import { PartialType } from '@nestjs/mapped-types';
import { CreatePetDto } from './create-pet.dto';
import { IsNumber, IsOptional } from 'class-validator';

/**
 * DTO for updating an existing Pet.
 * Inherits all properties and validations from `CreatePetDto` but makes them optional.
 */
export class UpdatePetDto extends PartialType(CreatePetDto) {
  /**
   * The ID of the pet.
   * This is typically passed in the URL path, but might be present in the body.
   * It's optional here, but crucial for identifying the entity to update.
   */
  @IsOptional()
  @IsNumber({}, { message: 'id.invalid' })
  id?: number;
}
