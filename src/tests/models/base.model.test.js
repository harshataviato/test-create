const { baseAttributes, addBaseMethods } = require('../../models/base.model');
const { getSequelize, authenticate, sync } = require('../../config/database');
const { DataTypes } = require('sequelize');

const sequelize = getSequelize();

// Define a dummy model to test BaseEntity properties and methods
const DummyModel = sequelize.define('DummyModel', {
  ...baseAttributes,
  testField: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'dummy_models',
  timestamps: false,
  underscored: true,
});

describe('BaseEntity Model', () => {
  beforeAll(async () => {
    // Ensure DB connection and schema is clean for this test suite
    await authenticate();
    await sync({ force: true }); // Drop and recreate DummyModel table
  });

  afterAll(async () => {
    await sync({ force: true }); // Clean up DummyModel table
  });

  beforeEach(async () => {
    // Clear the table before each test
    await DummyModel.destroy({ truncate: true, restartIdentity: true });
  });

  test('should have baseAttributes properties', () => {
    expect(baseAttributes).toHaveProperty('id');
    expect(baseAttributes.id.type).toEqual(DataTypes.INTEGER);
    expect(baseAttributes.id.autoIncrement).toBe(true);
    expect(baseAttributes.id.primaryKey).toBe(true);
  });

  test('should correctly apply baseAttributes to a model', async () => {
    const dummy = await DummyModel.create({ testField: 'some value' });
    expect(dummy).toHaveProperty('id');
    expect(dummy.id).toBeDefined();
    expect(typeof dummy.id).toBe('number');
    expect(dummy.testField).toBe('some value');
  });

  test('isNew() should return true for a new unsaved instance', () => {
    const dummy = DummyModel.build({ testField: 'new value' });
    addBaseMethods(dummy); // Manually add methods since it's not a direct Sequelize model
    expect(dummy.isNew()).toBe(true);
    expect(dummy.id).toBeUndefined(); // ID should be undefined before saving
  });

  test('isNew() should return false for a saved instance', async () => {
    const dummy = await DummyModel.create({ testField: 'saved value' });
    addBaseMethods(dummy);
    expect(dummy.isNew()).toBe(false);
    expect(dummy.id).toBeDefined();
  });

  test('isNew() should return false for a fetched instance', async () => {
    const createdDummy = await DummyModel.create({ testField: 'fetched value' });
    const fetchedDummy = await DummyModel.findByPk(createdDummy.id);
    addBaseMethods(fetchedDummy);
    expect(fetchedDummy.isNew()).toBe(false);
    expect(fetchedDummy.id).toBeDefined();
  });
});
