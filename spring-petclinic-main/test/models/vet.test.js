/**
 * @file test/models/vet.test.js
 * @description Automated tests for the Vet model.
 */

process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const { Vet, Specialty, sequelize } = require('../../models');
const { resetAndSeedDatabase } = require('../helpers');

describe('Vet Model', () => {
  before(async () => {
    await resetAndSeedDatabase();
  });

  it('should create a new vet with valid data', async () => {
    const vet = await Vet.create({
      firstName: 'Test',
      lastName: 'Vet'
    });
    expect(vet).to.exist;
    expect(vet.firstName).to.equal('Test');
    expect(vet.lastName).to.equal('Vet');
    expect(vet.id).to.be.a('number');
  });

  it('should not create a vet with a missing first name', async () => {
    let error;
    try {
      await Vet.create({
        lastName: 'Vet'
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('First name cannot be empty.');
  });

  it('should not create a vet with a missing last name', async () => {
    let error;
    try {
      await Vet.create({
        firstName: 'Test'
      });
    } catch (e) {
      error = e;
    }
    expect(error).to.exist;
    expect(error.name).to.equal('SequelizeValidationError');
    expect(error.errors[0].message).to.equal('Last name cannot be empty.');
  });

  it('should find a vet by ID and include their specialties', async () => {
    const vet = await Vet.findByPk(2, { include: [{ model: Specialty, as: 'specialties' }] }); // Helen Leary, has radiology
    expect(vet).to.exist;
    expect(vet.firstName).to.equal('Helen');
    expect(vet.specialties).to.exist;
    expect(vet.specialties).to.have.lengthOf(1);
    expect(vet.specialties[0].name).to.equal('radiology');
  });

  it('should update an existing vet', async () => {
    const vet = await Vet.create({ firstName: 'Old', lastName: 'Name' });
    await vet.update({ firstName: 'New', lastName: 'Name' });
    const updatedVet = await Vet.findByPk(vet.id);
    expect(updatedVet.firstName).to.equal('New');
  });

  it('should delete a vet', async () => {
    const vet = await Vet.create({ firstName: 'Delete', lastName: 'Me' });
    await Vet.destroy({ where: { id: vet.id } });
    const deletedVet = await Vet.findByPk(vet.id);
    expect(deletedVet).to.be.null;
  });

  it('should correctly identify a new vet as new', () => {
    const newVet = Vet.build();
    expect(newVet.isNew()).to.be.true;
  });

  it('should correctly identify an existing vet as not new', async () => {
    const existingVet = await Vet.findByPk(1);
    expect(existingVet.isNew()).to.be.false;
  });

  it('should return the correct number of specialties', async () => {
    const vetWithSpecialties = await Vet.findByPk(3, { include: [{ model: Specialty, as: 'specialties' }] }); // Linda Douglas, has surgery, dentistry
    expect(vetWithSpecialties.getNrOfSpecialties()).to.equal(2);

    const vetWithoutSpecialties = await Vet.findByPk(1, { include: [{ model: Specialty, as: 'specialties' }] }); // James Carter, no specialties
    expect(vetWithoutSpecialties.getNrOfSpecialties()).to.equal(0);
  });

  it('should add a specialty to a vet', async () => {
    const vet = await Vet.findByPk(1, { include: [{ model: Specialty, as: 'specialties' }] }); // James Carter, no specialties
    const newSpecialty = await Specialty.create({ name: 'acupuncture' });

    // Manually add to the in-memory array for the `addSpecialty` method test,
    // then test the association persist through a separate method or re-fetch.
    vet.addSpecialty(newSpecialty);
    expect(vet.getNrOfSpecialties()).to.equal(1);

    // To persist the association, we need to use the Sequelize-provided method `addSpecialty`
    // which implicitly creates the join table entry.
    await vet.addSpecialty(newSpecialty); // This adds to DB
    const updatedVet = await Vet.findByPk(1, { include: [{ model: Specialty, as: 'specialties' }] });
    expect(updatedVet.specialties).to.have.lengthOf(1);
    expect(updatedVet.specialties[0].name).to.equal('acupuncture');
  });
});

