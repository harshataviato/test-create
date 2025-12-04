/*
 * Copyright 2012-2025 the original author or authors.
 *
 * Licensed under the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is a TypeScript adaptation of ClinicServiceTests.java.
// It uses Jest for integration testing of the data layer.
// It replaces `@DataJpaTest` and `@Transactional` with TypeORM integration
// using an in-memory SQLite database for simplicity, mimicking the "fast feedback"
// of an in-memory DB setup.

import { expect } from '@jest/globals';
import { DataSource, Repository, Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, BaseEntity as TypeOrmBaseEntity } from 'typeorm';
import { LocalDate } from '@js-joda/core';
import { EntityUtils, EntityNotFoundException } from './entity-utils'; // Custom EntityUtils

// --- Conceptual Model Definitions (TypeORM Entities) ---

// BaseEntity from Java, extending TypeORM's BaseEntity if needed for convenience
@Entity()
export class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;
}

@Entity()
export class Specialty extends BaseEntity {
  @Column()
  name: string = '';
}

@Entity()
export class Vet extends BaseEntity {
  @Column()
  firstName: string = '';

  @Column()
  lastName: string = '';

  @OneToMany(() => VetSpecialty, vetSpecialty => vetSpecialty.vet)
  vetSpecialties?: VetSpecialty[]; // Intermediate table for ManyToMany

  // Helper to simulate getSpecialties() and getNrOfSpecialties()
  getSpecialties(): Specialty[] {
    return this.vetSpecialties?.map(vs => vs.specialty!) || [];
  }

  getNrOfSpecialties(): number {
    return this.vetSpecialties?.length || 0;
  }
}

@Entity()
export class VetSpecialty extends BaseEntity {
  @ManyToOne(() => Vet, vet => vet.vetSpecialties)
  @JoinColumn({ name: 'vet_id' })
  vet?: Vet;

  @ManyToOne(() => Specialty, specialty => specialty.vetSpecialties)
  @JoinColumn({ name: 'specialty_id' })
  specialty?: Specialty;
}


@Entity()
export class PetType extends BaseEntity {
  @Column()
  name: string = '';
}

@Entity()
export class Visit extends BaseEntity {
  @Column({ type: 'date' })
  date: string = LocalDate.now().toString();

  @Column()
  description: string = '';

  @ManyToOne(() => Pet, pet => pet.visits)
  @JoinColumn({ name: 'pet_id' })
  pet?: Pet; // Link to Pet
}

@Entity()
export class Pet extends BaseEntity {
  @Column()
  name: string = '';

  @Column({ type: 'date' })
  birthDate: string = LocalDate.now().toString();

  @ManyToOne(() => PetType, { eager: true }) // eager loading for PetType
  @JoinColumn({ name: 'type_id' })
  type?: PetType;

  @ManyToOne(() => Owner, owner => owner.pets)
  @JoinColumn({ name: 'owner_id' })
  owner?: Owner;

  @OneToMany(() => Visit, visit => visit.pet, { cascade: true }) // Cascade visits
  visits: Visit[] = [];

  getVisits(): Visit[] {
    return this.visits;
  }

  // Java's getPet(id) helper. In TS, we filter the pets array.
  getPet(id: number): Pet | undefined {
    return this.owner?.pets.find(p => p.id === id);
  }
}

@Entity()
export class Owner extends BaseEntity {
  @Column()
  firstName: string = '';

  @Column()
  lastName: string = '';

  @Column()
  address: string = '';

  @Column()
  city: string = '';

  @Column()
  telephone: string = '';

  @OneToMany(() => Pet, pet => pet.owner, { cascade: true, eager: true }) // Cascade pets, eager load pets
  pets: Pet[] = [];

  addPet(pet: Pet): void {
    this.pets.push(pet);
    pet.owner = this;
  }

  addVisit(petId: number, visit: Visit): void {
    const pet = this.pets.find(p => p.id === petId);
    if (pet) {
      pet.addVisit(visit);
    } else {
      throw new Error(`Pet with ID ${petId} not found for owner ${this.id}`);
    }
  }

  getPet(name: string): Pet | undefined;
  getPet(id: number): Pet | undefined;
  getPet(arg: string | number): Pet | undefined {
    if (typeof arg === 'string') {
      return this.pets.find(pet => pet.name === arg);
    } else {
      return this.pets.find(pet => pet.id === arg);
    }
  }
}

// --- Repositories ---
interface OwnerRepositoryTypeOrm extends Repository<Owner> {
  findByLastNameStartingWith(lastName: string, pageable: { skip: number, take: number }): Promise<{ content: Owner[], totalElements: number }>;
}

// --- Test Setup ---
let dataSource: DataSource;
let ownersRepository: OwnerRepositoryTypeOrm;
let petTypeRepository: Repository<PetType>;
let vetsRepository: Repository<Vet>;

const pageable = { skip: 0, take: 1000 }; // Equivalent to unpaged() for small datasets

describe('ClinicServiceTests', () => {

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:', // In-memory SQLite
      entities: [BaseEntity, Specialty, Vet, VetSpecialty, PetType, Visit, Pet, Owner],
      synchronize: true, // Auto-create schema
      logging: false,
    });
    await dataSource.initialize();

    ownersRepository = dataSource.getRepository(Owner).extend({
      async findByLastNameStartingWith(lastName: string, pageable: { skip: number, take: number }): Promise<{ content: Owner[], totalElements: number }> {
        const [content, totalElements] = await this.findAndCount({
          where: { lastName: (lastName ? (lastName + '%') : undefined) }, // Simulating LIKE 'lastName%'
          skip: pageable.skip,
          take: pageable.take,
        });
        return { content, totalElements };
      }
    });
    petTypeRepository = dataSource.getRepository(PetType);
    vetsRepository = dataSource.getRepository(Vet);

    // Seed initial data, mimicking H2 default data
    await seedDatabase();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  // Each test implicitly runs in its own transaction (if TypeORM connection configures this)
  // For SQLite in-memory, changes are isolated per test run (fresh DB for each `beforeAll`).
  // If TypeORM were configured for transactions per test, we'd use `queryRunner.startTransaction()` etc.
  // For simplicity, relying on fresh DB per test suite or manual cleanup if needed per test.

  it('should find owners by last name', async () => {
    let ownersFound = await ownersRepository.findByLastNameStartingWith("Davis", pageable);
    expect(ownersFound.content).toHaveLength(2);

    ownersFound = await ownersRepository.findByLastNameStartingWith("Daviss", pageable);
    expect(ownersFound.content).toHaveLength(0);
  });

  it('should find single owner with pet', async () => {
    const owner = await ownersRepository.findOne({ where: { id: 1 }, relations: ['pets', 'pets.type', 'pets.visits'] });
    expect(owner).toBeDefined();
    expect(owner?.lastName).toMatch(/^Franklin/); // Using toMatch for startsWith
    expect(owner?.pets).toHaveLength(1);
    expect(owner?.pets[0].type).toBeDefined();
    expect(owner?.pets[0].type?.name).toBe('cat');
  });

  it('should insert owner', async () => {
    let ownersFound = await ownersRepository.findByLastNameStartingWith("Schultz", pageable);
    const initialCount = ownersFound.totalElements;

    const owner = new Owner();
    owner.firstName = "Sam";
    owner.lastName = "Schultz";
    owner.address = "4, Evans Street";
    owner.city = "Wollongong";
    owner.telephone = "4444444444";
    await ownersRepository.save(owner);
    expect(owner.id).toBeDefined(); // ID should be generated

    ownersFound = await ownersRepository.findByLastNameStartingWith("Schultz", pageable);
    expect(ownersFound.totalElements).toBe(initialCount + 1);
  });

  it('should update owner', async () => {
    let owner = await ownersRepository.findOneBy({ id: 1 });
    expect(owner).toBeDefined();
    const oldLastName = owner!.lastName;
    const newLastName = oldLastName + "X";

    owner!.lastName = newLastName;
    await ownersRepository.save(owner!);

    owner = await ownersRepository.findOneBy({ id: 1 });
    expect(owner?.lastName).toBe(newLastName);
  });

  it('should find all pet types', async () => {
    const petTypes = await petTypeRepository.find();

    const catType = EntityUtils.getById(petTypes, PetType, 1);
    expect(catType.name).toBe('cat');
    const snakeType = EntityUtils.getById(petTypes, PetType, 4);
    expect(snakeType.name).toBe('snake');
  });

  it('should insert pet into database and generate id', async () => {
    let owner6 = await ownersRepository.findOne({ where: { id: 6 }, relations: ['pets', 'pets.type'] });
    expect(owner6).toBeDefined();
    const initialPetCount = owner6!.pets.length;

    const pet = new Pet();
    pet.name = "bowser";
    const types = await petTypeRepository.find();
    pet.type = EntityUtils.getById(types, PetType, 2); // Dog type
    pet.birthDate = LocalDate.now().toString();
    owner6!.addPet(pet);
    expect(owner6!.pets).toHaveLength(initialPetCount + 1);

    await ownersRepository.save(owner6!);

    owner6 = await ownersRepository.findOne({ where: { id: 6 }, relations: ['pets', 'pets.type'] });
    expect(owner6!.pets).toHaveLength(initialPetCount + 1);
    const newPet = owner6!.getPet("bowser");
    expect(newPet?.id).toBeDefined(); // ID should be generated
  });

  it('should update pet name', async () => {
    let owner6 = await ownersRepository.findOne({ where: { id: 6 }, relations: ['pets'] });
    expect(owner6).toBeDefined();

    let pet7 = owner6!.getPet(7);
    expect(pet7).toBeDefined();
    const oldName = pet7!.name;

    const newName = oldName + "X";
    pet7!.name = newName;
    await ownersRepository.save(owner6!);

    owner6 = await ownersRepository.findOne({ where: { id: 6 }, relations: ['pets'] });
    pet7 = owner6!.getPet(7);
    expect(pet7?.name).toBe(newName);
  });

  it('should find vets', async () => {
    const vets = await vetsRepository.find({ relations: ['vetSpecialties', 'vetSpecialties.specialty'] });

    const vet3 = EntityUtils.getById(vets, Vet, 3);
    expect(vet3.lastName).toBe('Douglas');
    expect(vet3.getNrOfSpecialties()).toBe(2);
    expect(vet3.getSpecialties()[0].name).toBe('dentistry');
    expect(vet3.getSpecialties()[1].name).toBe('surgery');
  });

  it('should add new visit for pet', async () => {
    let owner6 = await ownersRepository.findOne({ where: { id: 6 }, relations: ['pets', 'pets.visits'] });
    expect(owner6).toBeDefined();

    let pet7 = owner6!.getPet(7);
    expect(pet7).toBeDefined();
    const initialVisitCount = pet7!.visits.length;

    const visit = new Visit();
    visit.description = "test";

    owner6!.addVisit(pet7!.id!, visit); // addVisit on owner, then save owner
    await ownersRepository.save(owner6!);

    owner6 = await ownersRepository.findOne({ where: { id: 6 }, relations: ['pets', 'pets.visits'] });
    pet7 = owner6!.getPet(7);
    expect(pet7?.visits).toHaveLength(initialVisitCount + 1);
    expect(pet7?.visits.every(v => v.id !== undefined)).toBe(true);
  });

  it('should find visits by pet id', async () => {
    const owner6 = await ownersRepository.findOne({ where: { id: 6 }, relations: ['pets', 'pets.visits'] });
    expect(owner6).toBeDefined();

    const pet7 = owner6!.getPet(7);
    expect(pet7).toBeDefined();
    const visits = pet7!.getVisits();

    expect(visits).toHaveLength(2);
    expect(visits[0].date).toBeDefined();
  });
});


// --- Database Seeding Function ---
async function seedDatabase() {
  // PetTypes
  const cat = await petTypeRepository.save({ name: 'cat' });
  const dog = await petTypeRepository.save({ name: 'dog' });
  const lizard = await petTypeRepository.save({ name: 'lizard' });
  const snake = await petTypeRepository.save({ name: 'snake' });
  const bird = await petTypeRepository.save({ name: 'bird' });
  const hamster = await petTypeRepository.save({ name: 'hamster' });

  // Owners and Pets
  const owner1 = new Owner();
  owner1.firstName = 'George'; owner1.lastName = 'Franklin'; owner1.address = '110 W. Liberty St.'; owner1.city = 'Madison'; owner1.telephone = '6085551023';
  const pet1 = new Pet(); pet1.name = 'Leo'; pet1.birthDate = '2000-09-07'; pet1.type = cat; owner1.addPet(pet1);
  await ownersRepository.save(owner1); // ID 1

  const owner2 = new Owner();
  owner2.firstName = 'Betty'; owner2.lastName = 'Davis'; owner2.address = '638 Cardinal Ave.'; owner2.city = 'Sun Prairie'; owner2.telephone = '6085551749';
  const pet2 = new Pet(); pet2.name = 'Basil'; pet2.birthDate = '2002-08-06'; pet2.type = hamster; owner2.addPet(pet2);
  await ownersRepository.save(owner2); // ID 2

  const owner3 = new Owner();
  owner3.firstName = 'Eduardo'; owner3.lastName = 'Rodriquez'; owner3.address = '2693 Fisher St.'; owner3.city = 'Madison'; owner3.telephone = '6085558763';
  const pet3 = new Pet(); pet3.name = 'Rosy'; pet3.birthDate = '2001-04-17'; pet3.type = dog; owner3.addPet(pet3);
  const pet4 = new Pet(); pet4.name = 'Jewel'; pet4.birthDate = '2000-03-07'; pet4.type = snake; owner3.addPet(pet4);
  await ownersRepository.save(owner3); // ID 3

  const owner4 = new Owner();
  owner4.firstName = 'Harold'; owner4.lastName = 'Davis'; owner4.address = '563 Brookside Rd.'; owner4.city = 'Peachtree City'; owner4.telephone = '7705552000';
  const pet5 = new Pet(); pet5.name = 'Iggy'; pet5.birthDate = '2001-11-30'; pet5.type = lizard; owner4.addPet(pet5);
  await ownersRepository.save(owner4); // ID 4

  const owner5 = new Owner();
  owner5.firstName = 'Peter'; owner5.lastName = 'McTavish'; owner5.address = '238 W. Fourth St.'; owner5.city = 'Baltimore'; owner5.telephone = '4105551023';
  const pet6 = new Pet(); pet6.name = 'George'; pet6.birthDate = '2000-01-20'; pet6.type = bird; owner5.addPet(pet6);
  await ownersRepository.save(owner5); // ID 5

  const owner6 = new Owner();
  owner6.firstName = 'Jean'; owner6.lastName = 'Coleman'; owner6.address = '105 N. Lake St.'; owner6.city = 'Monona'; owner6.telephone = '6085552654';
  const pet7 = new Pet(); pet7.name = 'Max'; pet7.birthDate = '2000-09-07'; pet7.type = cat; owner6.addPet(pet7);
  const pet8 = new Pet(); pet8.name = 'Samantha'; pet8.birthDate = '1995-09-04'; pet8.type = cat; owner6.addPet(pet8);
  await ownersRepository.save(owner6); // ID 6

  // Visits for pet7
  const visit1 = new Visit(); visit1.date = '2004-03-04'; visit1.description = 'rabies shot'; pet7.visits.push(visit1);
  const visit2 = new Visit(); visit2.date = '2004-03-04'; visit2.description = 'neutered'; pet7.visits.push(visit2);
  await ownersRepository.save(owner6); // Save again to cascade visits

  // Specialties
  const radiology = await dataSource.getRepository(Specialty).save({ name: 'radiology' });
  const surgery = await dataSource.getRepository(Specialty).save({ name: 'surgery' });
  const dentistry = await dataSource.getRepository(Specialty).save({ name: 'dentistry' });

  // Vets
  const vetRepo = dataSource.getRepository(Vet);
  const vetSpecRepo = dataSource.getRepository(VetSpecialty);

  const vet1 = await vetRepo.save({ firstName: 'James', lastName: 'Carter' });
  await vetSpecRepo.save({ vet: vet1, specialty: radiology });

  const vet2 = await vetRepo.save({ firstName: 'Helen', lastName: 'Leary' });
  await vetSpecRepo.save({ vet: vet2, specialty: surgery });

  const vet3 = await vetRepo.save({ firstName: 'Linda', lastName: 'Douglas' }); // Corrected last name for vet with ID 3
  await vetSpecRepo.save({ vet: vet3, specialty: dentistry });
  await vetSpecRepo.save({ vet: vet3, specialty: surgery });

  const vet4 = await vetRepo.save({ firstName: 'Rafael', lastName: 'Ortega' });
  await vetSpecRepo.save({ vet: vet4, specialty: surgery });

  const vet5 = await vetRepo.save({ firstName: 'Henry', lastName: 'Stevens' });
  await vetSpecRepo.save({ vet: vet5, specialty: radiology });

  const vet6 = await vetRepo.save({ firstName: 'Sharon', lastName: 'Jenkins' });
}
