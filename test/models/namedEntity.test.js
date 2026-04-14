// test/models/namedEntity.test.js
const { expect } = require('chai');
const { NamedEntity } = require('../../test/config/testDb').models; // Using testDb for models

describe('NamedEntity Model', () => {
  let namedEntity;

  // We need to create a dummy class that extends NamedEntity to actually test it,
  // as NamedEntity itself is more of a mixin/base for other concrete models.
  class TestNamedEntity extends NamedEntity {
    static initialize(sequelize) {
      super.init({
        name: {
          type: require('sequelize').DataTypes.STRING(80),
          allowNull: false
        }
      }, {
        sequelize,
        modelName: 'TestNamedEntity',
        tableName: 'test_named_entities',
        timestamps: false,
        underscored: true
      });
    }
  }

  before(async () => {
    await TestNamedEntity.initialize(require('../../test/config/testDb'));
    // Ensure table is created for TestNamedEntity, if not already by migrations
    await require('../../test/config/testDb').sync({ force: true });
  });

  beforeEach(() => {
    namedEntity = new TestNamedEntity();
  });

  after(async () => {
    // Clean up test table
    await require('../../test/config/testDb').drop();
  });

  it('should have a name property getter and setter', () => {
    namedEntity.name = 'Test Name';
    expect(namedEntity.name).to.equal('Test Name');
  });

  it('should return the name from toString()', () => {
    namedEntity.name = 'Test Named Entity';
    expect(namedEntity.toString()).to.equal('Test Named Entity');
  });

  it('should return "<null>" from toString() if name is not set', () => {
    namedEntity.name = null;
    expect(namedEntity.toString()).to.equal('<null>');
  });

  it('should save a named entity to the database', async () => {
    const newEntity = await TestNamedEntity.create({ name: 'Saved Entity' });
    expect(newEntity).to.have.property('id').that.is.a('number');
    expect(newEntity.name).to.equal('Saved Entity');
    const foundEntity = await TestNamedEntity.findByPk(newEntity.id);
    expect(foundEntity.name).to.equal('Saved Entity');
  });
});
