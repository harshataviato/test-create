/**
 * @module test/middleware/petValidator
 * @description Tests for the petValidator middleware.
 */

const { validatePet } = require('../../middleware/petValidator');
const { validationResult } = require('express-validator');
const sinon = require('sinon');
const moment = require('moment');
const db = require('../../config/database');

describe('petValidator', () => {
  let req, res, next;
  let petTypeDog, petTypeCat;
  const validations = validatePet();

  before(async () => {
    await db.sequelize.sync({ force: true });
    petTypeDog = await db.PetType.create({ name: 'Dog' });
    petTypeCat = await db.PetType.create({ name: 'Cat' });
  });

  beforeEach(() => {
    req = {
      body: {},
      // Mock i18n for validation messages
      __: sinon.stub((key, params) => {
        const translations = {
          'common.name': 'Name',
          'common.birthDate': 'Birth Date',
          'common.type': 'Type',
          'validation.required': `${params.field} is required.`,
          'validation.minLength': `${params.field} must be at least ${params.min} characters long.`,
          'validation.maxLength': `${params.field} cannot exceed ${params.max} characters.`,
          'validation.invalidDate': `${params.field} must be a valid date.`,
          'validation.futureDate': `${params.field} cannot be in the future.`,
          'validation.invalidPetType': 'Invalid pet type selected.',
        };
        return translations[key] || key;
      })
    };
    res = {};
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  const runValidations = async (request) => {
    for (let validation of validations) {
      await validation.run(request);
    }
    return validationResult(request);
  };

  it('should pass validation for valid pet data', async () => {
    req.body = {
      name: 'Buddy',
      birthDate: '2020-01-01',
      typeId: petTypeDog.id
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.true;
  });

  it('should fail validation for missing name', async () => {
    req.body = {
      birthDate: '2020-01-01',
      typeId: petTypeDog.id
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Name is required.' });
  });

  it('should fail validation for too short name', async () => {
    req.body = {
      name: 'B', // Too short
      birthDate: '2020-01-01',
      typeId: petTypeDog.id
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Name must be at least 2 characters long. Name cannot exceed 50 characters.' });
  });

  it('should fail validation for missing birthDate', async () => {
    req.body = {
      name: 'Buddy',
      typeId: petTypeDog.id
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Birth Date is required.' });
  });

  it('should fail validation for invalid birthDate format', async () => {
    req.body = {
      name: 'Buddy',
      birthDate: 'invalid-date',
      typeId: petTypeDog.id
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Birth Date must be a valid date.' });
  });

  it('should fail validation for future birthDate', async () => {
    req.body = {
      name: 'Buddy',
      birthDate: moment().add(1, 'day').format('YYYY-MM-DD'),
      typeId: petTypeDog.id
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Birth Date cannot be in the future.' });
  });

  it('should pass validation for today as birthDate', async () => {
    req.body = {
      name: 'Buddy',
      birthDate: moment().format('YYYY-MM-DD'),
      typeId: petTypeDog.id
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.true;
  });

  it('should fail validation for missing typeId', async () => {
    req.body = {
      name: 'Buddy',
      birthDate: '2020-01-01'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Type is required.' });
  });

  it('should fail validation for non-integer typeId', async () => {
    req.body = {
      name: 'Buddy',
      birthDate: '2020-01-01',
      typeId: 'not-an-id'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Invalid pet type selected.' });
  });

  it('should fail validation for non-existent typeId', async () => {
    req.body = {
      name: 'Buddy',
      birthDate: '2020-01-01',
      typeId: 99999 // Non-existent ID
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Invalid pet type selected.' });
  });

  it('should trim string inputs', async () => {
    req.body = {
      name: '  Buddy  ',
      birthDate: '2020-01-01',
      typeId: petTypeDog.id
    };

    await runValidations(req); // Run validations to apply trim
    expect(req.body.name).to.equal('Buddy');
  });
});

