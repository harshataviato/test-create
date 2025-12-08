/**
 * @module database/seeds/seed
 * @description Script to seed initial data into the PetClinic database.
 *              This data mirrors the `data.sql` file from the original Spring PetClinic.
 */

import { AppDataSource } from '@config/database';
import { Vet } from '@models/vet/Vet';
import { Specialty } from '@models/vet/Specialty';
import { PetType } from '@models/owner/PetType';
import { Owner } from '@models/owner/Owner';
import { Pet } from '@models/owner/Pet';
import { Visit } from '@models/owner/Visit';
import { Repository } from 'typeorm';
import moment from 'moment';

/**
 * @function seedData
 * @description Populates the database with predefined data for vets, specialties, pet types, owners, pets, and visits.
 * @returns {Promise<void>} A promise that resolves when all data has been inserted.
 */
async function seedData(): Promise<void> {
  console.log('Starting database seeding...');

  // Ensure database connection is initialized
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Database connection initialized for seeding.');
  }

  const vetRepository: Repository<Vet> = AppDataSource.getRepository(Vet);
  const specialtyRepository: Repository<Specialty> = AppDataSource.getRepository(Specialty);
  const petTypeRepository: Repository<PetType> = AppDataSource.getRepository(PetType);
  const ownerRepository: Repository<Owner> = AppDataSource.getRepository(Owner);
  const petRepository: Repository<Pet> = AppDataSource.getRepository(Pet);
  const visitRepository: Repository<Visit> = AppDataSource.getRepository(Visit);

  // Clear existing data (optional, for idempotent seeding)
  await visitRepository.clear();
  await petRepository.clear();
  await ownerRepository.clear();
  await vetRepository.clear();
  await specialtyRepository.clear();
  await petTypeRepository.clear();

  // 1. Specialties
  const radiology = specialtyRepository.create({ name: 'radiology' });
  const surgery = specialtyRepository.create({ name: 'surgery' });
  const dentistry = specialtyRepository.create({ name: 'dentistry' });
  await specialtyRepository.save([radiology, surgery, dentistry]);
  console.log('Specialties seeded.');

  // 2. Vets
  const vet1 = vetRepository.create({ firstName: 'James', lastName: 'Carter' });
  const vet2 = vetRepository.create({ firstName: 'Helen', lastName: 'Leary', specialties: [radiology] });
  const vet3 = vetRepository.create({ firstName: 'Linda', lastName: 'Douglas', specialties: [surgery, dentistry] });
  const vet4 = vetRepository.create({ firstName: 'Rafael', lastName: 'Ortega', specialties: [surgery] });
  const vet5 = vetRepository.create({ firstName: 'Henry', lastName: 'Stevens', specialties: [radiology] });
  const vet6 = vetRepository.create({ firstName: 'Sharon', lastName: 'Jenkins' });
  await vetRepository.save([vet1, vet2, vet3, vet4, vet5, vet6]);
  console.log('Vets seeded.');

  // 3. Pet Types
  const catType = petTypeRepository.create({ name: 'cat' });
  const dogType = petTypeRepository.create({ name: 'dog' });
  const lizardType = petTypeRepository.create({ name: 'lizard' });
  const snakeType = petTypeRepository.create({ name: 'snake' });
  const birdType = petTypeRepository.create({ name: 'bird' });
  const hamsterType = petTypeRepository.create({ name: 'hamster' });
  await petTypeRepository.save([catType, dogType, lizardType, snakeType, birdType, hamsterType]);
  console.log('Pet types seeded.');

  // 4. Owners
  const owner1 = ownerRepository.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
  const owner2 = ownerRepository.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' });
  const owner3 = ownerRepository.create({ firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' });
  const owner4 = ownerRepository.create({ firstName: 'Harold', lastName: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198' });
  const owner5 = ownerRepository.create({ firstName: 'Peter', lastName: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765' });
  const owner6 = ownerRepository.create({ firstName: 'Jean', lastName: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654' });
  const owner7 = ownerRepository.create({ firstName: 'Jeff', lastName: 'Black', address: '1450 Oak Blvd.', city: 'Monona', telephone: '6085555387' });
  const owner8 = ownerRepository.create({ firstName: 'Maria', lastName: 'Escobito', address: '345 Maple St.', city: 'Madison', telephone: '6085557683' });
  const owner9 = ownerRepository.create({ firstName: 'David', lastName: 'Schroeder', address: '2749 Blackhawk Trail', city: 'Madison', telephone: '6085559435' });
  const owner10 = ownerRepository.create({ firstName: 'Carlos', lastName: 'Estaban', address: '2335 Independence La.', city: 'Waunakee', telephone: '6085555487' });
  await ownerRepository.save([owner1, owner2, owner3, owner4, owner5, owner6, owner7, owner8, owner9, owner10]);
  console.log('Owners seeded.');

  // 5. Pets
  const pet1 = petRepository.create({ name: 'Leo', birthDate: moment('2000-09-07').toDate(), type: catType, owner: owner1 });
  const pet2 = petRepository.create({ name: 'Basil', birthDate: moment('2002-08-06').toDate(), type: hamsterType, owner: owner2 });
  const pet3 = petRepository.create({ name: 'Rosy', birthDate: moment('2001-04-17').toDate(), type: dogType, owner: owner3 });
  const pet4 = petRepository.create({ name: 'Jewel', birthDate: moment('2000-03-07').toDate(), type: dogType, owner: owner3 });
  const pet5 = petRepository.create({ name: 'Iggy', birthDate: moment('2000-11-30').toDate(), type: lizardType, owner: owner4 });
  const pet6 = petRepository.create({ name: 'George', birthDate: moment('2000-01-20').toDate(), type: snakeType, owner: owner5 });
  const pet7 = petRepository.create({ name: 'Samantha', birthDate: moment('1995-09-04').toDate(), type: catType, owner: owner6 });
  const pet8 = petRepository.create({ name: 'Max', birthDate: moment('1995-09-04').toDate(), type: catType, owner: owner6 });
  const pet9 = petRepository.create({ name: 'Lucky', birthDate: moment('1999-08-06').toDate(), type: birdType, owner: owner7 });
  const pet10 = petRepository.create({ name: 'Mulligan', birthDate: moment('1997-02-24').toDate(), type: dogType, owner: owner8 });
  const pet11 = petRepository.create({ name: 'Freddy', birthDate: moment('2000-03-09').toDate(), type: birdType, owner: owner9 });
  const pet12 = petRepository.create({ name: 'Lucky', birthDate: moment('2000-06-24').toDate(), type: dogType, owner: owner10 });
  const pet13 = petRepository.create({ name: 'Sly', birthDate: moment('2002-06-08').toDate(), type: catType, owner: owner10 });
  await petRepository.save([pet1, pet2, pet3, pet4, pet5, pet6, pet7, pet8, pet9, pet10, pet11, pet12, pet13]);
  console.log('Pets seeded.');

  // 6. Visits
  const visit1 = visitRepository.create({ pet: pet7, date: moment('2010-03-04').toDate(), description: 'rabies shot' });
  const visit2 = visitRepository.create({ pet: pet8, date: moment('2011-03-04').toDate(), description: 'rabies shot' });
  const visit3 = visitRepository.create({ pet: pet8, date: moment('2009-06-04').toDate(), description: 'neutered' });
  const visit4 = visitRepository.create({ pet: pet7, date: moment('2008-09-04').toDate(), description: 'spayed' });
  await visitRepository.save([visit1, visit2, visit3, visit4]);
  console.log('Visits seeded.');

  console.log('Database seeding complete.');

  // Close the database connection if this script is run standalone
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  }
}

// Check if this script is run directly and not imported
if (require.main === module) {
  seedData().catch(error => {
    console.error('Database seeding failed:', error);
    process.exit(1);
  });
}
