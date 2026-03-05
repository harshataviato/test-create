const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { Owner, PetType, Pet, sequelize } = require('../src/models');

describe('Pets and Visits', () => {
  let ownerId, typeId;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    const owner = await Owner.create({ firstName: 'P', lastName: 'O', address: 'A', city: 'C', telephone: '1' });
    const type = await PetType.create({ name: 'hamster' });
    ownerId = owner.id;
    typeId = type.id;
  });

  it('POST /owners/:id/pets/new should add pet to owner', async () => {
    const res = await request(app)
      .post(`/owners/${ownerId}/pets/new`)
      .send({ name: 'Pip', birthDate: '2022-01-01', typeId: typeId });

    expect(res.status).to.equal(302);
    const pets = await Pet.findAll({ where: { owner_id: ownerId } });
    expect(pets).to.have.lengthOf(1);
    expect(pets[0].name).to.equal('Pip');
  });

  it('POST /owners/:id/pets/:petId/edit should update pet details', async () => {
    const pet = await Pet.create({ name: 'Before', type_id: typeId, owner_id: ownerId });
    const res = await request(app)
      .post(`/owners/${ownerId}/pets/${pet.id}/edit`)
      .send({ name: 'After', birthDate: '2022-02-02', typeId: typeId });
    
    expect(res.status).to.equal(302);
    const updated = await Pet.findByPk(pet.id);
    expect(updated.name).to.equal('After');
  });

  it('POST /owners/:id/pets/:petId/visits/new should add visit', async () => {
    const pet = await Pet.create({ name: 'Visitee', type_id: typeId, owner_id: ownerId });
    const res = await request(app)
      .post(`/owners/${ownerId}/pets/${pet.id}/visits/new`)
      .send({ date: '2023-10-10', description: 'Nail trim' });
    
    expect(res.status).to.equal(302);
    const petWithVisits = await Pet.findByPk(pet.id, { include: ['visits'] });
    expect(petWithVisits.visits).to.have.lengthOf(1);
    expect(petWithVisits.visits[0].description).to.equal('Nail trim');
  });
});
