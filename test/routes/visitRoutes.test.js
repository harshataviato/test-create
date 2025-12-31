/**
 * @module test/routes/visitRoutes
 * @description Integration tests for visitRoutes.
 */

const db = require('../../config/database');
const moment = require('moment');

describe('Visit Routes', () => {
  let owner, otherOwner, petTypeCat, pet;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true }); // Clean slate for DB

    owner = await db.Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
    otherOwner = await db.Owner.create({ firstName: 'Other', lastName: 'Owner', address: '222 Other St.', city: 'Other City', telephone: '2223334444' });
    petTypeCat = await db.PetType.create({ name: 'Cat' });
    pet = await db.Pet.create({ name: 'Leo', birthDate: moment('2000-09-07').toDate(), typeId: petTypeCat.id, ownerId: owner.id });
  });

  // --- GET /owners/:ownerId/pets/:petId/visits/new ---
  it('GET /owners/:ownerId/pets/:petId/visits/new should render the new visit form', async () => {
    const res = await request.get(`/owners/${owner.id}/pets/${pet.id}/visits/new`);
    expect(res.status).to.equal(200);
    expect(res.text).to.include(`New Visit for ${pet.name}`);
    expect(res.text).to.include('<form action="/owners/');
    expect(res.text).to.include(`value="${pet.name}" readonly`); // Pet name pre-filled
    expect(res.text).to.include('name="description"');
  });

  it('GET /owners/:ownerId/pets/:petId/visits/new should return 404 for non-existent owner', async () => {
    const res = await request.get(`/owners/999/pets/${pet.id}/visits/new`);
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Owner with ID 999 not found.');
  });

  it('GET /owners/:ownerId/pets/:petId/visits/new should return 404 for non-existent pet', async () => {
    const res = await request.get(`/owners/${owner.id}/pets/999/visits/new`);
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Pet with ID 999 not found.');
  });

  it('GET /owners/:ownerId/pets/:petId/visits/new should return 404 if pet does not belong to owner', async () => {
    const otherPet = await db.Pet.create({ name: 'DiffPet', birthDate: '2010-01-01', typeId: petTypeCat.id, ownerId: otherOwner.id });
    const res = await request.get(`/owners/${owner.id}/pets/${otherPet.id}/visits/new`);
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include(`Pet with ID ${otherPet.id} not found.`);
  });

  // --- POST /owners/:ownerId/pets/:petId/visits/new ---
  it('POST /owners/:ownerId/pets/:petId/visits/new should create a new visit and redirect to owner details on success', async () => {
    const res = await request.post(`/owners/${owner.id}/pets/${pet.id}/visits/new`).send({
      visitDate: '2023-01-15',
      description: 'Annual check-up'
    });
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.equal(`/owners/${owner.id}`);

    const newVisit = await db.Visit.findOne({ where: { description: 'Annual check-up' } });
    expect(newVisit).to.exist;
    expect(newVisit.petId).to.equal(pet.id);
  });

  it('POST /owners/:ownerId/pets/:petId/visits/new should re-render form with validation errors', async () => {
    const res = await request.post(`/owners/${owner.id}/pets/${pet.id}/visits/new`).send({
      visitDate: moment().add(1, 'week').format('YYYY-MM-DD'), // Invalid (future date)
      description: 'ab' // Invalid (too short)
    });
    expect(res.status).to.equal(400);
    expect(res.text).to.include(`New Visit for ${pet.name}`);
    expect(res.text).to.include('Visit Date cannot be in the future.');
    expect(res.text).to.include('Description must be between 3 and 255 characters.');
    expect(res.text).to.include(`value="${moment().add(1, 'week').format('YYYY-MM-DD')}"`); // Submitted data preserved
    expect(res.text).to.include('textarea name="description">ab</textarea>');
  });

  it('POST /owners/:ownerId/pets/:petId/visits/new should return 404 for non-existent owner', async () => {
    const res = await request.post(`/owners/999/pets/${pet.id}/visits/new`).send({
      visitDate: '2023-01-01', description: 'Valid Description'
    });
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Owner with ID 999 not found.');
  });

  it('POST /owners/:ownerId/pets/:petId/visits/new should return 404 for non-existent pet', async () => {
    const res = await request.post(`/owners/${owner.id}/pets/999/visits/new`).send({
      visitDate: '2023-01-01', description: 'Valid Description'
    });
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Pet with ID 999 not found.');
  });

  it('POST /owners/:ownerId/pets/:petId/visits/new should return 404 if pet does not belong to owner', async () => {
    const otherPet = await db.Pet.create({ name: 'DiffPet', birthDate: '2010-01-01', typeId: petTypeCat.id, ownerId: otherOwner.id });
    const res = await request.post(`/owners/${owner.id}/pets/${otherPet.id}/visits/new`).send({
      visitDate: '2023-01-01', description: 'Valid Description'
    });
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include(`Pet with ID ${otherPet.id} not found.`);
  });
});

