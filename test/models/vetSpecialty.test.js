/**
 * @module test/models/vetSpecialty
 * @description Tests for the VetSpecialty (junction) model.
 */

const db = require('../../config/database');

describe('VetSpecialty Model', () => {
  let vet, specialty;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true });
    vet = await db.Vet.create({ firstName: 'Test', lastName: 'Vet' });
    specialty = await db.Specialty.create({ name: 'Test Specialty' });
  });

  it('should associate a vet with a specialty successfully', async () => {
    const vetSpecialty = await db.VetSpecialty.create({
      vetId: vet.id,
      specialtyId: specialty.id
    });

    expect(vetSpecialty).to.be.an('object');
    expect(vetSpecialty.vetId).to.equal(vet.id);
    expect(vetSpecialty.specialtyId).to.equal(specialty.id);
  });

  it('should retrieve a VetSpecialty record', async () => {
    await db.VetSpecialty.create({
      vetId: vet.id,
      specialtyId: specialty.id
    });

    const foundRecord = await db.VetSpecialty.findOne({
      where: { vetId: vet.id, specialtyId: specialty.id }
    });

    expect(foundRecord).to.be.an('object');
    expect(foundRecord.vetId).to.equal(vet.id);
    expect(foundRecord.specialtyId).to.equal(specialty.id);
  });

  it('should delete a VetSpecialty record', async () => {
    await db.VetSpecialty.create({
      vetId: vet.id,
      specialtyId: specialty.id
    });

    await db.VetSpecialty.destroy({
      where: { vetId: vet.id, specialtyId: specialty.id }
    });

    const foundRecord = await db.VetSpecialty.findOne({
      where: { vetId: vet.id, specialtyId: specialty.id }
    });
    expect(foundRecord).to.be.null;
  });

  // --- Foreign Key Constraint Tests ---

  it('should fail to create if vetId does not exist', async () => {
    try {
      await db.VetSpecialty.create({
        vetId: 9999, // Non-existent vet ID
        specialtyId: specialty.id
      });
      expect.fail('Expected SequelizeForeignKeyConstraintError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeForeignKeyConstraintError');
    }
  });

  it('should fail to create if specialtyId does not exist', async () => {
    try {
      await db.VetSpecialty.create({
        vetId: vet.id,
        specialtyId: 9999 // Non-existent specialty ID
      });
      expect.fail('Expected SequelizeForeignKeyConstraintError');
    } catch (error) {
      expect(error.name).to.equal('SequelizeForeignKeyConstraintError');
    }
  });

  it('should delete VetSpecialty record if associated Vet is deleted (CASCADE)', async () => {
    await db.VetSpecialty.create({
      vetId: vet.id,
      specialtyId: specialty.id
    });

    await vet.destroy(); // Delete the vet

    const foundRecord = await db.VetSpecialty.findOne({
      where: { vetId: vet.id, specialtyId: specialty.id }
    });
    expect(foundRecord).to.be.null;
  });

  it('should delete VetSpecialty record if associated Specialty is deleted (CASCADE)', async () => {
    await db.VetSpecialty.create({
      vetId: vet.id,
      specialtyId: specialty.id
    });

    await specialty.destroy(); // Delete the specialty

    const foundRecord = await db.VetSpecialty.findOne({
      where: { vetId: vet.id, specialtyId: specialty.id }
    });
    expect(foundRecord).to.be.null;
  });
});

