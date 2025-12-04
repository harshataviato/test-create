/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file defines the core domain models for the PetClinic application in TypeScript.
// It combines model definitions from `model/BaseEntity`, `model/NamedEntity`, `model/Person`,
// `vet/Vet`, `vet/Specialty`, `owner/Owner`, `owner/Pet`, `owner/PetType`, `owner/Visit`,
// and `vet/Vets` (container for vets).

// These models use TypeORM decorators conceptually, aligning with typical Node.js ORM patterns.
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, JoinColumn, BaseEntity as TypeOrmBaseEntity, ManyToOne, Unique } from 'typeorm';
import { Exclude, Expose, Type } from 'class-transformer'; // For serialization control, similar to JAXB annotations
import { LocalDate } from '@js-joda/core'; // For date handling, equivalent to Java's LocalDate
import { IsNotEmpty, IsString, IsPhoneNumber, Matches, IsOptional, IsDateString, IsNumber } from 'class-validator'; // For validation, mimicking JSR-303 annotations

/**
 * Simple JavaBean domain object with an id property. Used as a base class for objects
 * needing this property.
 * Mimics `org.springframework.samples.petclinic.model.BaseEntity`.
 *
 * @author Ken Krebs
 * @author Juergen Hoeller
 * @author Michael Isvy (TypeScript adaptation)
 */
@Entity() // Conceptual TypeORM entity
export class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  isNew(): boolean {
    return this.id === undefined || this.id === null;
  }
}

/**
 * Simple JavaBean domain object adds a name property to <code>BaseEntity</code>. Used as
 * a base class for objects needing these properties.
 * Mimics `org.springframework.samples.petclinic.model.NamedEntity`.
 *
 * @author Ken Krebs
 * @author Juergen Hoeller
 * @author Wick Dynex
 * @author Michael Isvy (TypeScript adaptation)
 */
@Entity()
@Unique(['name']) // Names are unique for PetType, Specialty
export class NamedEntity extends BaseEntity {
  @Column()
  @IsNotEmpty() // Mimics @NotBlank
  @IsString()
  name: string = '';

  // Getters and Setters (TypeScript properties handle this implicitly)
  // public getName(): string { return this.name; }
  // public setName(name: string) { this.name = name; }

  @Override() // Conceptual override decorator
  toString(): string {
    const name = this.name;
    return (name !== null && name !== undefined) ? name : '<null>';
  }
}

/**
 * Simple JavaBean domain object representing an person.
 * Mimics `org.springframework.samples.petclinic.model.Person`.
 *
 * @author Ken Krebs
 * @author Michael Isvy (TypeScript adaptation)
 */
@Entity()
export class Person extends BaseEntity {
  @Column({ name: 'first_name' })
  @IsNotEmpty() // Mimics @NotBlank
  @IsString()
  firstName: string = '';

  @Column({ name: 'last_name' })
  @IsNotEmpty() // Mimics @NotBlank
  @IsString()
  lastName: string = '';

  // Getters and Setters (TypeScript properties handle this implicitly)
  // public getFirstName(): string { return this.firstName; }
  // public setFirstName(firstName: string) { this.firstName = firstName; }
  // public getLastName(): string { return this.lastName; }
  // public setLastName(lastName: string) { this.lastName = lastName; }
}

/**
 * Models a {@link Vet Vet's} specialty (for example, dentistry).
 * Mimics `org.springframework.samples.petclinic.vet.Specialty`.
 *
 * @author Juergen Hoeller
 * @author Michael Isvy (TypeScript adaptation)
 */
@Entity('specialties') // Table name explicit
export class Specialty extends NamedEntity {
  // No additional properties, inherits name from NamedEntity
}

/**
 * Intermediate entity for the ManyToMany relationship between Vet and Specialty.
 * Mimics the `vet_specialties` join table.
 */
@Entity('vet_specialties')
@Unique(['vetId', 'specialtyId']) // Define composite unique key
export class VetSpecialty extends BaseEntity {
  @Column({ name: 'vet_id', primary: true })
  vetId?: number;

  @Column({ name: 'specialty_id', primary: true })
  specialtyId?: number;

  @ManyToOne(() => Vet, vet => vet.vetSpecialties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vet_id' })
  vet?: Vet;

  @ManyToOne(() => Specialty, specialty => specialty.vetSpecialties, { eager: true, onDelete: 'CASCADE' }) // Eager load specialties
  @JoinColumn({ name: 'specialty_id' })
  specialty?: Specialty;
}


/**
 * Simple JavaBean domain object representing a veterinarian.
 * Mimics `org.springframework.samples.petclinic.vet.Vet`.
 *
 * @author Ken Krebs
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Arjen Poutsma
 * @author Michael Isvy (TypeScript adaptation)
 */
@Entity('vets') // Table name explicit
export class Vet extends Person {
  @OneToMany(() => VetSpecialty, vetSpecialty => vetSpecialty.vet, { cascade: true, eager: true }) // Eager load join table for specialties
  vetSpecialties?: VetSpecialty[];

  @Expose() // Mimics @XmlElement
  get specialties(): Specialty[] {
    return (this.vetSpecialties || [])
      .map(vs => vs.specialty!)
      .filter((s): s is Specialty => s !== undefined)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  @Expose()
  get nrOfSpecialties(): number {
    return this.specialties.length;
  }

  addSpecialty(specialty: Specialty): void {
    if (!this.vetSpecialties) {
      this.vetSpecialties = [];
    }
    const existing = this.specialties.some(s => s.id === specialty.id);
    if (!existing) {
        const vetSpecialty = new VetSpecialty();
        vetSpecialty.specialty = specialty;
        // vetSpecialty.vet = this; // TypeORM handles inverse on save
        this.vetSpecialties.push(vetSpecialty);
    }
  }
}

/**
 * Simple domain object representing a list of veterinarians.
 * Mimics `org.springframework.samples.petclinic.vet.Vets`.
 *
 * @author Arjen Poutsma
 * @author Michael Isvy (TypeScript adaptation)
 */
export class Vets {
  @Type(() => Vet)
  @Expose({ name: 'vetList' }) // Mimics @XmlElement
  private _vets: Vet[] = []; // Internal representation

  public getVetList(): Vet[] {
    return this._vets;
  }

  public setVetList(vets: Vet[]): void {
    this._vets = vets;
  }
}


/**
 * Models a Pet's type (e.g., cat, dog).
 * Mimics `org.springframework.samples.petclinic.owner.PetType`.
 *
 * @author Juergen Hoeller
 * @author Michael Isvy (TypeScript adaptation)
 */
@Entity('types')
export class PetType extends NamedEntity {
  // No additional properties, inherits name from NamedEntity
}

/**
 * Simple JavaBean domain object representing a visit.
 * Mimics `org.springframework.samples.petclinic.owner.Visit`.
 * `LocalDate` is mapped to `string` in TypeORM for YYYY-MM-DD.
 *
 * @author Ken Krebs
 * @author Dave Syer
 * @author Michael Isvy (TypeScript adaptation)
 */
@Entity('visits')
export class Visit extends BaseEntity {
  @Column({ type: 'date', name: 'visit_date' })
  @IsNotEmpty({ message: 'required' }) // Mimics @NotBlank
  @IsDateString({ strict: true }, { message: 'typeMismatch.date' }) // Mimics @DateTimeFormat and date validation
  date: string; // Use string for YYYY-MM-DD format

  @Column()
  @IsNotEmpty({ message: 'required' }) // Mimics @NotBlank
  @IsString()
  description: string = '';

  @Column({ nullable: true, name: 'pet_id' })
  @IsOptional()
  @IsNumber()
  petId?: number; // Raw foreign key column for relationships

  @ManyToOne(() => Pet, pet => pet.visits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pet_id' })
  pet?: Pet; // This is the navigation property

  /**
   * Creates a new instance of Visit for the current date.
   * Mimics `public Visit() { this.date = LocalDate.now(); }`
   */
  constructor() {
    super(); // Call constructor of BaseEntity
    this.date = LocalDate.now().toString(); // Initialize with current date as string
  }

  // Getters and Setters (TypeScript properties handle this implicitly)
  // public getDate(): string { return this.date; }
  // public setDate(date: string) { this.date = date; }
  // public getDescription(): string { return this.description; }
  // public setDescription(description: string) { this.description = description; }
}

/**
 * Simple business object representing a pet.
 * Mimics `org.springframework.samples.petclinic.owner.Pet`.
 *
 * @author Ken Krebs
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Wick Dynex
 * @author Michael Isvy (TypeScript adaptation)
 */
@Entity('pets')
export class Pet extends NamedEntity { // Extends NamedEntity for `name` property
  @Column({ type: 'date', name: 'birth_date' })
  @IsNotEmpty({ message: 'required' })
  @IsDateString({ strict: true }, { message: 'typeMismatch.birthDate' }) // Mimics @DateTimeFormat and date validation
  @Expose({ name: 'birthDate' }) // Ensure property name matches Java model for formatting
  birthDate: string = LocalDate.now().toString();

  @Column({ name: 'type_id' })
  @IsNotEmpty({ message: 'required' }) // Foreign key must be provided
  @IsNumber()
  typeId?: number;

  @ManyToOne(() => PetType, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'type_id' })
  type?: PetType;

  @Column({ nullable: true, name: 'owner_id' })
  @IsOptional()
  @IsNumber()
  ownerId?: number;

  @ManyToOne(() => Owner, owner => owner.pets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner?: Owner; // Inverse side of the relationship

  @OneToMany(() => Visit, visit => visit.pet, { cascade: true, eager: true })
  @Type(() => Visit) // Needed for class-transformer to handle nested Visit objects
  visits: Visit[] = [];

  getVisits(): Visit[] {
    return this.visits.sort((a, b) => a.date.localeCompare(b.date)); // Ensure ASC order
  }

  addVisit(visit: Visit): void {
    if (!this.visits) {
      this.visits = [];
    }
    this.visits.push(visit);
    visit.pet = this;
    visit.petId = this.id; // Explicitly set FK
  }

  // Getters and Setters (TypeScript properties handle this implicitly)
  // public getBirthDate(): string { return this.birthDate; }
  // public setBirthDate(birthDate: string) { this.birthDate = birthDate; }
  // public getType(): PetType | undefined { return this.type; }
  // public setType(type: PetType) { this.type = type; }
  // public getVisits(): Visit[] { return this.visits; }
}

/**
 * Simple JavaBean domain object representing an owner.
 * Mimics `org.springframework.samples.petclinic.owner.Owner`.
 *
 * @author Ken Krebs
 * @author Juergen Hoeller
 * @author Sam Brannen
 * @author Michael Isvy
 * @author Oliver Drotbohm
 * @author Wick Dynex
 * @author Michael Isvy (TypeScript adaptation)
 */
@Entity('owners')
export class Owner extends Person {
  @Column()
  @IsNotEmpty({ message: 'required' }) // Mimics @NotBlank
  @IsString()
  address: string = '';

  @Column()
  @IsNotEmpty({ message: 'required' }) // Mimics @NotBlank
  @IsString()
  city: string = '';

  @Column()
  @IsNotEmpty({ message: 'required' }) // Mimics @NotBlank
  @IsString()
  @Matches(/^\d{10,}$/, { message: 'telephone.invalid' }) // Mimics @Pattern(regexp = "\\d{10}", message = "{telephone.invalid}")
  telephone: string = '';

  @OneToMany(() => Pet, pet => pet.owner, { cascade: true, eager: true })
  @Type(() => Pet) // Needed for class-transformer to handle nested Pet objects
  pets: Pet[] = [];

  addPet(pet: Pet): void {
    if (pet.isNew()) {
      if (!this.pets) {
        this.pets = [];
      }
      this.pets.push(pet);
      pet.owner = this;
      // pet.ownerId = this.id; // TypeORM manages this on save via inverse
    }
  }

  getPet(name: string): Pet | undefined;
  getPet(id: number): Pet | undefined;
  getPet(name: string, ignoreNew: boolean): Pet | undefined; // For getPet(name, ignoreNew) overload
  getPet(arg1: string | number, arg2?: boolean): Pet | undefined {
    if (typeof arg1 === 'string') {
      const name = arg1;
      const ignoreNew = arg2 !== undefined ? arg2 : false; // Default to false if not provided

      for (const pet of this.pets) {
        if (pet.name && pet.name.toLowerCase() === name.toLowerCase()) {
          if (!ignoreNew || !pet.isNew()) {
            return pet;
          }
        }
      }
      return undefined;
    } else { // Assume it's a number (ID)
      const id = arg1;
      for (const pet of this.pets) {
        if (!pet.isNew() && pet.id === id) { // Only return saved pets by ID
          return pet;
        }
      }
      return null; // Java returns null, not undefined, for non-found ID.
    }
  }

  addVisit(petId: number, visit: Visit): void {
    // Assert.notNull(petId, "Pet identifier must not be null!"); // Mimics Java Assert
    // Assert.notNull(visit, "Visit must not be null!"); // Mimics Java Assert

    const pet = this.getPet(petId);

    // Assert.notNull(pet, "Invalid Pet identifier!"); // Mimics Java Assert
    if (!pet) {
        throw new Error(`Invalid Pet identifier: Pet with ID ${petId} not found for owner ${this.id}`);
    }

    pet.addVisit(visit);
  }

  @Override() // Conceptual override decorator
  toString(): string {
    // Mimics ToStringCreator
    return `Owner(id=${this.id}, new=${this.isNew()}, lastName='${this.lastName}', firstName='${this.firstName}', address='${this.address}', city='${this.city}', telephone='${this.telephone}')`;
  }
}
