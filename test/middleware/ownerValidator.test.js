/**
 * @module test/middleware/ownerValidator
 * @description Tests for the ownerValidator middleware.
 */

const { validateOwner } = require('../../middleware/ownerValidator');
const { validationResult } = require('express-validator');
const sinon = require('sinon');

describe('ownerValidator', () => {
  let req, res, next;
  const validations = validateOwner();

  beforeEach(() => {
    req = {
      body: {},
      // Mock i18n for validation messages
      __: sinon.stub((key, params) => {
        const translations = {
          'common.firstName': 'First Name',
          'common.lastName': 'Last Name',
          'common.address': 'Address',
          'common.city': 'City',
          'common.telephone': 'Telephone',
          'validation.required': `${params.field} is required.`,
          'validation.minLength': `${params.field} must be at least ${params.min} characters long.`,
          'validation.maxLength': `${params.field} cannot exceed ${params.max} characters.`,
          'validation.invalidPhone': `${params.field} must be a 10-digit number.`,
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

  it('should pass validation for valid owner data', async () => {
    req.body = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      telephone: '1234567890'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.true;
  });

  it('should fail validation for missing firstName', async () => {
    req.body = {
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      telephone: '1234567890'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'First Name is required.' });
  });

  it('should fail validation for too short firstName', async () => {
    req.body = {
      firstName: 'J', // Too short
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      telephone: '1234567890'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'First Name must be at least 2 characters long. First Name cannot exceed 50 characters.' });
  });

  it('should fail validation for missing lastName', async () => {
    req.body = {
      firstName: 'John',
      address: '123 Main St',
      city: 'Anytown',
      telephone: '1234567890'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Last Name is required.' });
  });

  it('should fail validation for missing address', async () => {
    req.body = {
      firstName: 'John',
      lastName: 'Doe',
      city: 'Anytown',
      telephone: '1234567890'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Address is required.' });
  });

  it('should fail validation for too short address', async () => {
    req.body = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123', // Too short
      city: 'Anytown',
      telephone: '1234567890'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Address must be at least 5 characters long. Address cannot exceed 100 characters.' });
  });

  it('should fail validation for missing city', async () => {
    req.body = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      telephone: '1234567890'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'City is required.' });
  });

  it('should fail validation for missing telephone', async () => {
    req.body = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Telephone is required.' });
  });

  it('should fail validation for invalid telephone format (not 10 digits)', async () => {
    req.body = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      telephone: '12345' // Too short
    };

    let errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Telephone must be a 10-digit number.' });

    req.body.telephone = '12345678901'; // Too long
    errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Telephone must be a 10-digit number.' });

    req.body.telephone = 'abcde12345'; // Contains non-digits
    errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Telephone must be a 10-digit number.' });
  });

  it('should trim string inputs', async () => {
    req.body = {
      firstName: '  John ',
      lastName: ' Doe ',
      address: ' 123 Main St ',
      city: ' Anytown ',
      telephone: '1234567890'
    };

    await runValidations(req); // Run validations to apply trim
    expect(req.body.firstName).to.equal('John');
    expect(req.body.lastName).to.equal('Doe');
    expect(req.body.address).to.equal('123 Main St');
    expect(req.body.city).to.equal('Anytown');
  });
});

