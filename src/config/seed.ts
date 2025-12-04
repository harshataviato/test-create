import { AppDataSource } from './typeorm.config';
import { Vet } from '../vets/entities/vet.entity';
import { Specialty } from '../vets/entities/specialty.entity';
import { Owner } from '../owners/entities/owner.entity';
import { PetType } from '../owners/entities/pet-type.entity';
import { Pet } from '../owners/entities/pet.entity';
import { Visit } from '../owners/entities/visit.entity';
import * as dayjs from 'dayjs';

/**
 * @module Config
 * @description
 * Seeds the database with initial data for the PetClinic application.
 * This script ensures that the application has a baseline set of vets, specialties,
 * pet types, owners, pets, and visits, mimicking the original `data.sql` files.
 * It checks for existing data before insertion to make it idempotent.
 */
async function seed() {
  await AppDataSource.initialize();
  console.log('Data Source initialized for seeding.');

  const queryRunner = AppDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // -----------------------------------------------------
    // Seed Specialties
    // -----------------------------------------------------
    console.log('Seeding Specialties...');
    const existingSpecialties = await queryRunner.manager.find(Specialty);
    const specialtyMap = new Map<string, Specialty>();

    const specialtiesToCreate = [
      { name: 'radiology' },
      { name: 'surgery' },
      { name: 'dentistry' },
    ];

    for (const data of specialtiesToCreate) {
      if (!existingSpecialties.some(s => s.name === data.name)) {
        const specialty = queryRunner.manager.create(Specialty, data);
        await queryRunner.manager.save(specialty);
        specialtyMap.set(specialty.name, specialty);
        console.log(`Specialty ${specialty.name} created.`);
      } else {
        const existing = existingSpecialties.find(s => s.name === data.name);
        specialtyMap.set(existing.name, existing);
        console.log(`Specialty ${data.name} already exists.`);
      }
    }

    // Refresh existing specialties after potential inserts for accurate IDs
    const currentSpecialties = await queryRunner.manager.find(Specialty);
    currentSpecialties.forEach(s => specialtyMap.set(s.name, s));


    // -----------------------------------------------------
    // Seed Vets
    // -----------------------------------------------------
    console.log('Seeding Vets...');
    const existingVets = await queryRunner.manager.find(Vet, { relations: ['specialties'] });
    const vetMap = new Map<string, Vet>();

    const vetsData = [
      { firstName: 'James', lastName: 'Carter', specialties: [] },
      { firstName: 'Helen', lastName: 'Leary', specialties: [specialtyMap.get('radiology')] },
      { firstName: 'Linda', lastName: 'Douglas', specialties: [specialtyMap.get('surgery'), specialtyMap.get('dentistry')] },
      { firstName: 'Rafael', lastName: 'Ortega', specialties: [specialtyMap.get('surgery')] },
      { firstName: 'Henry', lastName: 'Stevens', specialties: [specialtyMap.get('radiology')] },
      { firstName: 'Sharon', lastName: 'Jenkins', specialties: [] },
    ];

    for (const data of vetsData) {
      if (!existingVets.some(v => v.firstName === data.firstName && v.lastName === data.lastName)) {
        const vet = queryRunner.manager.create(Vet, data);
        await queryRunner.manager.save(vet);
        vetMap.set(`${vet.firstName} ${vet.lastName}`, vet);
        console.log(`Vet ${vet.firstName} ${vet.lastName} created.`);
      } else {
        const existing = existingVets.find(v => v.firstName === data.firstName && v.lastName === data.lastName);
        vetMap.set(`${existing.firstName} ${existing.lastName}`, existing);
        console.log(`Vet ${data.firstName} ${data.lastName} already exists.`);
      }
    }
    // Refresh existing vets after potential inserts for accurate IDs
    const currentVets = await queryRunner.manager.find(Vet);
    currentVets.forEach(v => vetMap.set(`${v.firstName} ${v.lastName}`, v));


    // -----------------------------------------------------
    // Seed Pet Types
    // -----------------------------------------------------
    console.log('Seeding Pet Types...');
    const existingPetTypes = await queryRunner.manager.find(PetType);
    const petTypeMap = new Map<string, PetType>();

    const petTypesToCreate = [
      { name: 'cat' },
      { name: 'dog' },
      { name: 'lizard' },
      { name: 'snake' },
      { name: 'bird' },
      { name: 'hamster' },
    ];

    for (const data of petTypesToCreate) {
      if (!existingPetTypes.some(pt => pt.name === data.name)) {
        const petType = queryRunner.manager.create(PetType, data);
        await queryRunner.manager.save(petType);
        petTypeMap.set(petType.name, petType);
        console.log(`PetType ${petType.name} created.`);
      } else {
        const existing = existingPetTypes.find(pt => pt.name === data.name);
        petTypeMap.set(existing.name, existing);
        console.log(`PetType ${data.name} already exists.`);
      }
    }
    // Refresh existing pet types after potential inserts for accurate IDs
    const currentPetTypes = await queryRunner.manager.find(PetType);
    currentPetTypes.forEach(pt => petTypeMap.set(pt.name, pt));


    // -----------------------------------------------------
    // Seed Owners
    // -----------------------------------------------------
    console.log('Seeding Owners...');
    const existingOwners = await queryRunner.manager.find(Owner);
    const ownerMap = new Map<string, Owner>();

    const ownersData = [
      { firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' },
      { firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' },
      { firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' },
      { firstName: 'Harold', lastName: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198' },
      { firstName: 'Peter', lastName: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765' },
      { firstName: 'Jean', lastName: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654' },
      { firstName: 'Jeff', lastName: 'Black', address: '1450 Oak Blvd.', city: 'Monona', telephone: '6085555387' },
      { firstName: 'Maria', lastName: 'Escobito', address: '345 Maple St.', city: 'Madison', telephone: '6085557683' },
      { firstName: 'David', lastName: 'Schroeder', address: '2749 Blackhawk Trail', city: 'Madison', telephone: '6085559435' },
      { firstName: 'Carlos', lastName: 'Estaban', address: '2335 Independence La.', city: 'Waunakee', telephone: '6085555487' },
    ];

    for (const data of ownersData) {
      if (!existingOwners.some(o => o.firstName === data.firstName && o.lastName === data.lastName)) {
        const owner = queryRunner.manager.create(Owner, data);
        await queryRunner.manager.save(owner);
        ownerMap.set(`${owner.firstName} ${owner.lastName}`, owner);
        console.log(`Owner ${owner.firstName} ${owner.lastName} created.`);
      } else {
        const existing = existingOwners.find(o => o.firstName === data.firstName && o.lastName === data.lastName);
        ownerMap.set(`${existing.firstName} ${existing.lastName}`, existing);
        console.log(`Owner ${data.firstName} ${data.lastName} already exists.`);
      }
    }
    // Refresh existing owners after potential inserts for accurate IDs
    const currentOwners = await queryRunner.manager.find(Owner);
    currentOwners.forEach(o => ownerMap.set(`${o.firstName} ${o.lastName}`, o));


    // -----------------------------------------------------
    // Seed Pets
    // -----------------------------------------------------
    console.log('Seeding Pets...');
    const existingPets = await queryRunner.manager.find(Pet);
    const petEntries: { name: string; birthDate: string; petType: string; ownerName: string }[] = [
      { name: 'Leo', birthDate: '2000-09-07', petType: 'cat', ownerName: 'George Franklin' },
      { name: 'Basil', birthDate: '2002-08-06', petType: 'hamster', ownerName: 'Betty Davis' },
      { name: 'Rosy', birthDate: '2001-04-17', petType: 'dog', ownerName: 'Eduardo Rodriquez' },
      { name: 'Jewel', birthDate: '2000-03-07', petType: 'dog', ownerName: 'Eduardo Rodriquez' },
      { name: 'Iggy', birthDate: '2000-11-30', petType: 'lizard', ownerName: 'Harold Davis' },
      { name: 'George', birthDate: '2000-01-20', petType: 'snake', ownerName: 'Peter McTavish' },
      { name: 'Samantha', birthDate: '1995-09-04', petType: 'cat', ownerName: 'Jean Coleman' },
      { name: 'Max', birthDate: '1995-09-04', petType: 'cat', ownerName: 'Jean Coleman' },
      { name: 'Lucky', birthDate: '1999-08-06', petType: 'bird', ownerName: 'Jeff Black' },
      { name: 'Mulligan', birthDate: '1997-02-24', petType: 'dog', ownerName: 'Maria Escobito' },
      { name: 'Freddy', birthDate: '2000-03-09', petType: 'bird', ownerName: 'David Schroeder' },
      { name: 'Lucky', birthDate: '2000-06-24', petType: 'dog', ownerName: 'Carlos Estaban' },
      { name: 'Sly', birthDate: '2002-06-08', petType: 'cat', ownerName: 'Carlos Estaban' },
    ];
    const petMap = new Map<string, Pet>();

    for (const petData of petEntries) {
      const owner = ownerMap.get(petData.ownerName);
      const type = petTypeMap.get(petData.petType);

      if (!owner || !type) {
        console.warn(`Skipping pet ${petData.name}: Owner or PetType not found.`);
        continue;
      }

      if (!existingPets.some(p => p.name === petData.name && p.owner.id === owner.id)) {
        const pet = queryRunner.manager.create(Pet, {
          name: petData.name,
          birthDate: dayjs(petData.birthDate).toDate(),
          type: type,
          owner: owner,
        });
        await queryRunner.manager.save(pet);
        petMap.set(`${owner.id}-${pet.name}`, pet);
        console.log(`Pet ${pet.name} for ${owner.firstName} ${owner.lastName} created.`);
      } else {
        const existing = existingPets.find(p => p.name === petData.name && p.owner.id === owner.id);
        petMap.set(`${owner.id}-${existing.name}`, existing);
        console.log(`Pet ${petData.name} for ${owner.firstName} ${owner.lastName} already exists.`);
      }
    }
    // Refresh existing pets after potential inserts for accurate IDs
    const currentPets = await queryRunner.manager.find(Pet, { relations: ['owner', 'type'] });
    currentPets.forEach(p => petMap.set(`${p.owner.id}-${p.name}`, p));


    // -----------------------------------------------------
    // Seed Visits
    // -----------------------------------------------------
    console.log('Seeding Visits...');
    const existingVisits = await queryRunner.manager.find(Visit);

    const visitsData = [
      { petOwner: 'Jean Coleman', petName: 'Samantha', date: '2010-03-04', description: 'rabies shot' },
      { petOwner: 'Jean Coleman', petName: 'Max', date: '2011-03-04', description: 'rabies shot' },
      { petOwner: 'Jean Coleman', petName: 'Max', date: '2009-06-04', description: 'neutered' },
      { petOwner: 'Jean Coleman', petName: 'Samantha', date: '2008-09-04', description: 'spayed' },
    ];

    for (const visitData of visitsData) {
      const owner = ownerMap.get(visitData.petOwner);
      const pet = petMap.get(`${owner?.id}-${visitData.petName}`);

      if (!owner || !pet) {
        console.warn(`Skipping visit for ${visitData.petName}: Owner or Pet not found.`);
        continue;
      }

      if (!existingVisits.some(v => v.pet.id === pet.id && v.description === visitData.description && dayjs(v.date).isSame(visitData.date, 'day'))) {
        const visit = queryRunner.manager.create(Visit, {
          date: dayjs(visitData.date).toDate(),
          description: visitData.description,
          pet: pet,
        });
        await queryRunner.manager.save(visit);
        console.log(`Visit for ${pet.name} on ${visitData.date} created.`);
      } else {
        console.log(`Visit for ${pet.name} on ${visitData.date} already exists.`);
      }
    }

    await queryRunner.commitTransaction();
    console.log('Database seeding completed successfully!');
  } catch (err) {
    await queryRunner.rollbackTransaction();
    console.error('Database seeding failed!', err);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('Data Source disconnected.');
  }
}

// Run the seeding function if the script is executed directly
if (require.main === module) {
  seed().catch(error => {
    console.error('Unhandled error during seeding:', error);
    process.exit(1);
  });
}
