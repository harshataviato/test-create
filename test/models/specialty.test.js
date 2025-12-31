/**
 * @module test/models/specialty
 * @description Tests for the Specialty model.
 */

const db = require('../../config/database');

describe('Specialty Model', () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  it('should create a new specialty successfully', async () => {
    const specialty = await db.Specialty.create({ name: 'Radiology' });

    expect(specialty).to.be.an('object');
    expect(specialty.id).to.exist;
    expect(specialty.name).to.equal('Radiology');
  });

  it('should retrieve a specialty by ID', async () => {
    const createdSpecialty = await db.Specialty.create({ name: 'Surgery' });
    const foundSpecialty = await db.Specialty.findByPk(createdSpecialty.id);

    expect(foundSpecialty).to.be.an('object');
    expect(foundSpecialty.id).to.equal(createdSpecialty.id);
    expect(foundSpecialty.name).to.equal('Surgery');
  });

  it('should update a specialty', async () => {
    const specialty = await db.Specialty.create({ name: 'Old Specialty' });
    await specialty.update({ name: 'New Specialty' });

    const updatedSpecialty = await db.Specialty.findByPk(specialty.id);
    expect(updatedSpecialty.name).to.equal('New Specialty');
  });

  it('should delete a specialty', async () => {
    const specialty = await db.Specialty.create({ name: 'Dentistry' });
    await specialty.destroy();

    const foundSpecialty = await db.Specialty.findByPk(specialty.id);
    expect(foundSpecialty).to.be.null;
  });

  // --- Validation Tests ---

  it('should require a name', async () => {
    try {
      await db.Specialty.create({}); // Missing name
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Specialty name is required.');
    }
  });

  it('should enforce unique names for specialties', async () => {
    await db.Specialty.create({ name: 'Dermatology' });

    try {
      await db.Specialty.create({ name: 'Dermatology' }); // Duplicate name
      expect.fail('Expected SequelizeUniqueConstraintError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeUniqueConstraintError');
    }
  });

  // --- Association Tests ---
  it('should be associated with Vets through VetSpecialties', async () => {
    const vet = await db.Vet.create({ firstName: 'Vet', lastName: 'One' });
    const specialty = await db.Specialty.create({ name: 'Cardiology' });

    await vet.addSpecialty(specialty);

    const vetWithSpecialties = await db.Vet.findByPk(vet.id, {
      include: [{ model: db.Specialty, as: 'specialties' }]
    });

    expect(vetWithSpecialties.specialties).to.have.lengthOf(1);
    expect(vetWithSpecialties.specialties[0].name).to.equal('Cardiology');

    const specialtyWithVets = await db.Specialty.findByPk(specialty.id, {
      include: [{ model: db.Vet, as: 'vets' }]
    });

    expect(specialtyWithVets.vets).to.have.lengthOf(1);
    expect(specialtyWithVets.vets[0].lastName).to.equal('One');
  });
});

