/**
 * @module test/controllers/petController
 * @description Unit/Integration tests for petController.
 */

const petController = require('../../controllers/petController');
const db = require('../../config/database');
const { validationResult } = require('express-validator');
const sinon = require('sinon');
const moment = require('moment');

// Mock `express-validator`'s `validationResult`
sinon.stub(require('express-validator'), 'validationResult').callsFake((req) => {
  return {
    isEmpty: () => req.mockValidationErrors ? false : true,
    mapped: () => req.mockValidationErrors || {},
    array: () => Object.values(req.mockValidationErrors || {}).map(err => ({ msg: err.msg }))
  };
});

describe('petController', () => {
  let req, res, next;
  let owner, petTypeCat, petTypeDog, pet;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true }); // Clean slate for DB

    req = {
      params: {},
      query: {},
      body: {},
      app: {
        get: sinon.stub().withArgs('env').returns('development') // For error handling
      }
    };
    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
      status: sinon.stub().returnsThis(),
      locals: {},
      __: sinon.stub((key, params) => {
        const translations = {
          'common.error': 'Error',
          'owner.notFoundById': `Owner with ID ${params?.ownerId} not found.`,
          'pet.newPetTitle': `New Pet for ${params?.ownerName || 'Test'}`,
          'pet.editPetTitle': `Edit Pet: ${params?.petName || 'Test'}`,
          'pet.notFoundById': `Pet with ID ${params?.petId} not found.`,
          'validation.required': `${params?.field} is required.`,
          'validation.invalidDate': `${params?.field} must be a valid date.`,
          'validation.futureDate': `${params?.field} cannot be in the future.`,
          'validation.invalidPetType': 'Invalid pet type selected.',
          'common.name': 'Name',
          'common.birthDate': 'Birth Date',
          'common.type': 'Type',
        };
        return translations[key] || key;
      }),
    };
    next = sinon.stub();

    // Seed data
    owner = await db.Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
    petTypeCat = await db.PetType.create({ name: 'Cat' });
    petTypeDog = await db.PetType.create({ name: 'Dog' });
    pet = await db.Pet.create({ name: 'Leo', birthDate: moment('2000-09-07').toDate(), typeId: petTypeCat.id, ownerId: owner.id });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('showCreatePetForm', () => {
    it('should render the createOrUpdatePetForm for a new pet', async () => {
      req.params.ownerId = owner.id;
      await petController.showCreatePetForm(req, res, next);

      expect(res.render.calledOnceWith('pets/createOrUpdatePetForm', sinon.match({
        owner: sinon.match.has('id', owner.id),
        pet: sinon.match.has('ownerId', owner.id),
        petTypes: sinon.match.array.and(sinon.match.has('length', 2)),
        title: `New Pet for ${owner.fullName}`,
        isNew: true,
        errors: {}
      }))).to.be.true;
      expect(res.render.args[0][1].pet.birthDate).to.equal(moment().format('YYYY-MM-DD'));
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent owner', async () => {
      req.params.ownerId = 999;
      await petController.showCreatePetForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Owner with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails', async () => {
      req.params.ownerId = owner.id;
      sinon.stub(db.Owner, 'findByPk').throws(new Error('DB Error'));
      await petController.showCreatePetForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Error');
    });
  });

  describe('processCreatePetForm', () => {
    it('should create a new pet and redirect to owner details on success', async () => {
      req.params.ownerId = owner.id;
      req.body = {
        name: 'NewPet',
        birthDate: '2020-01-01',
        typeId: petTypeDog.id
      };
      await petController.processCreatePetForm(req, res, next);

      const newPet = await db.Pet.findOne({ where: { name: 'NewPet' } });
      expect(newPet).to.exist;
      expect(newPet.ownerId).to.equal(owner.id);
      expect(res.redirect.calledOnceWith(`/owners/${owner.id}`)).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should re-render form with errors if validation fails', async () => {
      req.params.ownerId = owner.id;
      req.mockValidationErrors = {
        name: { msg: 'Name is required.' },
        birthDate: { msg: 'Birth Date must be a valid date.' }
      };
      req.body = {
        name: '', // Invalid
        birthDate: 'invalid-date', // Invalid
        typeId: petTypeDog.id
      };
      await petController.processCreatePetForm(req, res, next);

      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnceWith('pets/createOrUpdatePetForm', sinon.match({
        owner: sinon.match.has('id', owner.id),
        pet: req.body,
        petTypes: sinon.match.array,
        title: `New Pet for ${owner.fullName}`,
        isNew: true,
        errors: req.mockValidationErrors
      }))).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should handle Sequelize validation errors', async () => {
      req.params.ownerId = owner.id;
      req.mockValidationErrors = undefined; // No express-validator errors
      req.body = {
        name: 'InvalidPet',
        birthDate: moment().add(1, 'day').format('YYYY-MM-DD'), // Future date, Sequelize will catch
        typeId: petTypeDog.id
      };
      await petController.processCreatePetForm(req, res, next);

      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnce).to.be.true;
      const renderArgs = res.render.args[0][1];
      expect(renderArgs.errors.birthDate.msg).to.equal('Birth date cannot be in the future.');
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent owner when processing form', async () => {
      req.params.ownerId = 999;
      req.body = {
        name: 'NewPet',
        birthDate: '2020-01-01',
        typeId: petTypeDog.id
      };
      await petController.processCreatePetForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Owner with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails after validation', async () => {
      req.params.ownerId = owner.id;
      req.mockValidationErrors = undefined;
      req.body = {
        name: 'NewPet',
        birthDate: '2020-01-01',
        typeId: petTypeDog.id
      };
      sinon.stub(db.Pet, 'create').throws(new Error('DB Error'));
      await petController.processCreatePetForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Error');
    });
  });

  describe('showUpdatePetForm', () => {
    it('should render the createOrUpdatePetForm with pet data for editing', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      await petController.showUpdatePetForm(req, res, next);

      expect(res.render.calledOnceWith('pets/createOrUpdatePetForm', sinon.match({
        owner: sinon.match.has('id', owner.id),
        pet: sinon.match.has('id', pet.id).and(sinon.match.has('birthDate', moment(pet.birthDate).format('YYYY-MM-DD'))), // Date formatted
        petTypes: sinon.match.array,
        title: `Edit Pet: ${pet.name}`,
        isNew: false,
        errors: {}
      }))).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent owner', async () => {
      req.params.ownerId = 999;
      req.params.petId = pet.id;
      await petController.showUpdatePetForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Owner with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent pet', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = 999;
      await petController.showUpdatePetForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Pet with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page if pet does not belong to owner', async () => {
      const otherOwner = await db.Owner.create({ firstName: 'Other', lastName: 'Owner', address: '1', city: '2', telephone: '1111111111' });
      const otherPet = await db.Pet.create({ name: 'OtherPet', birthDate: moment('2010-01-01').toDate(), typeId: petTypeDog.id, ownerId: otherOwner.id });

      req.params.ownerId = owner.id; // Owner ID 1
      req.params.petId = otherPet.id; // Pet ID from owner 2
      await petController.showUpdatePetForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', sinon.match({ message: `Pet with ID ${otherPet.id} not found.` }))).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      sinon.stub(db.Owner, 'findByPk').throws(new Error('DB Error')); // Simulate DB error for owner fetch
      await petController.showUpdatePetForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Error');
    });
  });

  describe('processUpdatePetForm', () => {
    it('should update a pet and redirect to owner details on success', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      req.body = {
        name: 'UpdatedLeo',
        birthDate: '2001-01-01',
        typeId: petTypeDog.id
      };
      await petController.processUpdatePetForm(req, res, next);

      const updatedPet = await db.Pet.findByPk(pet.id);
      expect(updatedPet.name).to.equal('UpdatedLeo');
      expect(moment(updatedPet.birthDate).format('YYYY-MM-DD')).to.equal('2001-01-01');
      expect(updatedPet.typeId).to.equal(petTypeDog.id);
      expect(res.redirect.calledOnceWith(`/owners/${owner.id}`)).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should re-render form with errors if validation fails', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      req.mockValidationErrors = {
        name: { msg: 'Name is required.' },
        birthDate: { msg: 'Birth Date cannot be in the future.' }
      };
      req.body = {
        name: '', // Invalid
        birthDate: moment().add(1, 'day').format('YYYY-MM-DD'), // Invalid
        typeId: petTypeCat.id
      };
      await petController.processUpdatePetForm(req, res, next);

      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnceWith('pets/createOrUpdatePetForm', sinon.match({
        owner: sinon.match.has('id', owner.id),
        pet: sinon.match.has('id', pet.id), // Original pet ID is preserved for rendering
        petTypes: sinon.match.array,
        title: sinon.match(/Edit Pet:/),
        isNew: false,
        errors: req.mockValidationErrors
      }))).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should handle Sequelize validation errors during update', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      req.mockValidationErrors = undefined; // No express-validator errors
      req.body = {
        name: 'ValidName',
        birthDate: moment().add(1, 'day').format('YYYY-MM-DD'), // Future date, Sequelize will catch
        typeId: petTypeCat.id
      };
      await petController.processUpdatePetForm(req, res, next);

      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnce).to.be.true;
      const renderArgs = res.render.args[0][1];
      expect(renderArgs.errors.birthDate.msg).to.equal('Birth date cannot be in the future.');
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent owner during update', async () => {
      req.params.ownerId = 999;
      req.params.petId = pet.id;
      req.body = { /* valid data */ };
      await petController.processUpdatePetForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Owner with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent pet during update', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = 999;
      req.body = { /* valid data */ };
      await petController.processUpdatePetForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Pet with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page if pet does not belong to owner during update', async () => {
      const otherOwner = await db.Owner.create({ firstName: 'Other', lastName: 'Owner', address: '1', city: '2', telephone: '1111111111' });
      const otherPet = await db.Pet.create({ name: 'OtherPet', birthDate: moment('2010-01-01').toDate(), typeId: petTypeDog.id, ownerId: otherOwner.id });

      req.params.ownerId = owner.id; // Owner ID 1
      req.params.petId = otherPet.id; // Pet ID from owner 2
      req.body = { name: 'UpdatedName', birthDate: '2010-01-01', typeId: petTypeDog.id };
      await petController.processUpdatePetForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', sinon.match({ message: `Pet with ID ${otherPet.id} not found.` }))).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails during update', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      req.body = {
        name: 'UpdatedName',
        birthDate: '2010-01-01',
        typeId: petTypeCat.id
      };
      sinon.stub(db.Pet, 'findByPk').resolves(pet); // Ensure pet is found
      sinon.stub(pet, 'update').throws(new Error('DB Update Error'));
      await petController.processUpdatePetForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Update Error');
    });
  });
});

