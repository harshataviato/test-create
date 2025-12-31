/**
 * @module test/controllers/visitController
 * @description Unit/Integration tests for visitController.
 */

const visitController = require('../../controllers/visitController');
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

describe('visitController', () => {
  let req, res, next;
  let owner, petType, pet;

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
          'pet.notFoundById': `Pet with ID ${params?.petId} not found.`,
          'visit.newVisitTitle': `New Visit for ${params?.petName || 'Test'}`,
          'validation.required': `${params?.field} is required.`,
          'validation.invalidDate': `${params?.field} must be a valid date.`,
          'validation.futureDate': `${params?.field} cannot be in the future.`,
          'common.visitDate': 'Visit Date',
          'common.description': 'Description',
        };
        return translations[key] || key;
      }),
    };
    next = sinon.stub();

    // Seed data
    owner = await db.Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
    petType = await db.PetType.create({ name: 'Cat' });
    pet = await db.Pet.create({ name: 'Leo', birthDate: moment('2000-09-07').toDate(), typeId: petType.id, ownerId: owner.id });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('showCreateVisitForm', () => {
    it('should render the createOrUpdateVisitForm for a new visit', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      await visitController.showCreateVisitForm(req, res, next);

      expect(res.render.calledOnceWith('pets/createOrUpdateVisitForm', sinon.match({
        owner: sinon.match.has('id', owner.id),
        pet: sinon.match.has('id', pet.id),
        visit: sinon.match.has('visitDate', moment().format('YYYY-MM-DD')),
        title: `New Visit for ${pet.name}`,
        errors: {}
      }))).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent owner', async () => {
      req.params.ownerId = 999;
      req.params.petId = pet.id;
      await visitController.showCreateVisitForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Owner with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent pet', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = 999;
      await visitController.showCreateVisitForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Pet with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page if pet does not belong to owner', async () => {
      const otherOwner = await db.Owner.create({ firstName: 'Other', lastName: 'Owner', address: '1', city: '2', telephone: '1111111111' });
      const otherPet = await db.Pet.create({ name: 'OtherPet', birthDate: moment('2010-01-01').toDate(), typeId: petType.id, ownerId: otherOwner.id });

      req.params.ownerId = owner.id; // Owner ID 1
      req.params.petId = otherPet.id; // Pet ID from owner 2
      await visitController.showCreateVisitForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', sinon.match({ message: `Pet with ID ${otherPet.id} not found.` }))).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      sinon.stub(db.Owner, 'findByPk').throws(new Error('DB Error')); // Simulate DB error for owner fetch
      await visitController.showCreateVisitForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Error');
    });
  });

  describe('processCreateVisitForm', () => {
    it('should create a new visit and redirect to owner details on success', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      req.body = {
        visitDate: '2023-05-20',
        description: 'Routine check-up'
      };
      await visitController.processCreateVisitForm(req, res, next);

      const newVisit = await db.Visit.findOne({ where: { description: 'Routine check-up' } });
      expect(newVisit).to.exist;
      expect(newVisit.petId).to.equal(pet.id);
      expect(res.redirect.calledOnceWith(`/owners/${owner.id}`)).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should re-render form with errors if validation fails', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      req.mockValidationErrors = {
        visitDate: { msg: 'Visit Date must be a valid date.' },
        description: { msg: 'Description is required.' }
      };
      req.body = {
        visitDate: 'invalid-date', // Invalid
        description: '' // Invalid
      };
      await visitController.processCreateVisitForm(req, res, next);

      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnceWith('pets/createOrUpdateVisitForm', sinon.match({
        owner: sinon.match.has('id', owner.id),
        pet: sinon.match.has('id', pet.id),
        visit: req.body,
        title: `New Visit for ${pet.name}`,
        errors: req.mockValidationErrors
      }))).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should handle Sequelize validation errors', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      req.mockValidationErrors = undefined; // No express-validator errors
      req.body = {
        visitDate: moment().add(1, 'day').format('YYYY-MM-DD'), // Future date, Sequelize will catch
        description: 'Valid description'
      };
      await visitController.processCreateVisitForm(req, res, next);

      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnce).to.be.true;
      const renderArgs = res.render.args[0][1];
      expect(renderArgs.errors.visitDate.msg).to.equal('Visit date cannot be in the future.');
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent owner when processing form', async () => {
      req.params.ownerId = 999;
      req.params.petId = pet.id;
      req.body = { /* valid data */ };
      await visitController.processCreateVisitForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Owner with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent pet when processing form', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = 999;
      req.body = { /* valid data */ };
      await visitController.processCreateVisitForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Pet with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page if pet does not belong to owner when processing form', async () => {
      const otherOwner = await db.Owner.create({ firstName: 'Other', lastName: 'Owner', address: '1', city: '2', telephone: '1111111111' });
      const otherPet = await db.Pet.create({ name: 'OtherPet', birthDate: moment('2010-01-01').toDate(), typeId: petType.id, ownerId: otherOwner.id });

      req.params.ownerId = owner.id; // Owner ID 1
      req.params.petId = otherPet.id; // Pet ID from owner 2
      req.body = { visitDate: '2023-01-01', description: 'valid' };
      await visitController.processCreateVisitForm(req, res, next);

      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', sinon.match({ message: `Pet with ID ${otherPet.id} not found.` }))).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails after validation', async () => {
      req.params.ownerId = owner.id;
      req.params.petId = pet.id;
      req.mockValidationErrors = undefined;
      req.body = {
        visitDate: '2023-01-01',
        description: 'Valid description'
      };
      sinon.stub(db.Visit, 'create').throws(new Error('DB Error'));
      await visitController.processCreateVisitForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Error');
    });
  });
});

