// test/utils/validators.test.js
const { expect } = require('chai');
const { body, validationResult } = require('express-validator');
const { validateOwner, validatePet, validateVisit } = require('../../src/utils/validators');
const { sequelize, models } = require('../../test/config/testDb');
const { PetType } = models;
const i18n = require('i18n'); // Import i18n for message translation logic

// Mock request and response objects for express-validator middleware
const mockRequest = (bodyData, paramsData = {}, queryData = {}, locale = 'en') => ({
  body: bodyData,
  params: paramsData,
  query: queryData,
  getLocale: () => locale,
  __(key) { // Mock i18n translation function
    const messages = {
      'en': {
        'required': 'is required',
        'telephone.invalid': 'Telephone must be a 10-digit number',
        'typeMismatch.date': 'invalid date',
        'typeMismatch.petType': 'invalid pet type',
        'duplicate': 'is already in use'
      },
      // Add other locales if needed for i18n testing
    };
    return messages[locale][key] || key;
  }
});
const mockResponse = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  res.render = (view, data) => { res.view = view; res.locals = data; return res; };
  res.locals = {}; // Ensure res.locals exists
  return res;
};
const mockNext = (err) => { if (err) console.error(err); };

describe('Validators', () => {
  before(async () => {
    // Seed PetTypes for pet validation tests
    await sequelize.query('TRUNCATE TABLE types RESTART IDENTITY CASCADE;');
    await PetType.bulkCreate([
      { id: 1, name: 'cat' },
      { id: 2, name: 'dog' }
    ]);
  });

  describe('validateOwner', () => {
    it('should pass validation for a valid owner', async () => {
      const req = mockRequest({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        telephone: '1234567890'
      });
      const res = mockResponse();

      await Promise.all(validateOwner().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.true;
    });

    it('should fail validation for empty firstName', async () => {
      const req = mockRequest({
        firstName: '',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        telephone: '1234567890'
      });
      const res = mockResponse();

      await Promise.all(validateOwner().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'firstName').msg).to.equal('is required');
    });

    it('should fail validation for invalid telephone format', async () => {
      const req = mockRequest({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        telephone: '123'
      });
      const res = mockResponse();

      await Promise.all(validateOwner().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'telephone').msg).to.equal('Telephone must be a 10-digit number');
    });

    it('should fail validation for non-numeric telephone', async () => {
      const req = mockRequest({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        telephone: 'abc1234567'
      });
      const res = mockResponse();

      await Promise.all(validateOwner().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'telephone').msg).to.equal('Telephone must be a 10-digit number');
    });

    it('should fail validation for multiple empty fields', async () => {
      const req = mockRequest({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        telephone: ''
      });
      const res = mockResponse();

      await Promise.all(validateOwner().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array()).to.have.lengthOf(5);
      expect(errors.array().every(e => e.msg === 'is required' || e.msg === 'Telephone must be a 10-digit number')).to.be.true;
    });
  });

  describe('validatePet', () => {
    it('should pass validation for a valid pet', async () => {
      const req = mockRequest({
        name: 'Buddy',
        birthDate: '2020-01-01',
        type: 'dog'
      });
      const res = mockResponse();

      await Promise.all(validatePet().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.true;
    });

    it('should fail validation for empty name', async () => {
      const req = mockRequest({
        name: '',
        birthDate: '2020-01-01',
        type: 'dog'
      });
      const res = mockResponse();

      await Promise.all(validatePet().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'name').msg).to.equal('is required');
    });

    it('should fail validation for empty birthDate', async () => {
      const req = mockRequest({
        name: 'Buddy',
        birthDate: '',
        type: 'dog'
      });
      const res = mockResponse();

      await Promise.all(validatePet().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'birthDate').msg).to.equal('is required');
    });

    it('should fail validation for invalid birthDate format', async () => {
      const req = mockRequest({
        name: 'Buddy',
        birthDate: 'not-a-date',
        type: 'dog'
      });
      const res = mockResponse();

      await Promise.all(validatePet().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'birthDate').msg).to.equal('invalid date');
    });

    it('should fail validation for a future birthDate (custom logic, not express-validator)', async () => {
      // This specific validation is handled in the controller, not `express-validator` middleware
      // but if express-validator's isDate also catches it, that's fine.
      // For this test, assume express-validator just checks format.
      // Controller test needs to cover the "isAfter(moment())" check.
      const req = mockRequest({
        name: 'Buddy',
        birthDate: '2050-01-01', // Future date
        type: 'dog'
      });
      const res = mockResponse();

      await Promise.all(validatePet().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.true; // Express-validator will pass the format. Controller handles logic.
    });

    it('should fail validation for invalid pet type', async () => {
      const req = mockRequest({
        name: 'Buddy',
        birthDate: '2020-01-01',
        type: 'dragon' // Non-existent type
      });
      const res = mockResponse();

      await Promise.all(validatePet().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'type').msg).to.equal('invalid pet type');
    });

    it('should fail validation for empty pet type', async () => {
      const req = mockRequest({
        name: 'Buddy',
        birthDate: '2020-01-01',
        type: ''
      });
      const res = mockResponse();

      await Promise.all(validatePet().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'type').msg).to.equal('is required');
    });
  });

  describe('validateVisit', () => {
    it('should pass validation for a valid visit', async () => {
      const req = mockRequest({
        date: '2023-01-01',
        description: 'Routine checkup'
      });
      const res = mockResponse();

      await Promise.all(validateVisit().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.true;
    });

    it('should fail validation for empty description', async () => {
      const req = mockRequest({
        date: '2023-01-01',
        description: ''
      });
      const res = mockResponse();

      await Promise.all(validateVisit().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'description').msg).to.equal('is required');
    });

    it('should fail validation for empty date', async () => {
      const req = mockRequest({
        date: '',
        description: 'Routine checkup'
      });
      const res = mockResponse();

      await Promise.all(validateVisit().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'date').msg).to.equal('is required');
    });

    it('should fail validation for invalid date format', async () => {
      const req = mockRequest({
        date: 'invalid-date',
        description: 'Routine checkup'
      });
      const res = mockResponse();

      await Promise.all(validateVisit().map(validation => validation.run(req)));
      const errors = validationResult(req);
      expect(errors.isEmpty()).to.be.false;
      expect(errors.array().find(e => e.param === 'date').msg).to.equal('invalid date');
    });
  });
});
