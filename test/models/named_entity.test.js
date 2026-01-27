/**
 * @fileoverview Test suite for the NamedEntity model.
 * Verifies the inheritance from BaseEntity, the `name` property, and the `toString()` method.
 */

const { expect } = require('chai');
const { NamedEntity } = require('../../models'); // Adjust path as necessary

describe('NamedEntity Model', () => {
  let MockNamedEntity;

  before(() => {
    MockNamedEntity = NamedEntity(global.sequelize, global.sequelize.Sequelize.DataTypes);
  });

  describe('Inheritance from BaseEntity', () => {
    it('should inherit the "id" property', () => {
      const entity = MockNamedEntity.build({ id: 1, name: 'Test' });
      expect(entity).to.have.property('id');
      expect(entity.id).to.equal(1);
    });

    it('should inherit the "isNew" getter', () => {
      const newEntity = MockNamedEntity.build({ name: 'New Item' });
      const existingEntity = MockNamedEntity.build({ id: 1, name: 'Existing Item' });

      expect(newEntity.isNew).to.be.true;
      expect(existingEntity.isNew).to.be.false;
    });
  });

  describe('name property', () => {
    it('should have a name property', () => {
      const entity = MockNamedEntity.build({ name: 'Test Name' });
      expect(entity).to.have.property('name');
      expect(entity.name).to.equal('Test Name');
    });

    it('should require a name', async () => {
      let error;
      try {
        await MockNamedEntity.create({}); // Attempt to create without name
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('name');
      expect(error.errors[0].type).to.equal('notEmpty');
    });

    it('should not allow an empty name', async () => {
      let error;
      try {
        await MockNamedEntity.create({ name: '' });
      } catch (e) {
        error = e;
      }
      expect(error).to.exist;
      expect(error.errors[0].path).to.equal('name');
      expect(error.errors[0].type).to.equal('notEmpty');
    });
  });

  describe('toString() method', () => {
    it('should return the name if set', () => {
      const entity = MockNamedEntity.build({ name: 'My Named Entity' });
      expect(entity.toString()).to.equal('My Named Entity');
    });

    it('should return "<null>" if name is not set', () => {
      const entity = MockNamedEntity.build({});
      expect(entity.toString()).to.equal('<null>');
    });

    it('should return "<null>" if name is null', () => {
      const entity = MockNamedEntity.build({ name: null });
      expect(entity.toString()).to.equal('<null>');
    });
  });
});
