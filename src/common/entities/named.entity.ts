import { Column } from 'typeorm';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { BaseEntity } from './base.entity';

/**
 * @module Common
 * @description
 * Extends `BaseEntity` by adding a `name` property.
 * This is useful for domain objects that primarily need an ID and a name.
 */
export abstract class NamedEntity extends BaseEntity {
  /**
   * The name of the entity.
   * This field is mapped to a 'name' column in the database.
   * It cannot be blank and has a maximum length of 80 characters, as per Spring PetClinic's convention.
   */
  @Column({ name: 'name', length: 80 })
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be blank' })
  @MaxLength(80) // Assuming max length based on database schemas in Java
  name: string;

  /**
   * Returns the string representation of the entity, which is its name.
   * If the name is null, it returns "<null>".
   *
   * @returns {string} The name of the entity or "<null>".
   */
  toString(): string {
    return this.name || '<null>';
  }
}
