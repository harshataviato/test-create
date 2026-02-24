const request = require('supertest');
const { expect } = require('chai');
const { startServer, baseUrl } = require('../utils/test-server');
const { db } = require('../utils/dbUtils');

describe('Routes: Vet', () => {
  before(async () => {
    await startServer();
    await db.sequelize.sync();
    
    // Ensure at least one vet exists
    const count = await db.Vet.count();
    if (count === 0) {
      await db.Vet.create({ firstName: 'Dr', lastName: 'House' });
    }
  });

  it('GET /vets.html should render HTML list', async () => {
    const res = await request(baseUrl).get('/vets.html');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Veterinarians');
    expect(res.text).to.include('<table');
  });

  it('GET /vets should return JSON list', async () => {
    const res = await request(baseUrl).get('/vets');
    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('json');
    expect(res.body.vetList).to.be.an('array');
    expect(res.body.vetList.length).to.be.greaterThan(0);
  });
});
