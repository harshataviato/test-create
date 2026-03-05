const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { Owner, sequelize } = require('../src/models');

describe('Owner Controller & Routes', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  it('GET /owners/new should show creation form', async () => {
    const res = await request(app).get('/owners/new');
    expect(res.status).to.equal(200);
  });

  it('POST /owners/new should create owner and redirect', async () => {
    const ownerData = {
      firstName: 'Jane',
      lastName: 'Smith',
      address: '456 Oak',
      city: 'London',
      telephone: '999888777'
    };
    const res = await request(app)
      .post('/owners/new')
      .send(ownerData);
    
    expect(res.status).to.equal(302); // Redirect
    const owners = await Owner.findAll({ where: { lastName: 'Smith' } });
    expect(owners.length).to.equal(1);
    expect(res.header.location).to.equal(`/owners/${owners[0].id}`);
  });

  it('GET /owners search should find owners by last name', async () => {
    await Owner.create({ firstName: 'A', lastName: 'Davis', address: 'X', city: 'Y', telephone: '1' });
    await Owner.create({ firstName: 'B', lastName: 'Davison', address: 'X', city: 'Y', telephone: '2' });

    const res = await request(app).get('/owners').query({ lastName: 'Dav' });
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('Davis');
    expect(res.text).to.contain('Davison');
  });

  it('GET /owners search should redirect to details if exactly 1 found', async () => {
    const owner = await Owner.create({ firstName: 'Single', lastName: 'Unique', address: 'X', city: 'Y', telephone: '1' });
    const res = await request(app).get('/owners').query({ lastName: 'Unique' });
    expect(res.status).to.equal(302);
    expect(res.header.location).to.equal(`/owners/${owner.id}`);
  });

  it('GET /owners search should show error if none found', async () => {
    const res = await request(app).get('/owners').query({ lastName: 'NonExistent' });
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('has not been found');
  });

  it('POST /owners/:id/edit should update owner details', async () => {
    const owner = await Owner.create({ firstName: 'Old', lastName: 'Name', address: 'X', city: 'Y', telephone: '1' });
    const res = await request(app)
      .post(`/owners/${owner.id}/edit`)
      .send({ firstName: 'New', lastName: 'Name', address: 'Updated', city: 'Y', telephone: '1' });
    
    expect(res.status).to.equal(302);
    const updated = await Owner.findByPk(owner.id);
    expect(updated.firstName).to.equal('New');
    expect(updated.address).to.equal('Updated');
  });
});
