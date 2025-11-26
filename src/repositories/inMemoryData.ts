/**
 * @module repositories/inMemoryData
 * @description Provides a centralized, in-memory data store for the PetClinic application.
 * This module simulates a database by holding collections of all entities (Owners, Pets, Vets, etc.)
 * and manages ID generation for new entities. This is for demonstration purposes only.
 */

import { Owner } from '@models/owner';
import { PetType } from '@models/petType';
import { Specialty } from '@models/specialty';
import { Vet } from '@models/vet';
import { Visit } from '@models/visit';

/**
 * @interface InMemoryData
 * @description Defines the structure of our in-memory data store,
 * containing arrays of all primary entities.
 */
interface InMemoryData {
  owners: Owner[];
  petTypes: PetType[];
  specialties: Specialty[];
  vets: Vet[];
  visits: Visit[]; // Stores all visits, linked to pets via petId
}

/**
 * @constant {InMemoryData} data
 * @description The actual in-memory data store, initialized with sample data.
 * This mirrors the data from the H2 `data.sql` file in the original Spring PetClinic.
 */
const data: InMemoryData = {
  owners: [],
  petTypes: [],
  specialties: [],
  vets: [],
  visits: [],
};

// --- ID Counters for new entities ---
let ownerIdCounter = 0;
let petTypeIdCounter = 0;
let specialtyIdCounter = 0;
let vetIdCounter = 0;
let visitIdCounter = 0;
let petIdCounter = 0; // Pet IDs are unique across all pets, not per owner

/**
 * @function generateNextId
 * @description Generates the next available ID for a given entity type.
 * @param {'owner' | 'pet' | 'petType' | 'specialty' | 'vet' | 'visit'} entityType - The type of entity.
 * @returns {number} The next unique ID.
 */
export const generateNextId = (entityType: 'owner' | 'pet' | 'petType' | 'specialty' | 'vet' | 'visit'): number => {
  switch (entityType) {
    case 'owner':
      return ++ownerIdCounter;
    case 'pet':
      return ++petIdCounter;
    case 'petType':
      return ++petTypeIdCounter;
    case 'specialty':
      return ++specialtyIdCounter;
    case 'vet':
      return ++vetIdCounter;
    case 'visit':
      return ++visitIdCounter;
    default:
      throw new Error('Unknown entity type for ID generation');
  }
};

/**
 * @function resetData
 * @description Resets the in-memory data store to its initial state.
 * Useful for testing or restarting the application's data.
 */
export const resetData = (): void => {
  // Clear all arrays
  data.owners = [];
  data.petTypes = [];
  data.specialties = [];
  data.vets = [];
  data.visits = [];

  // Reset ID counters
  ownerIdCounter = 0;
  petTypeIdCounter = 0;
  specialtyIdCounter = 0;
  vetIdCounter = 0;
  visitIdCounter = 0;
  petIdCounter = 0;

  // Re-load initial data
  loadInitialData();
};

/**
 * @function loadInitialData
 * @description Populates the in-memory data store with predefined sample data.
 * This function is called once at application startup or after a reset.
 */
const loadInitialData = () => {
  // Load Specialties
  const radiology: Specialty = { id: generateNextId('specialty'), name: 'radiology', isNew: false };
  const surgery: Specialty = { id: generateNextId('specialty'), name: 'surgery', isNew: false };
  const dentistry: Specialty = { id: generateNextId('specialty'), name: 'dentistry', isNew: false };
  data.specialties.push(radiology, surgery, dentistry);

  // Load Vets
  const james: Vet = { id: generateNextId('vet'), firstName: 'James', lastName: 'Carter', specialties: [], isNew: false };
  const helen: Vet = { id: generateNextId('vet'), firstName: 'Helen', lastName: 'Leary', specialties: [radiology], isNew: false };
  const linda: Vet = { id: generateNextId('vet'), firstName: 'Linda', lastName: 'Douglas', specialties: [surgery, dentistry], isNew: false };
  const rafael: Vet = { id: generateNextId('vet'), firstName: 'Rafael', lastName: 'Ortega', specialties: [surgery], isNew: false };
  const henry: Vet = { id: generateNextId('vet'), firstName: 'Henry', lastName: 'Stevens', specialties: [radiology], isNew: false };
  const sharon: Vet = { id: generateNextId('vet'), firstName: 'Sharon', lastName: 'Jenkins', specialties: [], isNew: false };
  data.vets.push(james, helen, linda, rafael, henry, sharon);

  // Load PetTypes
  const cat: PetType = { id: generateNextId('petType'), name: 'cat', isNew: false };
  const dog: PetType = { id: generateNextId('petType'), name: 'dog', isNew: false };
  const lizard: PetType = { id: generateNextId('petType'), name: 'lizard', isNew: false };
  const snake: PetType = { id: generateNextId('petType'), name: 'snake', isNew: false };
  const bird: PetType = { id: generateNextId('petType'), name: 'bird', isNew: false };
  const hamster: PetType = { id: generateNextId('petType'), name: 'hamster', isNew: false };
  data.petTypes.push(cat, dog, lizard, snake, bird, hamster);

  // Load Owners and their Pets/Visits
  const george: Owner = {
    id: generateNextId('owner'), firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023', pets: [], isNew: false
  };
  const georgePet1: Pet = {
    id: generateNextId('pet'), name: 'Leo', birthDate: new Date('2010-09-07'), type: cat, ownerId: george.id!, visits: [], isNew: false
  };
  george.pets.push(georgePet1);
  data.owners.push(george);

  const betty: Owner = {
    id: generateNextId('owner'), firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749', pets: [], isNew: false
  };
  const bettyPet1: Pet = {
    id: generateNextId('pet'), name: 'Basil', birthDate: new Date('2012-08-06'), type: hamster, ownerId: betty.id!, visits: [], isNew: false
  };
  betty.pets.push(bettyPet1);
  data.owners.push(betty);

  const eduardo: Owner = {
    id: generateNextId('owner'), firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763', pets: [], isNew: false
  };
  const eduardoPet1: Pet = {
    id: generateNextId('pet'), name: 'Rosy', birthDate: new Date('2011-04-17'), type: dog, ownerId: eduardo.id!, visits: [], isNew: false
  };
  const eduardoPet2: Pet = {
    id: generateNextId('pet'), name: 'Jewel', birthDate: new Date('2010-03-07'), type: dog, ownerId: eduardo.id!, visits: [], isNew: false
  };
  eduardo.pets.push(eduardoPet1, eduardoPet2);
  data.owners.push(eduardo);

  const harold: Owner = {
    id: generateNextId('owner'), firstName: 'Harold', lastName: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198', pets: [], isNew: false
  };
  const haroldPet1: Pet = {
    id: generateNextId('pet'), name: 'Iggy', birthDate: new Date('2010-11-30'), type: lizard, ownerId: harold.id!, visits: [], isNew: false
  };
  harold.pets.push(haroldPet1);
  data.owners.push(harold);

  const peter: Owner = {
    id: generateNextId('owner'), firstName: 'Peter', lastName: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765', pets: [], isNew: false
  };
  const peterPet1: Pet = {
    id: generateNextId('pet'), name: 'George', birthDate: new Date('2010-01-20'), type: snake, ownerId: peter.id!, visits: [], isNew: false
  };
  peter.pets.push(peterPet1);
  data.owners.push(peter);

  const jean: Owner = {
    id: generateNextId('owner'), firstName: 'Jean', lastName: 'Coleman', address: '105 N. Lake St.', city: 'Monona', telephone: '6085552654', pets: [], isNew: false
  };
  const jeanPet1: Pet = {
    id: generateNextId('pet'), name: 'Samantha', birthDate: new Date('2012-09-04'), type: cat, ownerId: jean.id!, visits: [], isNew: false
  };
  const jeanPet2: Pet = {
    id: generateNextId('pet'), name: 'Max', birthDate: new Date('2012-09-04'), type: cat, ownerId: jean.id!, visits: [], isNew: false
  };
  const jeanPet1Visit1: Visit = {
    id: generateNextId('visit'), petId: jeanPet1.id!, date: new Date('2013-01-01'), description: 'rabies shot', isNew: false
  };
  const jeanPet2Visit1: Visit = {
    id: generateNextId('visit'), petId: jeanPet2.id!, date: new Date('2013-01-02'), description: 'rabies shot', isNew: false
  };
  const jeanPet2Visit2: Visit = {
    id: generateNextId('visit'), petId: jeanPet2.id!, date: new Date('2013-01-03'), description: 'neutered', isNew: false
  };
  const jeanPet1Visit2: Visit = {
    id: generateNextId('visit'), petId: jeanPet1.id!, date: new Date('2013-01-04'), description: 'spayed', isNew: false
  };
  jeanPet1.visits.push(jeanPet1Visit1, jeanPet1Visit2);
  jeanPet2.visits.push(jeanPet2Visit1, jeanPet2Visit2);
  data.visits.push(jeanPet1Visit1, jeanPet2Visit1, jeanPet2Visit2, jeanPet1Visit2); // Also add to global visits array
  jean.pets.push(jeanPet1, jeanPet2);
  data.owners.push(jean);

  const jeff: Owner = {
    id: generateNextId('owner'), firstName: 'Jeff', lastName: 'Black', address: '1450 Oak Blvd.', city: 'Monona', telephone: '6085555387', pets: [], isNew: false
  };
  const jeffPet1: Pet = {
    id: generateNextId('pet'), name: 'Lucky', birthDate: new Date('2011-08-06'), type: bird, ownerId: jeff.id!, visits: [], isNew: false
  };
  jeff.pets.push(jeffPet1);
  data.owners.push(jeff);

  const maria: Owner = {
    id: generateNextId('owner'), firstName: 'Maria', lastName: 'Escobito', address: '345 Maple St.', city: 'Madison', telephone: '6085557683', pets: [], isNew: false
  };
  const mariaPet1: Pet = {
    id: generateNextId('pet'), name: 'Mulligan', birthDate: new Date('2007-02-24'), type: dog, ownerId: maria.id!, visits: [], isNew: false
  };
  maria.pets.push(mariaPet1);
  data.owners.push(maria);

  const david: Owner = {
    id: generateNextId('owner'), firstName: 'David', lastName: 'Schroeder', address: '2749 Blackhawk Trail', city: 'Madison', telephone: '6085559435', pets: [], isNew: false
  };
  const davidPet1: Pet = {
    id: generateNextId('pet'), name: 'Freddy', birthDate: new Date('2010-03-09'), type: bird, ownerId: david.id!, visits: [], isNew: false
  };
  david.pets.push(davidPet1);
  data.owners.push(david);

  const carlos: Owner = {
    id: generateNextId('owner'), firstName: 'Carlos', lastName: 'Estaban', address: '2335 Independence La.', city: 'Waunakee', telephone: '6085555487', pets: [], isNew: false
  };
  const carlosPet1: Pet = {
    id: generateNextId('pet'), name: 'Lucky', birthDate: new Date('2010-06-24'), type: dog, ownerId: carlos.id!, visits: [], isNew: false
  };
  const carlosPet2: Pet = {
    id: generateNextId('pet'), name: 'Sly', birthDate: new Date('2012-06-08'), type: cat, ownerId: carlos.id!, visits: [], isNew: false
  };
  carlos.pets.push(carlosPet1, carlosPet2);
  data.owners.push(carlos);
};

// Load initial data when the module is first loaded
loadInitialData();

export default data;
