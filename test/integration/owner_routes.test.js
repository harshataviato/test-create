const request = require('supertest');
const { expect } = require('chai');
const { startServer, baseUrl } = require('../utils/test-server');
const { cleanDb, db } = require('../utils/dbUtils');

describe('Routes: Owner', () => {
  before(async () => {
    await startServer();
    await db.sequelize.sync();
  });

  beforeEach(async () => {
    await cleanDb();
  });

  it('GET /owners/find should render the find form', async () => {
    const res = await request(baseUrl).get('/owners/find');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Find Owners');
  });

  it('GET /owners/new should render the creation form', async () => {
    const res = await request(baseUrl).get('/owners/new');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('First Name');
  });

  it('POST /owners/new should create an owner and redirect', async () => {
    const ownerData = {
      firstName: 'Integration',
      lastName: 'Test',
      address: '123 Loopback',
      city: 'ServerTown',
      telephone: '5551234567'
    };

    const res = await request(baseUrl)
      .post('/owners/new')
      .type('form')
      .send(ownerData);

    expect(res.status).to.equal(302); // Redirect
    expect(res.header['location']).to.match(/\/owners\/\d+/);

    // Verify DB
    const owner = await db.Owner.findOne({ where: { lastName: 'Test' } });
    expect(owner).to.exist;
    expect(owner.city).to.equal('ServerTown');
  });

  it('POST /owners/new with invalid data should re-render form with errors', async () => {
    const invalidData = {
      firstName: '', // Invalid
      lastName: 'Test',
      address: '123 Loopback',
      city: 'ServerTown',
      telephone: '5551234567'
    };

    const res = await request(baseUrl)
      .post('/owners/new')
      .type('form')
      .send(invalidData);

    expect(res.status).to.equal(200); // Renders form again
    expect(res.text).to.include('First name is required');
    expect(res.text).to.include('There was an error in creating the owner');
  });

  it('GET /owners?lastName=... should return list of owners', async () => {
    // Seed 2 owners
    await db.Owner.create({ firstName: 'A', lastName: 'Smith', address: 'X', city: 'Y', telephone: '1234567890' });
    await db.Owner.create({ firstName: 'B', lastName: 'Smith', address: 'X', city: 'Y', telephone: '1234567890' });

    const res = await request(baseUrl).get('/owners?lastName=Smith');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('A Smith');
    expect(res.text).to.include('B Smith');
  });

  it('GET /owners?lastName=... single result should redirect', async () => {
    await db.Owner.create({ firstName: 'Unique', lastName: 'One', address: 'X', city: 'Y', telephone: '1234567890' });
    
    const res = await request(baseUrl).get('/owners?lastName=One');
    expect(res.status).to.equal(302);
    expect(res.header['location']).to.include('/owners/');
  });

  it('GET /owners/:id should show owner details', async () => {
    const owner = await db.Owner.create({ firstName: 'Detail', lastName: 'View', address: 'X', city: 'Y', telephone: '1234567890' });
    
    const res = await request(baseUrl).get(`/owners/${owner.id}`);
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Detail View');
    expect(res.text).to.include('Edit Owner');
  });

  it('POST /owners/:id/edit should update owner', async () => {
    const owner = await db.Owner.create({ firstName: 'Old', lastName: 'Name', address: 'X', city: 'Y', telephone: '1234567890' });
    
    const res = await request(baseUrl)
      .post(`/owners/${owner.id}/edit`)
      .type('form')
      .send({
        firstName: 'New',
        lastName: 'Name',
        address: 'X', city: 'Y', telephone: '1234567890'
      });

    expect(res.status).to.equal(302);
    const updated = await db.Owner.findByPk(owner.id);
    expect(updated.firstName).to.equal('New');
  });

  it('POST /owners/:id/edit fail validation should render form', async () => {
    const owner = await db.Owner.create({ firstName: 'Valid', lastName: 'One', address: 'X', city: 'Y', telephone: '1234567890' });

    const res = await request(baseUrl)
      .post(`/owners/${owner.id}/edit`)
      .type('form')
      .send({
        firstName: '', // Invalid
        lastName: 'Name',
        address: 'X', city: 'Y', telephone: '1234567890'
      });

    expect(res.status).to.equal(200);
    expect(res.text).to.include('First name is required');
  });
});
