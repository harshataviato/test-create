// test/services/ownerService.test.js
const { expect } = require('chai');
const ownerService = require('../../src/services/ownerService');
const { sequelize, models } = require('../../test/config/testDb');
const { Owner, Pet, PetType, Visit } = models;
const moment = require('moment');

describe('Owner Service', () => {
  beforeEach(async () => {
    // Truncate all tables and re-seed for a clean state before each test
    await sequelize.query('TRUNCATE TABLE owners, pets, types, visits, vets, specialties, vet_specialties RESTART IDENTITY CASCADE;');

    // Minimal seed data for owner tests
    await Owner.bulkCreate([
      { id: 1, firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' },
      { id: 2, firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' },
      { id: 3, firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' },
      { id: 4, firstName: 'Harold', lastName: 'Davis', address: '563 Friendly St.', city: 'Windsor', telephone: '6085553198' },
      { id: 5, firstName: 'Peter', lastName: 'McTavish', address: '2387 S. Fair Way', city: 'Madison', telephone: '6085552765' }
    ]);
    await PetType.bulkCreate([
      { id: 1, name: 'cat' },
      { id: 2, name: 'dog' }
    ]);
    await Pet.bulkCreate([
      { id: 1, name: 'Leo', birthDate: '2000-09-07', typeId: 1, ownerId: 1 },
      { id: 2, name: 'Max', birthDate: '2001-01-15', typeId: 2, ownerId: 1 },
      { id: 3, name: 'Rosy', birthDate: '2002-03-20', typeId: 2, ownerId: 2 }
    ]);
    await Visit.bulkCreate([
      { id: 1, petId: 1, visitDate: '2010-03-04', description: 'rabies shot' },
      { id: 2, petId: 1, visitDate: '2011-04-05', description: 'checkup' },
      { id: 3, petId: 2, visitDate: '2012-01-01', description: 'vaccination' }
    ]);
  });

  describe('findOwnerById', () => {
    it('should retrieve an owner by ID', async () => {
      const owner = await ownerService.findOwnerById(1);
      expect(owner).to.exist;
      expect(owner.firstName).to.equal('George');
    });

    it('should return null if owner not found', async () => {
      const owner = await ownerService.findOwnerById(999);
      expect(owner).to.be.null;
    });
  });

  describe('findOwnerByIdWithPetsAndVisits', () => {
    it('should retrieve an owner with their pets, pet types, and visits', async () => {
      const owner = await ownerService.findOwnerByIdWithPetsAndVisits(1);
      expect(owner).to.exist;
      expect(owner.firstName).to.equal('George');
      expect(owner.pets).to.be.an('array').with.lengthOf(2);

      const leo = owner.pets.find(p => p.name === 'Leo');
      expect(leo).to.exist;
      expect(leo.type.name).to.equal('cat');
      expect(leo.visits).to.be.an('array').with.lengthOf(2);
      expect(leo.visits[0].description).to.equal('rabies shot'); // Visits ordered by date ASC
      expect(moment(leo.visits[0].visitDate).format('YYYY-MM-DD')).to.equal('2010-03-04');
    });

    it('should return null if owner not found', async () => {
      const owner = await ownerService.findOwnerByIdWithPetsAndVisits(999);
      expect(owner).to.be.null;
    });

    it('should return owner with empty pets array if no pets', async () => {
      const owner = await ownerService.findOwnerByIdWithPetsAndVisits(3); // Eduardo has no pets
      expect(owner).to.exist;
      expect(owner.firstName).to.equal('Eduardo');
      expect(owner.pets).to.be.an('array').with.lengthOf(0);
    });
  });

  describe('findPaginatedForOwnersLastName', () => {
    it('should find owners by partial last name and paginate (single result)', async () => {
      const { owners, totalItems, totalPages } = await ownerService.findPaginatedForOwnersLastName('Fra', 1, 5);
      expect(owners).to.be.an('array').with.lengthOf(1);
      expect(owners[0].lastName).to.equal('Franklin');
      expect(totalItems).to.equal(1);
      expect(totalPages).to.equal(1);
    });

    it('should find owners by full last name and paginate', async () => {
      const { owners, totalItems, totalPages } = await ownerService.findPaginatedForOwnersLastName('Franklin', 1, 5);
      expect(owners).to.be.an('array').with.lengthOf(1);
      expect(owners[0].lastName).to.equal('Franklin');
      expect(totalItems).to.equal(1);
      expect(totalPages).to.equal(1);
    });

    it('should find multiple owners by partial last name and paginate', async () => {
      const { owners, totalItems, totalPages } = await ownerService.findPaginatedForOwnersLastName('Da', 1, 5); // Davis (Betty), Davis (Harold)
      expect(owners).to.be.an('array').with.lengthOf(2);
      expect(owners.map(o => o.lastName)).to.deep.equal(['Davis', 'Davis']); // Sorted by lastName
      expect(totalItems).to.equal(2);
      expect(totalPages).to.equal(1);
    });

    it('should return empty array if no owners found', async () => {
      const { owners, totalItems, totalPages } = await ownerService.findPaginatedForOwnersLastName('NonExistent', 1, 5);
      expect(owners).to.be.an('array').with.lengthOf(0);
      expect(totalItems).to.equal(0);
      expect(totalPages).to.equal(0);
    });

    it('should return all owners when lastName is empty with pagination', async () => {
      const { owners, totalItems, totalPages } = await ownerService.findPaginatedForOwnersLastName('', 1, 2);
      expect(owners).to.be.an('array').with.lengthOf(2);
      expect(totalItems).to.equal(5);
      expect(totalPages).to.equal(3); // 5 items, 2 per page -> 3 pages
      expect(owners[0].lastName).to.equal('Davis'); // Sorted alphabetically
      expect(owners[1].lastName).to.equal('Davis');
    });

    it('should return correct page for pagination', async () => {
      const { owners, totalItems, totalPages } = await ownerService.findPaginatedForOwnersLastName('', 2, 2);
      expect(owners).to.be.an('array').with.lengthOf(2);
      expect(totalItems).to.equal(5);
      expect(totalPages).to.equal(3);
      expect(owners[0].lastName).to.equal('Franklin');
      expect(owners[1].lastName).to.equal('McTavish');
    });
  });

  describe('createOwner', () => {
    it('should create a new owner', async () => {
      const ownerData = {
        firstName: 'New',
        lastName: 'Owner',
        address: '100 Test St',
        city: 'Testville',
        telephone: '5551234567'
      };
      const newOwner = await ownerService.createOwner(ownerData);
      expect(newOwner).to.exist;
      expect(newOwner.lastName).to.equal('Owner');
      const foundOwner = await Owner.findByPk(newOwner.id);
      expect(foundOwner).to.exist;
    });
  });

  describe('updateOwner', () => {
    it('should update an existing owner', async () => {
      const updatedData = {
        address: 'New Address',
        city: 'New City',
        telephone: '1112223333'
      };
      const updatedOwner = await ownerService.updateOwner(1, updatedData);
      expect(updatedOwner).to.exist;
      expect(updatedOwner.address).to.equal('New Address');
      const foundOwner = await Owner.findByPk(1);
      expect(foundOwner.address).to.equal('New Address');
    });

    it('should return null if owner to update is not found', async () => {
      const updatedData = { firstName: 'NonExistent' };
      const updatedOwner = await ownerService.updateOwner(999, updatedData);
      expect(updatedOwner).to.be.null;
    });
  });

  describe('addVisitToPet', () => {
    it('should add a visit to a specified pet of an owner', async () => {
      const ownerId = 1;
      const petId = 1; // Leo
      const newVisit = new Visit({ visitDate: '2023-10-26', description: 'Routine checkup' });

      await ownerService.addVisitToPet(ownerId, petId, newVisit);

      const ownerWithVisits = await ownerService.findOwnerByIdWithPetsAndVisits(ownerId);
      const pet = ownerWithVisits.pets.find(p => p.id === petId);
      expect(pet.visits).to.be.an('array').with.lengthOf(3);
      expect(pet.visits.find(v => v.description === 'Routine checkup')).to.exist;
    });

    it('should throw error if owner not found', async () => {
      const newVisit = new Visit({ visitDate: '2023-10-26', description: 'Routine checkup' });
      await expect(ownerService.addVisitToPet(999, 1, newVisit))
        .to.be.rejectedWith('Owner with ID 999 not found.');
    });

    it('should throw error if pet not found for owner', async () => {
      const newVisit = new Visit({ visitDate: '2023-10-26', description: 'Routine checkup' });
      await expect(ownerService.addVisitToPet(1, 999, newVisit))
        .to.be.rejectedWith('Pet with ID 999 not found for owner ID 1.');
    });

    it('should successfully add a visit even if pet had no previous visits', async () => {
      await Pet.create({ id: 4, name: 'EmptyPet', birthDate: '2022-01-01', typeId: 1, ownerId: 1 });
      const newVisit = new Visit({ visitDate: '2023-11-01', description: 'First visit' });

      await ownerService.addVisitToPet(1, 4, newVisit);

      const ownerWithVisits = await ownerService.findOwnerByIdWithPetsAndVisits(1);
      const pet = ownerWithVisits.pets.find(p => p.id === 4);
      expect(pet.visits).to.be.an('array').with.lengthOf(1);
      expect(pet.visits[0].description).to.equal('First visit');
    });
  });
});
