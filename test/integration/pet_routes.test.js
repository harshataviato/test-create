const request = require('supertest');
const { expect } = require('chai');
const { startServer, baseUrl } = require('../utils/test-server');
const { cleanDb, seedReferenceData, db } = require('../utils/dbUtils');

describe('Routes: Pet', () => {
  let owner;
  let petType;

  before(async () => {
    await startServer();
    await db.sequelize.sync();
    await seedReferenceData();
    petType = await db.PetType.findOne();
  });

  beforeEach(async () => {
    await cleanDb();
    // Create a parent owner for pet tests
    owner = await db.Owner.create({ 
      firstName: 'Pet', lastName: 'Lover', 
      address: '1 Lane', city: 'City', telephone: '1234567890' 
    });
  });

  it('GET /owners/:id/pets/new should render form with pet types', async () => {
    const res = await request(baseUrl).get(`/owners/${owner.id}/pets/new`);
    expect(res.status).to.equal(200);
    expect(res.text).to.include('New Pet');
    expect(res.text).to.include(petType.name); // Check if types are loaded
  });

  it('POST /owners/:id/pets/new should create pet and redirect to owner', async () => {
    const petData = {
      name: 'Fluffy',
      birthDate: '2020-01-01',
      type_id: petType.id
    };

    const res = await request(baseUrl)
      .post(`/owners/${owner.id}/pets/new`)
      .type('form')
      .send(petData);

    expect(res.status).to.equal(302);
    expect(res.header['location']).to.include(`/owners/${owner.id}`);

    const savedPet = await db.Pet.findOne({ where: { name: 'Fluffy', owner_id: owner.id } });
    expect(savedPet).to.exist;
  });

  it('POST /owners/:id/pets/new with invalid data should re-render form', async () => {
    const res = await request(baseUrl)
      .post(`/owners/${owner.id}/pets/new`)
      .type('form')
      .send({
        name: '', // Empty name
        birthDate: '2020-01-01',
        type_id: petType.id
      });

    expect(res.status).to.equal(200);
    expect(res.text).to.include('Name is required');
  });

  it('GET /owners/:id/pets/:petId/edit should load existing pet', async () => {
    const pet = await db.Pet.create({
      name: 'OldName',
      birthDate: '2019-01-01',
      type_id: petType.id,
      owner_id: owner.id
    });

    const res = await request(baseUrl).get(`/owners/${owner.id}/pets/${pet.id}/edit`);
    expect(res.status).to.equal(200);
    expect(res.text).to.include('OldName');
  });

  it('POST /owners/:id/pets/:petId/edit should update pet', async () => {
    const pet = await db.Pet.create({
      name: 'OldName',
      birthDate: '2019-01-01',
      type_id: petType.id,
      owner_id: owner.id
    });

    const res = await request(baseUrl)
      .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
      .type('form')
      .send({
        name: 'NewName',
        birthDate: '2019-01-01',
        type_id: petType.id
      });

    expect(res.status).to.equal(302);
    const updated = await db.Pet.findByPk(pet.id);
    expect(updated.name).to.equal('NewName');
  });
  
  it('POST /owners/:id/pets/:petId/edit with invalid data', async () => {
    const pet = await db.Pet.create({
      name: 'ValidName',
      birthDate: '2019-01-01',
      type_id: petType.id,
      owner_id: owner.id
    });

    const res = await request(baseUrl)
      .post(`/owners/${owner.id}/pets/${pet.id}/edit`)
      .type('form')
      .send({
        name: '', // Invalid
        birthDate: '2019-01-01',
        type_id: petType.id
      });

    expect(res.status).to.equal(200);
    expect(res.text).to.include('Name is required');
  });
});
