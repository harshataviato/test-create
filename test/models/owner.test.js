/**
 * @module test/models/owner
 * @description Tests for the Owner model.
 */

const db = require('../../config/database');
const { Sequelize, DataTypes } = require('sequelize');
const moment = require('moment');

describe('Owner Model', () => {
  beforeEach(async () => {
    // Clear and re-sync database for each test to ensure isolation
    await db.sequelize.sync({ force: true });
  });

  it('should create a new owner successfully', async () => {
    const owner = await db.Owner.create({
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Anytown',
      telephone: '1234567890'
    });

    expect(owner).to.be.an('object');
    expect(owner.id).to.exist;
    expect(owner.firstName).to.equal('John');
    expect(owner.lastName).to.equal('Doe');
    expect(owner.fullName).to.equal('John Doe'); // Test getter method
  });

  it('should retrieve an owner by ID', async () => {
    const createdOwner = await db.Owner.create({
      firstName: 'Jane',
      lastName: 'Smith',
      address: '456 Oak Ave',
      city: 'Otherville',
      telephone: '0987654321'
    });

    const foundOwner = await db.Owner.findByPk(createdOwner.id);

    expect(foundOwner).to.be.an('object');
    expect(foundOwner.id).to.equal(createdOwner.id);
    expect(foundOwner.firstName).to.equal('Jane');
  });

  it('should update an owner', async () => {
    const owner = await db.Owner.create({
      firstName: 'Test',
      lastName: 'User',
      address: 'Old Address',
      city: 'Old City',
      telephone: '1112223333'
    });

    await owner.update({ firstName: 'Updated', address: 'New Address' });

    const updatedOwner = await db.Owner.findByPk(owner.id);
    expect(updatedOwner.firstName).to.equal('Updated');
    expect(updatedOwner.address).to.equal('New Address');
    expect(updatedOwner.fullName).to.equal('Updated User');
  });

  it('should delete an owner', async () => {
    const owner = await db.Owner.create({
      firstName: 'Delete',
      lastName: 'Me',
      address: 'Delete Address',
      city: 'Delete City',
      telephone: '9998887777'
    });

    await owner.destroy();

    const foundOwner = await db.Owner.findByPk(owner.id);
    expect(foundOwner).to.be.null;
  });

  // --- Validation Tests ---

  it('should require firstName', async () => {
    try {
      await db.Owner.create({
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        telephone: '1234567890'
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('First name is required.');
    }
  });

  it('should require lastName', async () => {
    try {
      await db.Owner.create({
        firstName: 'John',
        address: '123 Main St',
        city: 'Anytown',
        telephone: '1234567890'
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Last name is required.');
    }
  });

  it('should validate telephone format (10 digits)', async () => {
    try {
      await db.Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        telephone: '123' // Invalid
      });
      expect.fail('Expected SequelizeValidationError for invalid telephone');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Telephone must be a 10-digit number.');
    }

    try {
      await db.Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        telephone: '12345678901' // Invalid
      });
      expect.fail('Expected SequelizeValidationError for invalid telephone');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Telephone must be a 10-digit number.');
    }

    try {
      await db.Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Anytown',
        telephone: 'abcdefghij' // Invalid
      });
      expect.fail('Expected SequelizeValidationError for invalid telephone');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Telephone must be a 10-digit number.');
    }
  });

  it('should allow null for address and city (if not validated by express-validator)', async () => {
    // Note: The controller uses express-validator for empty checks,
    // but the model's allowNull allows nulls. This tests the model's direct behavior.
    const owner = await db.Owner.create({
      firstName: 'Null',
      lastName: 'Fields',
      address: null,
      city: null,
      telephone: '5555555555'
    });
    expect(owner).to.exist;
    expect(owner.address).to.be.null;
    expect(owner.city).to.be.null;
  });
});

