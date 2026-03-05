const request = require('supertest');
const { expect } = require('chai');
const app = require('../app');
const { Vet, Specialty, sequelize } = require('../src/models');

describe('Vet Controller', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  it('GET /vets should list all veterinarians', async () => {
    const v1 = await Vet.create({ firstName: 'James', lastName: 'Carter' });
    const s1 = await Specialty.create({ name: 'surgery' });
    await v1.addSpecialty(s1);

    const res = await request(app).get('/vets');
    expect(res.status).to.equal(200);
    expect(res.text).to.contain('James Carter');
    expect(res.text).to.contain('surgery');
  });

  it('GET /vets.html should also work for legacy support', async () => {
    const res = await request(app).get('/vets.html');
    expect(res.status).to.equal(200);
  });
});
