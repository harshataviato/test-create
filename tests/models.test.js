const { expect } = require('chai');
const { Owner, PetType, Pet, sequelize } = require('../models');

describe('Model Validations', () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  describe('Owner Model', () => {
    it('should create a valid owner', async () => {
      const owner = await Owner.create({
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Street',
        city: 'New York',
        telephone: '1234567890'
      });
      expect(owner.id).to.not.be.null;
    });

    it('should fail if telephone is not 10 digits', async () => {
      try {
        await Owner.create({
          firstName: 'Bad',
          lastName: 'Phone',
          address: '123 Street',
          city: 'New York',
          telephone: '123'
        });
        throw new Error('Should have failed');
      } catch (err) {
        expect(err.name).to.equal('SequelizeValidationError');
      }
    });

    it('should fail if telephone is non-numeric', async () => {
      try {
        await Owner.create({
          firstName: 'Bad',
          lastName: 'Phone',
          address: '123 Street',
          city: 'New York',
          telephone: 'abcdefghij'
        });
        throw new Error('Should have failed');
      } catch (err) {
        expect(err.name).to.equal('SequelizeValidationError');
      }
    });
  });

  describe('Pet & PetType Models', () => {
    it('should associate a pet with a type', async () => {
      const type = await PetType.create({ name: 'bird' });
      const owner = await Owner.create({
        firstName: 'Jane',
        lastName: 'Smith',
        address: '456 Lane',
        city: 'LA',
        telephone: '0987654321'
      });
      
      const pet = await Pet.create({
        name: 'Tweety',
        birthDate: '2020-01-01',
        typeId: type.id,
        ownerId: owner.id
      });

      expect(pet.name).to.equal('Tweety');
      expect(pet.typeId).to.equal(type.id);
    });
  });
});
