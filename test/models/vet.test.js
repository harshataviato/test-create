/**
 * @module test/models/vet
 * @description Tests for the Vet model.
 */

const db = require('../../config/database');

describe('Vet Model', () => {
  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
  });

  it('should create a new vet successfully', async () => {
    const vet = await db.Vet.create({
      firstName: 'James',
      lastName: 'Carter'
    });

    expect(vet).to.be.an('object');
    expect(vet.id).to.exist;
    expect(vet.firstName).to.equal('James');
    expect(vet.lastName).to.equal('Carter');
    expect(vet.fullName).to.equal('James Carter'); // Test getter method
  });

  it('should retrieve a vet by ID', async () => {
    const createdVet = await db.Vet.create({
      firstName: 'Helen',
      lastName: 'Leary'
    });

    const foundVet = await db.Vet.findByPk(createdVet.id);

    expect(foundVet).to.be.an('object');
    expect(foundVet.id).to.equal(createdVet.id);
    expect(foundVet.lastName).to.equal('Leary');
  });

  it('should update a vet', async () => {
    const vet = await db.Vet.create({
      firstName: 'Test',
      lastName: 'Vet'
    });

    await vet.update({ firstName: 'Dr. Test' });

    const updatedVet = await db.Vet.findByPk(vet.id);
    expect(updatedVet.firstName).to.equal('Dr. Test');
    expect(updatedVet.fullName).to.equal('Dr. Test Vet');
  });

  it('should delete a vet', async () => {
    const vet = await db.Vet.create({
      firstName: 'Delete',
      lastName: 'Vet'
    });

    await vet.destroy();

    const foundVet = await db.Vet.findByPk(vet.id);
    expect(foundVet).to.be.null;
  });

  // --- Validation Tests ---

  it('should require firstName', async () => {
    try {
      await db.Vet.create({
        lastName: 'Doe'
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('First name is required.');
    }
  });

  it('should require lastName', async () => {
    try {
      await db.Vet.create({
        firstName: 'John'
      });
      expect.fail('Expected SequelizeValidationError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].message).to.equal('Last name is required.');
    }
  });

  // --- Association Tests ---
  it('should have many specialties', async () => {
    const vet = await db.Vet.create({ firstName: 'Specialized', lastName: 'Vet' });
    const radiology = await db.Specialty.create({ name: 'Radiology' });
    const surgery = await db.Specialty.create({ name: 'Surgery' });

    await vet.addSpecialty(radiology);
    await vet.addSpecialty(surgery);

    const vetWithSpecialties = await db.Vet.findByPk(vet.id, {
      include: [{ model: db.Specialty, as: 'specialties' }]
    });

    expect(vetWithSpecialties.specialties).to.have.lengthOf(2);
    expect(vetWithSpecialties.specialties.map(s => s.name)).to.include.members(['Radiology', 'Surgery']);
  });

  it('should delete associated VetSpecialties on vet deletion (CASCADE)', async () => {
    const vet = await db.Vet.create({ firstName: 'Cascade', lastName: 'Delete' });
    const specialty = await db.Specialty.create({ name: 'Testing' });
    await vet.addSpecialty(specialty);

    const vetSpecialtyRecord = await db.VetSpecialty.findOne({
      where: { vetId: vet.id, specialtyId: specialty.id }
    });
    expect(vetSpecialtyRecord).to.exist;

    await vet.destroy();

    const deletedVetSpecialtyRecord = await db.VetSpecialty.findOne({
      where: { vetId: vet.id, specialtyId: specialty.id }
    });
    expect(deletedVetSpecialtyRecord).to.be.null;
  });
});

