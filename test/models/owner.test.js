/**
 * @fileoverview Test suite for the Owner model.
 * Verifies owner-specific properties, validations, methods, and associations.
 */

const { expect } = require('chai');
const db = require('../../models'); // Adjust path as necessary
const { Owner, Pet, PetType, Visit } = db;

describe('Owner Model', () => {
  beforeEach(async () => {
    // Re-seed data for each test to ensure isolation, or truncate and re-insert specific data
    // For full isolation, recreating schema or truncating specific tables is ideal.
    // For this example, we'll leverage the global setup's full seed.
    // For tests that modify data, consider a more granular `beforeEach` truncate/insert.
  });

  describe('Properties and Validations', () => {
    it('should create an owner with valid data', async () => {
      const newOwner = await Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        telephone: '1234567890'
      });
      expect(newOwner).to.exist;
      expect(newOwner.firstName).to.equal('John');
      expect(newOwner.lastName).to.equal('Doe');
      expect(newOwner.telephone).to.equal('1234567890');
    });

    it('should require firstName', async () => {
      let error;
      try {
        await Owner.create({
          lastName: 'Doe', address: '123 Main St', city: 'Anytown', telephone: '1234567890'
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('firstName');
    });

    it('should require lastName', async () => {
      let error;
      try {
        await Owner.create({
          firstName: 'John', address: '123 Main St', city: 'Anytown', telephone: '1234567890'
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('lastName');
    });

    it('should require address', async () => {
      let error;
      try {
        await Owner.create({
          firstName: 'John', lastName: 'Doe', city: 'Anytown', telephone: '1234567890'
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('address');
    });

    it('should require city', async () => {
      let error;
      try {
        await Owner.create({
          firstName: 'John', lastName: 'Doe', address: '123 Main St', telephone: '1234567890'
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('city');
    });

    it('should require telephone', async () => {
      let error;
      try {
        await Owner.create({
          firstName: 'John', lastName: 'Doe', address: '123 Main St', city: 'Anytown'
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('telephone');
    });

    it('should enforce 10-digit telephone pattern', async () => {
      let error;
      try {
        await Owner.create({
          firstName: 'John', lastName: 'Doe', address: '123 Main St', city: 'Anytown', telephone: '12345'
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('telephone');
      expect(error.errors[0].message).to.equal('Telephone must be a 10-digit number');

      // Valid case
      const validOwner = await Owner.create({
        firstName: 'Jane', lastName: 'Smith', address: '456 Oak Ave', city: 'Another Town', telephone: '0987654321'
      });
      expect(validOwner.telephone).to.equal('0987654321');
    });
  });

  describe('Associations', () => {
    it('should allow fetching pets with an owner', async () => {
      const owner = await Owner.findByPk(1, { include: [{ model: Pet, as: 'pets' }] }); // George Franklin
      expect(owner).to.exist;
      expect(owner.pets).to.have.lengthOf(1); // Leo
      expect(owner.pets[0].name).to.equal('Leo');
    });

    it('should delete associated pets when an owner is deleted (CASCADE)', async () => {
      // Create a temporary owner and pet to test cascade delete
      const newOwner = await Owner.create({
        firstName: 'Temp', lastName: 'Owner', address: '1 Temp St', city: 'Temp City', telephone: '1112223333'
      });
      const newPetType = await PetType.create({ name: 'temp-type' });
      const newPet = await Pet.create({
        name: 'Temp Pet', birthDate: '2020-01-01', typeId: newPetType.id, ownerId: newOwner.id
      });

      expect(newOwner).to.exist;
      expect(newPet).to.exist;

      await newOwner.destroy();

      const foundOwner = await Owner.findByPk(newOwner.id);
      const foundPet = await Pet.findByPk(newPet.id);

      expect(foundOwner).to.be.null;
      expect(foundPet).to.be.null;
    });
  });

  describe('Custom Methods', () => {
    let owner;
    let petTypeDog;

    beforeEach(async () => {
      owner = await Owner.findByPk(1, { include: [{ model: Pet, as: 'pets' }] }); // George Franklin (Leo)
      petTypeDog = await PetType.findOne({ where: { name: 'dog' } });

      // Clear existing pets from owner for isolated test of addPet/getPet
      if (owner.pets) {
        owner.pets = [];
      }
    });

    describe('addPet(pet)', () => {
      it('should add a new pet to the owner in memory', async () => {
        const newPet = Pet.build({ name: 'Buddy', birthDate: '2021-01-01', typeId: petTypeDog.id });
        owner.addPet(newPet);
        expect(owner.pets).to.have.lengthOf(1);
        expect(owner.pets[0].name).to.equal('Buddy');
      });

      it('should only add new pets to the in-memory array (isNew checks)', async () => {
        const existingPet = await Pet.findByPk(1); // Leo
        owner.addPet(existingPet); // This should not add if it's not new (isNew() is false)
        expect(owner.pets).to.have.lengthOf(0); // Assuming we cleared it before

        const newPet = Pet.build({ name: 'New Dog', birthDate: '2022-03-15', typeId: petTypeDog.id });
        owner.addPet(newPet);
        expect(owner.pets).to.have.lengthOf(1);
        expect(owner.pets[0].name).to.equal('New Dog');
      });
    });

    describe('getPet(identifier, ignoreNew)', () => {
      let ownerWithPets;
      let existingPet, newPet;

      beforeEach(async () => {
        ownerWithPets = await Owner.create({
          firstName: 'PetFinder', lastName: 'Test', address: '123 Find St', city: 'Find City', telephone: '1111111111'
        });
        petTypeDog = await PetType.findOne({ where: { name: 'dog' } });
        existingPet = await Pet.create({
          name: 'Rex', birthDate: '2020-05-01', typeId: petTypeDog.id, ownerId: ownerWithPets.id
        });
        newPet = Pet.build({ name: 'Spot', birthDate: '2022-01-01', typeId: petTypeDog.id, ownerId: ownerWithPets.id });

        // Manually set `pets` array for the instance for the test
        ownerWithPets.pets = [existingPet, newPet];
      });

      it('should retrieve a pet by ID', () => {
        const foundPet = ownerWithPets.getPet(existingPet.id);
        expect(foundPet.name).to.equal('Rex');
      });

      it('should retrieve a pet by name (case-insensitive)', () => {
        const foundPet = ownerWithPets.getPet('rex');
        expect(foundPet.name).to.equal('Rex');
      });

      it('should return null if pet not found', () => {
        const foundPet = ownerWithPets.getPet('NonExistent');
        expect(foundPet).to.be.null;
      });

      it('should include new pets when ignoreNew is false', () => {
        const foundNewPet = ownerWithPets.getPet('Spot', false);
        expect(foundNewPet.name).to.equal('Spot');
      });

      it('should exclude new pets when ignoreNew is true', () => {
        const foundNewPet = ownerWithPets.getPet('Spot', true);
        expect(foundNewPet).to.be.null;
      });

      it('should handle null or undefined pets array gracefully', () => {
        const ownerNoPets = Owner.build({ id: 99, firstName: 'No', lastName: 'Pets' });
        expect(ownerNoPets.getPet(1)).to.be.null;
        expect(ownerNoPets.getPet('any')).to.be.null;
      });
    });

    describe('addVisit(petId, visit)', () => {
      let ownerWithPet;
      let petToAddVisit;

      beforeEach(async () => {
        ownerWithPet = await Owner.create({
          firstName: 'Visit', lastName: 'Test', address: '123 Visit St', city: 'Visit City', telephone: '2223334444'
        });
        petTypeDog = await PetType.findOne({ where: { name: 'dog' } });
        petToAddVisit = await Pet.create({
          name: 'Fido', birthDate: '2019-10-10', typeId: petTypeDog.id, ownerId: ownerWithPet.id
        });

        // Manually set `pets` array with the pet for the instance for the test
        ownerWithPet.pets = [petToAddVisit];
      });

      it('should add a visit to the specified pet in memory', () => {
        const newVisit = Visit.build({ description: 'Checkup', date: '2023-01-01' });
        ownerWithPet.addVisit(petToAddVisit.id, newVisit);
        expect(petToAddVisit.visits).to.have.lengthOf(1);
        expect(petToAddVisit.visits[0].description).to.equal('Checkup');
      });

      it('should throw an error if petId is null or undefined', () => {
        const newVisit = Visit.build({ description: 'Checkup', date: '2023-01-01' });
        expect(() => ownerWithPet.addVisit(null, newVisit)).to.throw('Pet identifier must not be null!');
        expect(() => ownerWithPet.addVisit(undefined, newVisit)).to.throw('Pet identifier must not be null!');
      });

      it('should throw an error if visit is null or undefined', () => {
        expect(() => ownerWithPet.addVisit(petToAddVisit.id, null)).to.throw('Visit must not be null!');
        expect(() => ownerWithPet.addVisit(petToAddVisit.id, undefined)).to.throw('Visit must not be null!');
      });

      it('should throw an error if pet is not found for the owner', () => {
        const newVisit = Visit.build({ description: 'Checkup', date: '2023-01-01' });
        expect(() => ownerWithPet.addVisit(999, newVisit)).to.throw('Invalid Pet identifier!');
      });
    });
  });
});
