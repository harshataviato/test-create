const { namedAttributes, addNamedMethods } = require('../../models/named.model');
const { getSequelize, authenticate, sync } = require('../../config/database');
const { DataTypes } = require('sequelize');

const sequelize = getSequelize();

// Define a dummy model to test NamedEntity properties and methods
const NamedDummyModel = sequelize.define('NamedDummyModel', {
  ...namedAttributes,
  // No additional fields needed, 'name' is part of namedAttributes
}, {
  tableName: 'named_dummy_models',
  timestamps: false,
  underscored: true,
});

describe('NamedEntity Model', () => {
  beforeAll(async () => {
    await authenticate();
    await sync({ force: true });
  });

  afterAll(async () => {
    await sync({ force: true });
  });

  beforeEach(async () => {
    await NamedDummyModel.destroy({ truncate: true, restartIdentity: true });
  });

  test('should have namedAttributes properties including id and name', () => {
    expect(namedAttributes).toHaveProperty('id');
    expect(namedAttributes).toHaveProperty('name');
    expect(namedAttributes.name.type).toEqual(DataTypes.STRING(80));
    expect(namedAttributes.name.allowNull).toBe(false);
    expect(namedAttributes.name.validate.notEmpty).toBe(true);
  });

  test('should correctly apply namedAttributes to a model', async () => {
    const namedDummy = await NamedDummyModel.create({ name: 'Test Name' });
    expect(namedDummy).toHaveProperty('id');
    expect(namedDummy.id).toBeDefined();
    expect(namedDummy.name).toBe('Test Name');
  });

  test('should fail to create without a name', async () => {
    await expect(NamedDummyModel.create({})).rejects.toThrow();
    await expect(NamedDummyModel.create({ name: '' })).rejects.toThrow();
    await expect(NamedDummyModel.create({ name: null })).rejects.toThrow();
  });

  test('toString() should return the name of the entity', async () => {
    const namedDummy = NamedDummyModel.build({ name: 'My Named Item' });
    addNamedMethods(namedDummy); // Manually add methods
    expect(namedDummy.toString()).toBe('My Named Item');
  });

  test('toString() should return "<null>" if name is undefined or null', () => {
    const namedDummyUndefined = NamedDummyModel.build({});
    addNamedMethods(namedDummyUndefined);
    expect(namedDummyUndefined.toString()).toBe('<null>');

    const namedDummyNull = NamedDummyModel.build({ name: null });
    addNamedMethods(namedDummyNull);
    expect(namedDummyNull.toString()).toBe('<null>');
  });

  test('should inherit isNew() from BaseEntity', async () => {
    const namedDummy = NamedDummyModel.build({ name: 'New Item' });
    addNamedMethods(namedDummy);
    expect(namedDummy.isNew()).toBe(true);

    const savedNamedDummy = await NamedDummyModel.create({ name: 'Saved Item' });
    addNamedMethods(savedNamedDummy);
    expect(savedNamedDummy.isNew()).toBe(false);
  });
});
