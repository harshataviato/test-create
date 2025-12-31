/**
 * @module test/routes/petRoutes
 * @description Integration tests for petRoutes.
 */

const db = require('../../config/database');
const moment = require('moment');
const petCache = require('../../utils/cache'); // PetController uses cache.clear('vets') but pet routes do not touch it.

describe('Pet Routes', () => {
  let owner, otherOwner, petTypeCat, petTypeDog, pet;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true }); // Clean slate for DB
    petCache.clear(); // Clear cache to prevent interference if tests reuse logic

    owner = await db.Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
    otherOwner = await db.Owner.create({ firstName: 'Other', lastName: 'Owner', address: '222 Other St.', city: 'Other City', telephone: '2223334444' });
    petTypeCat = await db.PetType.create({ name: 'Cat' });
    petTypeDog = await db.PetType.create({ name: 'Dog' });
    pet = await db.Pet.create({ name: 'Leo', birthDate: moment('2000-09-07').toDate(), typeId: petTypeCat.id, ownerId: owner.id });
  });

  // --- GET /owners/:ownerId/pets/new ---
  it('GET /owners/:ownerId/pets/new should render the new pet form', async () => {
    const res = await request.get(`/owners/${owner.id}/pets/new`);
    expect(res.status).to.equal(200);
    expect(res.text).to.include(`New Pet for ${owner.fullName}`);
    expect(res.text).to.include('<form action="/owners/');
    expect(res.text).to.include(`value="${owner.firstName} ${owner.lastName}" readonly`); // Owner name pre-filled
    expect(res.text).to.include('option value="">-- Select Pet Type --</option>');
    expect(res.text).to.include(`<option value="${petTypeCat.id}">Cat</option>`);
    expect(res.text).to.include(`<option value="${petTypeDog.id}">Dog</option>`);
  });

  it('GET /owners/:ownerId/pets/new should return 404 for non-existent owner', async () => {
    const res = await request.get('/owners/999/pets/new');
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Owner with ID 999 not found.');
  });

  // --- POST /owners/:ownerId/pets/new ---
  it('POST /owners/:ownerId/pets/new should create a new pet and redirect to owner details on success', async () => {
    const res = await request.post(`/owners/${owner.id}/pets/new`).send({
      name: 'Buddy',
      birthDate: '2015-03-10',
      typeId: petTypeDog.id
    });
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.equal(`/owners/${owner.id}`);

    const newPet = await db.Pet.findOne({ where: { name: 'Buddy' } });
    expect(newPet).to.exist;
    expect(newPet.ownerId).to.equal(owner.id);
  });

  it('POST /owners/:ownerId/pets/new should re-render form with validation errors', async () => {
    const res = await request.post(`/owners/${owner.id}/pets/new`).send({
      name: 'B', // Invalid (too short)
      birthDate: moment().add(1, 'day').format('YYYY-MM-DD'), // Invalid (future date)
      typeId: 999 // Invalid (non-existent type)
    });
    expect(res.status).to.equal(400);
    expect(res.text).to.include(`New Pet for ${owner.fullName}`);
    expect(res.text).to.include('Name must be at least 2 characters long.');
    expect(res.text).to.include('Birth Date cannot be in the future.');
    expect(res.text).to.include('Invalid pet type selected.');
    expect(res.text).to.include('value="B"'); // Submitted data preserved
    expect(res.text).to.include(`value="${moment().add(1, 'day').format('YYYY-MM-DD')}"`);
  });

  it('POST /owners/:ownerId/pets/new should return 404 for non-existent owner', async () => {
    const res = await request.post('/owners/999/pets/new').send({
      name: 'ValidPet', birthDate: '2020-01-01', typeId: petTypeCat.id
    });
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Owner with ID 999 not found.');
  });

  // --- GET /owners/:ownerId/pets/:petId/edit ---
  it('GET /owners/:ownerId/pets/:petId/edit should render the edit pet form', async () => {
    const res = await request.get(`/owners/${owner.id}/pets/${pet.id}/edit`);
    expect(res.status).to.equal(200);
    expect(res.text).to.include(`Edit Pet: ${pet.name}`);
    expect(res.text).to.include('<form action="/owners/');
    expect(res.text).to.include(`value="${pet.name}"`);
    expect(res.text).to.include(`value="${moment(pet.birthDate).format('YYYY-MM-DD')}"`);
    expect(res.text).to.include(`<option value="${petTypeCat.id}" selected>Cat</option>`);
  });

  it('GET /owners/:ownerId/pets/:petId/edit should return 404 for non-existent owner', async () => {
    const res = await request.get(`/owners/999/pets/${pet.id}/edit`);
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Owner with ID 999 not found.');
  });

  it('GET /owners/:ownerId/pets/:petId/edit should return 404 for non-existent pet', async () => {
    const res = await request.get(`/owners/${owner.id}/pets/999/edit`);
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Pet with ID 999 not found.');
  });

  it('GET /owners/:ownerId/pets/:petId/edit should return 404 if pet does not belong to owner', async () => {
    const otherPet = await db.Pet.create({ name: 'DiffPet', birthDate: '2010-01-01', typeId: petTypeDog.id, ownerId: otherOwner.id });
    const res = await request.get(`/owners/${owner.id}/pets/${otherPet.id}/edit`);
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include(`Pet with ID ${otherPet.id} not found.`);
  });

  // --- POST /owners/:ownerId/pets/:petId/edit ---
  it('POST /owners/:ownerId/pets/:petId/edit should update pet and redirect to owner details on success', async () => {
    const res = await request.post(`/owners/${owner.id}/pets/${pet.id}/edit`).send({
      name: 'UpdatedLeo',
      birthDate: '2001-01-01',
      typeId: petTypeDog.id
    });
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.equal(`/owners/${owner.id}`);

    const updatedPet = await db.Pet.findByPk(pet.id);
    expect(updatedPet.name).to.equal('UpdatedLeo');
    expect(moment(updatedPet.birthDate).format('YYYY-MM-DD')).to.equal('2001-01-01');
    expect(updatedPet.typeId).to.equal(petTypeDog.id);
  });

  it('POST /owners/:ownerId/pets/:petId/edit should re-render form with validation errors', async () => {
    const res = await request.post(`/owners/${owner.id}/pets/${pet.id}/edit`).send({
      name: 'L', // Invalid
      birthDate: moment().add(1, 'month').format('YYYY-MM-DD'), // Invalid
      typeId: 9999 // Invalid
    });
    expect(res.status).to.equal(400);
    expect(res.text).to.include(`Edit Pet: ${pet.name}`);
    expect(res.text).to.include('Name must be at least 2 characters long.');
    expect(res.text).to.include('Birth Date cannot be in the future.');
    expect(res.text).to.include('Invalid pet type selected.');
    expect(res.text).to.include('value="L"'); // Submitted data preserved
  });

  it('POST /owners/:ownerId/pets/:petId/edit should return 404 for non-existent owner', async () => {
    const res = await request.post(`/owners/999/pets/${pet.id}/edit`).send({
      name: 'Valid', birthDate: '2000-01-01', typeId: petTypeCat.id
    });
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Owner with ID 999 not found.');
  });

  it('POST /owners/:ownerId/pets/:petId/edit should return 404 for non-existent pet', async () => {
    const res = await request.post(`/owners/${owner.id}/pets/999/edit`).send({
      name: 'Valid', birthDate: '2000-01-01', typeId: petTypeCat.id
    });
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Pet with ID 999 not found.');
  });

  it('POST /owners/:ownerId/pets/:petId/edit should return 404 if pet does not belong to owner', async () => {
    const otherPet = await db.Pet.create({ name: 'DiffPet', birthDate: '2010-01-01', typeId: petTypeDog.id, ownerId: otherOwner.id });
    const res = await request.post(`/owners/${owner.id}/pets/${otherPet.id}/edit`).send({
      name: 'Valid', birthDate: '2010-01-01', typeId: petTypeDog.id
    });
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include(`Pet with ID ${otherPet.id} not found.`);
  });
});

