import { Column } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from './base.entity';

/**
 * NamedEntity extends BaseEntity by adding a `name` property.
 * This is a common base class for entities that primarily identified by a name,
 * such as PetType or Specialty.
 */
export abstract class NamedEntity extends BaseEntity {
  /**
   * The name of the entity.
   * This field cannot be blank and must be a string.
   * @example "Dog"
   */
  @Column({ name: 'name', length: 80 })
  @IsString({ message: 'name.invalid' })
  @IsNotEmpty({ message: 'name.required' })
  name: string;

  /**
   * Returns a string representation of the entity, using its name.
   * If the name is null, it returns "<null>".
   * @returns The name of the entity or "<null>".
   */
  toString(): string {
    return this.name ?? '<null>';
  }
}
