/**
 * @fileoverview Test suite for the Person model.
 * Verifies the inheritance from BaseEntity and the `firstName` and `lastName` properties and validations.
 */

const { expect } = require('chai');
const { Person } = require('../../models'); // Adjust path as necessary

describe('Person Model', () => {
  let MockPerson;

  before(() => {
    MockPerson = Person(global.sequelize, global.sequelize.Sequelize.DataTypes);
  });

  describe('Inheritance from BaseEntity', () => {
    it('should inherit the "id" property', () => {
      const person = MockPerson.build({ id: 1, firstName: 'Test', lastName: 'Person' });
      expect(person).to.have.property('id');
      expect(person.id).to.equal(1);
    });

    it('should inherit the "isNew" getter', () => {
      const newPerson = MockPerson.build({ firstName: 'New', lastName: 'Person' });
      const existingPerson = MockPerson.build({ id: 1, firstName: 'Existing', lastName: 'Person' });

      expect(newPerson.isNew).to.be.true;
      expect(existingPerson.isNew).to.be.false;
    });
  });

  describe('firstName property', () => {
    it('should have a firstName property', () => {
      const person = MockPerson.build({ firstName: 'John', lastName: 'Doe' });
      expect(person).to.have.property('firstName');
      expect(person.firstName).to.equal('John');
    });

    it('should require a firstName', async () => {
      let error;
      try {
        await MockPerson.create({ lastName: 'Doe' });
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('firstName');
      expect(error.errors[0].type).to.equal('notEmpty');
    });

    it('should not allow an empty firstName', async () => {
      let error;
      try {
        await MockPerson.create({ firstName: '', lastName: 'Doe' });
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('firstName');
      expect(error.errors[0].type).to.equal('notEmpty');
    });
  });

  describe('lastName property', () => {
    it('should have a lastName property', () => {
      const person = MockPerson.build({ firstName: 'John', lastName: 'Doe' });
      expect(person).to.have.property('lastName');
      expect(person.lastName).to.equal('Doe');
    });

    it('should require a lastName', async () => {
      let error;
      try {
        await MockPerson.create({ firstName: 'John' });
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('lastName');
      expect(error.errors[0].type).to.equal('notEmpty');
    });

    it('should not allow an empty lastName', async () => {
      let error;
      try {
        await MockPerson.create({ firstName: 'John', lastName: '' });
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('lastName');
      expect(error.errors[0].type).to.equal('notEmpty');
    });
  });
});
