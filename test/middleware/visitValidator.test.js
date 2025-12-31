/**
 * @module test/middleware/visitValidator
 * @description Tests for the visitValidator middleware.
 */

const { validateVisit } = require('../../middleware/visitValidator');
const { validationResult } = require('express-validator');
const sinon = require('sinon');
const moment = require('moment');

describe('visitValidator', () => {
  let req, res, next;
  const validations = validateVisit();

  beforeEach(() => {
    req = {
      body: {},
      // Mock i18n for validation messages
      __: sinon.stub((key, params) => {
        const translations = {
          'common.visitDate': 'Visit Date',
          'common.description': 'Description',
          'validation.required': `${params.field} is required.`,
          'validation.invalidDate': `${params.field} must be a valid date.`,
          'validation.futureDate': `${params.field} cannot be in the future.`,
          'validation.minLength': `${params.field} must be at least ${params.min} characters long.`,
          'validation.maxLength': `${params.field} cannot exceed ${params.max} characters.`,
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

  it('should pass validation for valid visit data', async () => {
    req.body = {
      visitDate: '2023-01-01',
      description: 'Annual check-up'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.true;
  });

  it('should fail validation for missing visitDate', async () => {
    req.body = {
      description: 'Annual check-up'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Visit Date is required.' });
  });

  it('should fail validation for invalid visitDate format', async () => {
    req.body = {
      visitDate: 'invalid-date',
      description: 'Annual check-up'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Visit Date must be a valid date.' });
  });

  it('should fail validation for future visitDate', async () => {
    req.body = {
      visitDate: moment().add(1, 'day').format('YYYY-MM-DD'),
      description: 'Future appointment'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Visit Date cannot be in the future.' });
  });

  it('should pass validation for today as visitDate', async () => {
    req.body = {
      visitDate: moment().format('YYYY-MM-DD'),
      description: 'Today\'s visit'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.true;
  });

  it('should fail validation for missing description', async () => {
    req.body = {
      visitDate: '2023-01-01'
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Description is required.' });
  });

  it('should fail validation for too short description', async () => {
    req.body = {
      visitDate: '2023-01-01',
      description: 'ab' // Too short
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Description must be at least 3 characters long. Description cannot exceed 255 characters.' });
  });

  it('should fail validation for too long description', async () => {
    req.body = {
      visitDate: '2023-01-01',
      description: 'a'.repeat(256) // Too long
    };

    const errors = await runValidations(req);
    expect(errors.isEmpty()).to.be.false;
    expect(errors.array()).to.deep.include({ msg: 'Description must be at least 3 characters long. Description cannot exceed 255 characters.' });
  });

  it('should trim string inputs', async () => {
    req.body = {
      visitDate: '2023-01-01',
      description: '  A valid description.   '
    };

    await runValidations(req); // Run validations to apply trim
    expect(req.body.description).to.equal('A valid description.');
  });
});

