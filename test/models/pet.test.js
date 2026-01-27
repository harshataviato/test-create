/**
 * @fileoverview Test suite for the Pet model.
 * Verifies pet-specific properties, methods, and associations.
 */

const { expect } = require('chai');
const db = require('../../models'); // Adjust path as necessary
const { Pet, Owner, PetType, Visit } = db;

describe('Pet Model', () => {
  let owner;
  let petTypeCat;

  beforeEach(async () => {
    // Ensure we have an owner and a pet type for association tests
    owner = await Owner.findByPk(1); // George Franklin
    petTypeCat = await PetType.findOne({ where: { name: 'cat' } });
  });

  describe('Properties and Validations', () => {
    it('should create a pet with valid data', async () => {
      const newPet = await Pet.create({
        name: 'Whiskers',
        birthDate: '2022-05-15',
        typeId: petTypeCat.id,
        ownerId: owner.id
      });
      expect(newPet).to.exist;
      expect(newPet.name).to.equal('Whiskers');
      expect(newPet.birthDate).to.equal('2022-05-15');
      expect(newPet.typeId).to.equal(petTypeCat.id);
      expect(newPet.ownerId).to.equal(owner.id);
    });

    it('should require a name', async () => {
      let error;
      try {
        await Pet.create({
          birthDate: '2022-01-01', typeId: petTypeCat.id, ownerId: owner.id
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('name');
    });

    it('should not allow an empty name', async () => {
      let error;
      try {
        await Pet.create({
          name: '', birthDate: '2022-01-01', typeId: petTypeCat.id, ownerId: owner.id
        });
      } catch (e) { error = e; }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('name');
    });

    it('should allow null birthDate', async () => {
      const newPet = await Pet.create({
        name: 'Spot', typeId: petTypeCat.id, ownerId: owner.id
      });
      expect(newPet).to.exist;
      expect(newPet.birthDate).to.be.null;
    });
  });

  describe('Associations', () => {
    it('should fetch associated owner', async () => {
      const pet = await Pet.findByPk(1, { include: [{ model: Owner, as: 'owner' }] }); // Leo, owner George Franklin
      expect(pet).to.exist;
      expect(pet.owner.firstName).to.equal('George');
    });

    it('should fetch associated type', async () => {
      const pet = await Pet.findByPk(1, { include: [{ model: PetType, as: 'type' }] }); // Leo, type cat
      expect(pet).to.exist;
      expect(pet.type.name).to.equal('cat');
    });

    it('should fetch associated visits', async () => {
      const pet = await Pet.findByPk(7, { include: [{ model: Visit, as: 'visits' }] }); // Samantha
      expect(pet).to.exist;
      expect(pet.visits).to.have.lengthOf(2);
      expect(pet.visits[0].description).to.equal('rabies shot');
    });

    it('should delete associated visits when a pet is deleted (CASCADE)', async () => {
      // Create a temporary pet and visit to test cascade delete
      const newPet = await Pet.create({
        name: 'Temp Pet For Delete', birthDate: '2020-01-01', typeId: petTypeCat.id, ownerId: owner.id
      });
      const newVisit = await Visit.create({
        visitDate: '2023-01-01', description: 'Temp Visit', petId: newPet.id
      });

      expect(newPet).to.exist;
      expect(newVisit).to.exist;

      await newPet.destroy();

      const foundPet = await Pet.findByPk(newPet.id);
      const foundVisit = await Visit.findByPk(newVisit.id);

      expect(foundPet).to.be.null;
      expect(foundVisit).to.be.null;
    });
  });

  describe('Custom Methods and Getters/Setters', () => {
    let testPet;
    let testOwner;
    let testPetType;

    beforeEach(async () => {
      testOwner = await Owner.create({ firstName: 'Test', lastName: 'Owner', address: '123 Test St', city: 'Test City', telephone: '1111111111' });
      testPetType = await PetType.create({ name: 'test-type' });
      testPet = await Pet.create({
        name: 'Test Pet',
        birthDate: '2021-03-01',
        typeId: testPetType.id,
        ownerId: testOwner.id
      });
      // Clear visits for isolated test
      testPet.visits = [];
    });

    describe('addVisit(visit)', () => {
      it('should add a visit to the pet in memory', () => {
        const newVisit = Visit.build({ description: 'Vaccination', date: '2023-05-01' });
        testPet.addVisit(newVisit);
        expect(testPet.visits).to.have.lengthOf(1);
        expect(testPet.visits[0].description).to.equal('Vaccination');
      });

      it('should initialize visits array if null', () => {
        const petWithoutVisits = Pet.build({ name: 'Empty', typeId: testPetType.id, ownerId: testOwner.id });
        expect(petWithoutVisits.visits).to.be.undefined; // Should be undefined initially
        petWithoutVisits.addVisit(Visit.build({ description: 'New', date: '2023-06-01' }));
        expect(petWithoutVisits.visits).to.have.lengthOf(1);
      });
    });

    describe('getVisits() getter', () => {
      it('should return an empty array if no visits are loaded', () => {
        const petWithoutVisits = Pet.build({ name: 'Empty', typeId: testPetType.id, ownerId: testOwner.id });
        expect(petWithoutVisits.getVisits()).to.be.an('array').that.is.empty;
      });

      it('should return the loaded visits', () => {
        testPet.visits = [Visit.build({ description: 'Existing', date: '2023-07-01' })];
        expect(testPet.getVisits()).to.have.lengthOf(1);
      });
    });

    describe('setType(type) setter', () => {
      it('should set both type object and typeId', async () => {
        const newType = await PetType.create({ name: 'new-type' });
        testPet.setType(newType);
        expect(testPet.type.name).to.equal('new-type');
        expect(testPet.typeId).to.equal(newType.id);
      });

      it('should handle null type', () => {
        testPet.setType(null);
        expect(testPet.type).to.be.null;
        expect(testPet.typeId).to.be.null;
      });
    });

    describe('setOwner(owner) setter', () => {
      it('should set both owner object and ownerId', async () => {
        const newOwner = await Owner.create({ firstName: 'Another', lastName: 'Owner', address: '456 Elm St', city: 'Otherville', telephone: '9998887777' });
        testPet.setOwner(newOwner);
        expect(testPet.owner.firstName).to.equal('Another');
        expect(testPet.ownerId).to.equal(newOwner.id);
      });

      it('should handle null owner', () => {
        testPet.setOwner(null);
        expect(testPet.owner).to.be.null;
        expect(testPet.ownerId).to.be.null;
      });
    });
  });
});
