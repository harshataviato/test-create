// test/models/person.test.js
const { expect } = require('chai');
const { Person } = require('../../test/config/testDb').models; // Using testDb for models

describe('Person Model', () => {
  let person;

  // We need to create a dummy class that extends Person to actually test it,
  // as Person itself is more of a mixin/base for other concrete models.
  class TestPerson extends Person {
    static initialize(sequelize) {
      super.init({
        firstName: {
          type: require('sequelize').DataTypes.STRING(30),
          allowNull: false,
          field: 'first_name',
        },
        lastName: {
          type: require('sequelize').DataTypes.STRING(30),
          allowNull: false,
          field: 'last_name',
        }
      }, {
        sequelize,
        modelName: 'TestPerson',
        tableName: 'test_persons',
        timestamps: false,
        underscored: true
      });
    }
  }

  before(async () => {
    await TestPerson.initialize(require('../../test/config/testDb'));
    // Ensure table is created for TestPerson
    await require('../../test/config/testDb').sync({ force: true });
  });

  beforeEach(() => {
    person = new TestPerson();
  });

  after(async () => {
    // Clean up test table
    await require('../../test/config/testDb').drop();
  });

  it('should have firstName and lastName properties with getters and setters', () => {
    person.firstName = 'John';
    person.lastName = 'Doe';
    expect(person.firstName).to.equal('John');
    expect(person.lastName).to.equal('Doe');
  });

  it('should save a person entity to the database', async () => {
    const newPerson = await TestPerson.create({ firstName: 'Jane', lastName: 'Smith' });
    expect(newPerson).to.have.property('id').that.is.a('number');
    expect(newPerson.firstName).to.equal('Jane');
    expect(newPerson.lastName).to.equal('Smith');
    const foundPerson = await TestPerson.findByPk(newPerson.id);
    expect(foundPerson.firstName).to.equal('Jane');
    expect(foundPerson.lastName).to.equal('Smith');
  });
});
