const { expect } = require('chai');
const db = require('../../models');

describe('Model: Owner', () => {
  before(async () => {
    await db.sequelize.sync();
  });

  it('should create a valid owner', async () => {
    const owner = await db.Owner.create({
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Test St',
      city: 'TestCity',
      telephone: '1234567890'
    });
    expect(owner.id).to.exist;
    expect(owner.firstName).to.equal('John');
  });

  it('should fail validation without firstName', async () => {
    try {
      await db.Owner.create({
        lastName: 'Doe',
        address: '123 Test St',
        city: 'TestCity',
        telephone: '1234567890'
      });
      throw new Error('Should have failed');
    } catch (err) {
      expect(err.name).to.equal('SequelizeValidationError');
      expect(err.errors[0].message).to.equal('First name is required');
    }
  });

  it('should fail validation with non-numeric telephone', async () => {
    try {
      await db.Owner.create({
        firstName: 'Jane',
        lastName: 'Doe',
        address: '123 Test St',
        city: 'TestCity',
        telephone: 'NotANumber'
      });
      throw new Error('Should have failed');
    } catch (err) {
      expect(err.name).to.equal('SequelizeValidationError');
      expect(err.errors[0].message).to.equal('Telephone must be numeric');
    }
  });
  
  it('should fail validation with invalid telephone length', async () => {
    try {
      await db.Owner.create({
        firstName: 'Jane',
        lastName: 'Doe',
        address: '123 Test St',
        city: 'TestCity',
        telephone: '123'
      });
      throw new Error('Should have failed');
    } catch (err) {
      expect(err.name).to.equal('SequelizeValidationError');
      // The model defines strict length of 10
      expect(err.errors[0].message).to.include('10-digit number');
    }
  });
});
