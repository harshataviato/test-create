/**
 * @module test/controllers/ownerController
 * @description Unit/Integration tests for ownerController.
 */

const ownerController = require('../../controllers/ownerController');
const db = require('../../config/database');
const { validationResult } = require('express-validator');
const sinon = require('sinon');
const moment = require('moment');
const cache = require('../../utils/cache');

// Mock `express-validator`'s `validationResult`
sinon.stub(require('express-validator'), 'validationResult').callsFake((req) => {
  return {
    isEmpty: () => req.mockValidationErrors ? false : true,
    mapped: () => req.mockValidationErrors || {},
    array: () => Object.values(req.mockValidationErrors || {}).map(err => ({ msg: err.msg }))
  };
});

describe('ownerController', () => {
  let req, res, next;
  let owner1, owner2, owner3, petTypeCat, petTypeDog, pet1, pet2, visit1, visit2;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true }); // Clean slate for DB
    cache.clear(); // Clear cache

    req = {
      params: {},
      query: {},
      body: {},
      flash: sinon.stub(), // Mock flash messages
      app: {
        get: sinon.stub().withArgs('env').returns('development') // For error handling
      }
    };
    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
      status: sinon.stub().returnsThis(),
      locals: {}, // To capture res.locals
      __: sinon.stub((key, params) => {
        // Simple i18n mock, return key or a predefined string
        const translations = {
          'owner.findOwnerTitle': 'Find Owners',
          'owner.newOwnerTitle': 'New Owner',
          'owner.editOwnerTitle': `Edit Owner: ${params?.ownerName || 'Test'}`,
          'owner.ownerListTitle': 'Owners',
          'owner.ownerDetailsTitle': `Owner Information: ${params?.ownerName || 'Test'}`,
          'common.error': 'Error',
          'owner.notFound': 'No owners found',
          'owner.notFoundById': `Owner with ID ${params?.ownerId} not found.`,
          'common.firstName': 'First Name',
          'common.lastName': 'Last Name',
          'common.address': 'Address',
          'common.city': 'City',
          'common.telephone': 'Telephone',
          'validation.required': `${params?.field} is required.`,
          'validation.minLength': `${params?.field} must be at least ${params?.min} characters long.`,
          'validation.maxLength': `${params?.field} cannot exceed ${params?.max} characters.`,
          'validation.invalidPhone': `${params?.field} must be a 10-digit number.`,
          'pet.notFoundById': `Pet with ID ${params?.petId} not found.`,
        };
        return translations[key] || key;
      }),
    };
    next = sinon.stub();

    // Seed data
    owner1 = await db.Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
    owner2 = await db.Owner.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' });
    owner3 = await db.Owner.create({ firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' });

    petTypeCat = await db.PetType.create({ name: 'Cat' });
    petTypeDog = await db.PetType.create({ name: 'Dog' });

    pet1 = await db.Pet.create({ name: 'Leo', birthDate: moment('2000-09-07').toDate(), typeId: petTypeCat.id, ownerId: owner1.id });
    pet2 = await db.Pet.create({ name: 'Spot', birthDate: moment('2015-03-10').toDate(), typeId: petTypeDog.id, ownerId: owner2.id });

    visit1 = await db.Visit.create({ petId: pet1.id, visitDate: moment('2010-01-01').toDate(), description: 'neutered' });
    visit2 = await db.Visit.create({ petId: pet1.id, visitDate: moment('2010-01-02').toDate(), description: 'rabies shot' });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('showFindOwnerForm', () => {
    it('should render the findOwners form', () => {
      ownerController.showFindOwnerForm(req, res);
      expect(res.render.calledOnceWith('owners/findOwners', { owner: {}, title: 'Find Owners' })).to.be.true;
    });
  });

  describe('processFindOwnerForm', () => {
    it('should redirect to owner details if exactly one owner is found', async () => {
      req.query.lastName = 'Franklin';
      await ownerController.processFindOwnerForm(req, res, next);
      expect(res.redirect.calledOnceWith(`/owners/${owner1.id}`)).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render ownersList if multiple owners are found', async () => {
      req.query.lastName = 'a'; // Matches Franklin, Davis, Rodriquez (contains 'a')
      await ownerController.processFindOwnerForm(req, res, next);
      expect(res.render.calledOnce).to.be.true;
      expect(res.render.calledWith('owners/ownersList')).to.be.true;
      const { owners } = res.render.args[0][1];
      expect(owners).to.have.lengthOf(3);
      expect(owners[0].lastName).to.equal('Davis'); // Ordered by lastName
      expect(next.notCalled).to.be.true;
    });

    it('should render ownersList with all owners if no lastName is provided', async () => {
      req.query.lastName = '';
      await ownerController.processFindOwnerForm(req, res, next);
      expect(res.render.calledOnce).to.be.true;
      expect(res.render.calledWith('owners/ownersList')).to.be.true;
      const { owners } = res.render.args[0][1];
      expect(owners).to.have.lengthOf(3);
      expect(next.notCalled).to.be.true;
    });

    it('should re-render findOwners with error if no owners are found', async () => {
      req.query.lastName = 'NonExistent';
      await ownerController.processFindOwnerForm(req, res, next);
      expect(res.render.calledOnce).to.be.true;
      expect(res.render.calledWith('owners/findOwners', {
        owner: {},
        title: 'Find Owners',
        errors: { lastName: 'No owners found' }
      })).to.be.true;
      expect(req.flash.calledOnceWith('error', 'No owners found')).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails', async () => {
      sinon.stub(db.Owner, 'findAll').throws(new Error('DB Error'));
      req.query.lastName = 'Test';
      await ownerController.processFindOwnerForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Error');
    });
  });

  describe('showOwnerDetails', () => {
    it('should render ownerDetails with owner and pets/visits', async () => {
      req.params.ownerId = owner1.id;
      await ownerController.showOwnerDetails(req, res, next);
      expect(res.render.calledOnce).to.be.true;
      expect(res.render.calledWith('owners/ownerDetails')).to.be.true;
      const { owner } = res.render.args[0][1];
      expect(owner.id).to.equal(owner1.id);
      expect(owner.pets).to.have.lengthOf(1);
      expect(owner.pets[0].id).to.equal(pet1.id);
      expect(owner.pets[0].type.name).to.equal(petTypeCat.name);
      expect(owner.pets[0].visits).to.have.lengthOf(2);
      expect(owner.pets[0].visits[0].id).to.equal(visit1.id); // Visits ordered by date ASC
      expect(owner.pets[0].visits[1].id).to.equal(visit2.id);
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent owner', async () => {
      req.params.ownerId = 999;
      await ownerController.showOwnerDetails(req, res, next);
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Owner with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails', async () => {
      sinon.stub(db.Owner, 'findByPk').throws(new Error('DB Error'));
      req.params.ownerId = owner1.id;
      await ownerController.showOwnerDetails(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Error');
    });
  });

  describe('showCreateOwnerForm', () => {
    it('should render the createOrUpdateOwnerForm for a new owner', () => {
      ownerController.showCreateOwnerForm(req, res);
      expect(res.render.calledOnceWith('owners/createOrUpdateOwnerForm', {
        owner: {},
        title: 'New Owner',
        isNew: true,
        errors: {}
      })).to.be.true;
    });
  });

  describe('processCreateOwnerForm', () => {
    it('should create a new owner and redirect to details on success', async () => {
      req.body = {
        firstName: 'New',
        lastName: 'Owner',
        address: '789 Pine St',
        city: 'Newtown',
        telephone: '1002003000'
      };
      await ownerController.processCreateOwnerForm(req, res, next);
      const newOwner = await db.Owner.findOne({ where: { lastName: 'Owner' } });
      expect(newOwner).to.exist;
      expect(res.redirect.calledOnceWith(`/owners/${newOwner.id}`)).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should re-render form with errors if validation fails', async () => {
      req.mockValidationErrors = {
        firstName: { msg: 'First Name is required.' },
        telephone: { msg: 'Telephone must be a 10-digit number.' }
      };
      req.body = {
        firstName: '', // Invalid
        lastName: 'Invalid',
        address: 'Some Address',
        city: 'Some City',
        telephone: '123' // Invalid
      };
      await ownerController.processCreateOwnerForm(req, res, next);
      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnceWith('owners/createOrUpdateOwnerForm', {
        owner: req.body,
        title: 'New Owner',
        isNew: true,
        errors: req.mockValidationErrors
      })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should handle Sequelize validation errors', async () => {
      req.mockValidationErrors = undefined; // No express-validator errors
      req.body = {
        firstName: 'New',
        lastName: 'Owner',
        address: '789 Pine St',
        city: 'Newtown',
        telephone: 'invalid' // Sequelize will catch this
      };
      await ownerController.processCreateOwnerForm(req, res, next);
      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnce).to.be.true;
      const renderArgs = res.render.args[0][1];
      expect(renderArgs.errors.telephone.msg).to.equal('Telephone must be a 10-digit number.');
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails after validation', async () => {
      req.mockValidationErrors = undefined;
      req.body = {
        firstName: 'New',
        lastName: 'Owner',
        address: '789 Pine St',
        city: 'Newtown',
        telephone: '1002003000'
      };
      sinon.stub(db.Owner, 'create').throws(new Error('DB Error'));
      await ownerController.processCreateOwnerForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Error');
    });
  });

  describe('showUpdateOwnerForm', () => {
    it('should render the createOrUpdateOwnerForm with owner data for editing', async () => {
      req.params.ownerId = owner1.id;
      await ownerController.showUpdateOwnerForm(req, res, next);
      expect(res.render.calledOnceWith('owners/createOrUpdateOwnerForm', {
        owner: sinon.match.has('id', owner1.id),
        title: `Edit Owner: ${owner1.fullName}`,
        isNew: false,
        errors: {}
      })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent owner', async () => {
      req.params.ownerId = 999;
      await ownerController.showUpdateOwnerForm(req, res, next);
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Owner with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails', async () => {
      sinon.stub(db.Owner, 'findByPk').throws(new Error('DB Error'));
      req.params.ownerId = owner1.id;
      await ownerController.showUpdateOwnerForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Error');
    });
  });

  describe('processUpdateOwnerForm', () => {
    it('should update an owner and redirect to details on success', async () => {
      req.params.ownerId = owner1.id;
      req.body = {
        firstName: 'Updated',
        lastName: 'Franklin',
        address: 'New Address',
        city: 'New City',
        telephone: '1112223333'
      };
      await ownerController.processUpdateOwnerForm(req, res, next);
      const updatedOwner = await db.Owner.findByPk(owner1.id);
      expect(updatedOwner.firstName).to.equal('Updated');
      expect(updatedOwner.address).to.equal('New Address');
      expect(res.redirect.calledOnceWith(`/owners/${owner1.id}`)).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should re-render form with errors if validation fails', async () => {
      req.params.ownerId = owner1.id;
      req.mockValidationErrors = {
        firstName: { msg: 'First Name is required.' },
        telephone: { msg: 'Telephone must be a 10-digit number.' }
      };
      req.body = {
        firstName: '', // Invalid
        lastName: 'Franklin',
        address: 'Some Address',
        city: 'Some City',
        telephone: '123' // Invalid
      };
      await ownerController.processUpdateOwnerForm(req, res, next);
      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnceWith('owners/createOrUpdateOwnerForm', {
        owner: sinon.match.has('id', owner1.id), // Owner ID is preserved
        title: sinon.match(/Edit Owner:/),
        isNew: false,
        errors: req.mockValidationErrors
      })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should render error page for non-existent owner during update', async () => {
      req.params.ownerId = 999;
      req.body = { /* valid data */ };
      await ownerController.processUpdateOwnerForm(req, res, next);
      expect(res.status.calledOnceWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', { title: 'Error', message: 'Owner with ID 999 not found.' })).to.be.true;
      expect(next.notCalled).to.be.true;
    });

    it('should handle Sequelize validation errors during update', async () => {
      req.params.ownerId = owner1.id;
      req.mockValidationErrors = undefined; // No express-validator errors
      req.body = {
        firstName: 'Valid',
        lastName: 'Name',
        address: 'Valid Address',
        city: 'Valid City',
        telephone: 'invalid' // Sequelize will catch this
      };
      await ownerController.processUpdateOwnerForm(req, res, next);
      expect(res.status.calledOnceWith(400)).to.be.true;
      expect(res.render.calledOnce).to.be.true;
      const renderArgs = res.render.args[0][1];
      expect(renderArgs.errors.telephone.msg).to.equal('Telephone must be a 10-digit number.');
      expect(next.notCalled).to.be.true;
    });

    it('should call next with error if database operation fails during update', async () => {
      req.params.ownerId = owner1.id;
      req.body = {
        firstName: 'Updated',
        lastName: 'Franklin',
        address: 'New Address',
        city: 'New City',
        telephone: '1112223333'
      };
      sinon.stub(db.Owner, 'findByPk').resolves(owner1); // Ensure owner is found
      sinon.stub(owner1, 'update').throws(new Error('DB Update Error'));
      await ownerController.processUpdateOwnerForm(req, res, next);
      expect(next.calledOnce).to.be.true;
      expect(next.args[0][0].message).to.equal('DB Update Error');
    });
  });
});

