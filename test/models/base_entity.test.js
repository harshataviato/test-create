/**
 * @fileoverview Test suite for the BaseEntity model.
 * Verifies the core functionality of the BaseEntity, particularly the `isNew()` method.
 */

const { expect } = require('chai');
const { BaseEntity } = require('../../models'); // Adjust path as necessary

describe('BaseEntity Model', () => {
  let MockBaseEntity;

  // Initialize a mock BaseEntity model before all tests
  before(() => {
    // Create a concrete instance of the BaseEntity model for testing its methods.
    // In a real scenario, other models inherit from it, but for testing BaseEntity itself,
    // we instantiate it directly, possibly with a mock table.
    // For this test, we'll mock the `init` and `sequelize` aspects to focus on `isNew` getter.
    MockBaseEntity = BaseEntity(global.sequelize, global.sequelize.Sequelize.DataTypes);
  });

  describe('isNew() method', () => {
    it('should return true if id is null', () => {
      const entity = MockBaseEntity.build({ id: null });
      expect(entity.isNew).to.be.true;
    });

    it('should return true if id is undefined', () => {
      const entity = MockBaseEntity.build({}); // No ID explicitly set means undefined
      expect(entity.isNew).to.be.true;
    });

    it('should return false if id is a number', () => {
      const entity = MockBaseEntity.build({ id: 1 });
      expect(entity.isNew).to.be.false;
    });

    it('should return false if id is 0 (though typically IDs are positive integers)', () => {
      const entity = MockBaseEntity.build({ id: 0 });
      expect(entity.isNew).to.be.false;
    });
  });
});
