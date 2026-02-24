const request = require('supertest');
const { expect } = require('chai');
const { startServer, baseUrl } = require('../utils/test-server');
const { cleanDb, seedReferenceData, db } = require('../utils/dbUtils');

describe('Routes: Visit', () => {
  let owner;
  let pet;

  before(async () => {
    await startServer();
    await db.sequelize.sync();
    await seedReferenceData();
  });

  beforeEach(async () => {
    await cleanDb();
    owner = await db.Owner.create({ 
      firstName: 'Visit', lastName: 'Owner', 
      address: '1 Lane', city: 'City', telephone: '1234567890' 
    });
    
    const type = await db.PetType.findOne();
    pet = await db.Pet.create({
      name: 'SickPet',
      birthDate: '2020-01-01',
      type_id: type.id,
      owner_id: owner.id
    });
  });

  it('GET /owners/*/pets/*/visits/new should render form', async () => {
    const res = await request(baseUrl).get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
    expect(res.status).to.equal(200);
    expect(res.text).to.include('New Visit');
    expect(res.text).to.include('SickPet');
  });

  it('POST /owners/*/pets/*/visits/new should create visit', async () => {
    const visitData = {
      date: '2023-10-10',
      description: 'Checkup'
    };

    const res = await request(baseUrl)
      .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
      .type('form')
      .send(visitData);

    expect(res.status).to.equal(302);
    expect(res.header['location']).to.include(`/owners/${owner.id}`);

    const visits = await db.Visit.findAll({ where: { pet_id: pet.id } });
    expect(visits.length).to.equal(1);
    expect(visits[0].description).to.equal('Checkup');
  });

  it('POST /owners/*/pets/*/visits/new with invalid data', async () => {
    const res = await request(baseUrl)
      .post(`/owners/${owner.id}/pets/${pet.id}/visits/new`)
      .type('form')
      .send({
        date: '2023-10-10',
        description: '' // Required
      });

    expect(res.status).to.equal(200);
    expect(res.text).to.include('Description is required');
  });
});
