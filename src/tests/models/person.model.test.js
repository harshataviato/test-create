const { personAttributes, addPersonMethods } = require('../../models/person.model');
const { getSequelize, authenticate, sync } = require('../../config/database');
const { DataTypes } = require('sequelize');

const sequelize = getSequelize();

// Define a dummy model to test PersonEntity properties and methods
const PersonDummyModel = sequelize.define('PersonDummyModel', {
  ...personAttributes,
}, {
  tableName: 'person_dummy_models',
  timestamps: false,
  underscored: true,
});

describe('Person Model', () => {
  beforeAll(async () => {
    await authenticate();
    await sync({ force: true });
  });

  afterAll(async () => {
    await sync({ force: true });
  });

  beforeEach(async () => {
    await PersonDummyModel.destroy({ truncate: true, restartIdentity: true });
  });

  test('should have personAttributes properties including id, firstName, lastName', () => {
    expect(personAttributes).toHaveProperty('id');
    expect(personAttributes).toHaveProperty('firstName');
    expect(personAttributes).toHaveProperty('lastName');
    expect(personAttributes.firstName.type).toEqual(DataTypes.STRING(30));
    expect(personAttributes.firstName.allowNull).toBe(false);
    expect(personAttributes.firstName.validate.notEmpty).toBe(true);
    expect(personAttributes.firstName.field).toBe('first_name'); // Check field mapping

    expect(personAttributes.lastName.type).toEqual(DataTypes.STRING(30));
    expect(personAttributes.lastName.allowNull).toBe(false);
    expect(personAttributes.lastName.validate.notEmpty).toBe(true);
    expect(personAttributes.lastName.field).toBe('last_name'); // Check field mapping
  });

  test('should correctly apply personAttributes to a model', async () => {
    const personDummy = await PersonDummyModel.create({
      firstName: 'John',
      lastName: 'Doe'
    });
    expect(personDummy).toHaveProperty('id');
    expect(personDummy.id).toBeDefined();
    expect(personDummy.firstName).toBe('John');
    expect(personDummy.lastName).toBe('Doe');
  });

  test('should fail to create without first name', async () => {
    await expect(PersonDummyModel.create({ lastName: 'Doe' })).rejects.toThrow();
    await expect(PersonDummyModel.create({ firstName: '', lastName: 'Doe' })).rejects.toThrow();
  });

  test('should fail to create without last name', async () => {
    await expect(PersonDummyModel.create({ firstName: 'John' })).rejects.toThrow();
    await expect(PersonDummyModel.create({ firstName: 'John', lastName: '' })).rejects.toThrow();
  });

  test('should inherit isNew() from BaseEntity', async () => {
    const personDummy = PersonDummyModel.build({ firstName: 'New', lastName: 'Person' });
    addPersonMethods(personDummy);
    expect(personDummy.isNew()).toBe(true);

    const savedPersonDummy = await PersonDummyModel.create({ firstName: 'Saved', lastName: 'Person' });
    addPersonMethods(savedPersonDummy);
    expect(savedPersonDummy.isNew()).toBe(false);
  });
});
