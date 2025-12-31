/**
 * @module test/routes/ownerRoutes
 * @description Integration tests for ownerRoutes.
 */

const db = require('../../config/database');
const moment = require('moment');

describe('Owner Routes', () => {
  let owner1, owner2, owner3, petTypeCat, pet1, pet2, visit1;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true }); // Clean slate for DB
    // Re-seed minimal data for these tests
    owner1 = await db.Owner.create({ firstName: 'George', lastName: 'Franklin', address: '110 W. Liberty St.', city: 'Madison', telephone: '6085551023' });
    owner2 = await db.Owner.create({ firstName: 'Betty', lastName: 'Davis', address: '638 Cardinal Ave.', city: 'Sun Prairie', telephone: '6085551749' });
    owner3 = await db.Owner.create({ firstName: 'Eduardo', lastName: 'Rodriquez', address: '2693 Commerce St.', city: 'McFarland', telephone: '6085558763' });

    petTypeCat = await db.PetType.create({ name: 'Cat' });
    pet1 = await db.Pet.create({ name: 'Leo', birthDate: moment('2000-09-07').toDate(), typeId: petTypeCat.id, ownerId: owner1.id });
    pet2 = await db.Pet.create({ name: 'Max', birthDate: moment('2018-01-15').toDate(), typeId: petTypeCat.id, ownerId: owner1.id });

    visit1 = await db.Visit.create({ petId: pet1.id, visitDate: moment('2010-01-01').toDate(), description: 'neutered' });
  });

  // --- GET /owners/find ---
  it('GET /owners/find should render the find owners form', async () => {
    const res = await request.get('/owners/find');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Find Owners');
    expect(res.text).to.include('<form action="/owners" method="get"');
  });

  // --- GET /owners (processFindOwnerForm) ---
  it('GET /owners with lastName should redirect to details if one owner found', async () => {
    const res = await request.get('/owners').query({ lastName: 'Franklin' });
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.equal(`/owners/${owner1.id}`);
  });

  it('GET /owners with lastName should render list if multiple owners found', async () => {
    const res = await request.get('/owners').query({ lastName: 'a' }); // Matches Franklin, Davis, Rodriquez
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Owners');
    expect(res.text).to.include(owner1.firstName);
    expect(res.text).to.include(owner2.firstName);
    expect(res.text).to.include(owner3.firstName);
    expect(res.text).to.not.include('No owners found');
  });

  it('GET /owners with no lastName should render list of all owners', async () => {
    const res = await request.get('/owners');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Owners');
    expect(res.text).to.include(owner1.firstName);
    expect(res.text).to.include(owner2.firstName);
    expect(res.text).to.include(owner3.firstName);
    expect(res.text).to.not.include('No owners found');
  });

  it('GET /owners with lastName should re-render find form with error if no owners found', async () => {
    const res = await request.get('/owners').query({ lastName: 'NonExistent' });
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Find Owners');
    expect(res.text).to.include('No owners found'); // Error message
    expect(res.text).to.include('name="lastName" value="NonExistent"'); // Input preserved
  });

  // --- GET /owners/new ---
  it('GET /owners/new should render the new owner form', async () => {
    const res = await request.get('/owners/new');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('New Owner');
    expect(res.text).to.include('<form action="/owners/new" method="post"');
  });

  // --- POST /owners/new ---
  it('POST /owners/new should create a new owner and redirect to details on success', async () => {
    const res = await request.post('/owners/new').send({
      firstName: 'New',
      lastName: 'Person',
      address: '100 New Road',
      city: 'New City',
      telephone: '1000000000'
    });
    expect(res.status).to.equal(302);
    const newOwner = await db.Owner.findOne({ where: { lastName: 'Person' } });
    expect(res.headers.location).to.equal(`/owners/${newOwner.id}`);

    const detailsRes = await request.get(res.headers.location);
    expect(detailsRes.status).to.equal(200);
    expect(detailsRes.text).to.include('New Person');
  });

  it('POST /owners/new should re-render form with validation errors', async () => {
    const res = await request.post('/owners/new').send({
      firstName: '', // Invalid
      lastName: 'Invalid',
      address: 'Short', // Invalid
      city: '', // Invalid
      telephone: '123' // Invalid
    });
    expect(res.status).to.equal(400);
    expect(res.text).to.include('New Owner');
    expect(res.text).to.include('First Name is required.');
    expect(res.text).to.include('Address must be at least 5 characters long');
    expect(res.text).to.include('City is required.');
    expect(res.text).to.include('Telephone must be a 10-digit number.');
    expect(res.text).to.include('value="Invalid"'); // Submitted data is preserved
  });

  // --- GET /owners/:ownerId ---
  it('GET /owners/:ownerId should render owner details with pets and visits', async () => {
    const res = await request.get(`/owners/${owner1.id}`);
    expect(res.status).to.equal(200);
    expect(res.text).to.include(`Owner Information: ${owner1.fullName}`);
    expect(res.text).to.include(owner1.firstName);
    expect(res.text).to.include(owner1.lastName);
    expect(res.text).to.include(pet1.name); // Pet name
    expect(res.text).to.include(pet2.name); // Second pet name
    expect(res.text).to.include(moment(pet1.birthDate).format('YYYY/MM/DD'));
    expect(res.text).to.include(petTypeCat.name);
    expect(res.text).to.include(moment(visit1.visitDate).format('YYYY/MM/DD'));
    expect(res.text).to.include(visit1.description);
  });

  it('GET /owners/:ownerId should return 404 for non-existent owner', async () => {
    const res = await request.get('/owners/99999');
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Owner with ID 99999 not found.');
  });

  // --- GET /owners/:ownerId/edit ---
  it('GET /owners/:ownerId/edit should render the edit owner form', async () => {
    const res = await request.get(`/owners/${owner1.id}/edit`);
    expect(res.status).to.equal(200);
    expect(res.text).to.include(`Edit Owner: ${owner1.fullName}`);
    expect(res.text).to.include('<form action="/owners/');
    expect(res.text).to.include(`value="${owner1.firstName}"`);
    expect(res.text).to.include(`value="${owner1.telephone}"`);
  });

  it('GET /owners/:ownerId/edit should return 404 for non-existent owner', async () => {
    const res = await request.get('/owners/99999/edit');
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Owner with ID 99999 not found.');
  });

  // --- POST /owners/:ownerId/edit ---
  it('POST /owners/:ownerId/edit should update owner and redirect to details on success', async () => {
    const res = await request.post(`/owners/${owner1.id}/edit`).send({
      firstName: 'Updated',
      lastName: 'Franklin', // Must provide all required fields
      address: 'New Updated Address',
      city: 'Updated City',
      telephone: '9876543210'
    });
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.equal(`/owners/${owner1.id}`);

    const updatedOwner = await db.Owner.findByPk(owner1.id);
    expect(updatedOwner.firstName).to.equal('Updated');
    expect(updatedOwner.address).to.equal('New Updated Address');
  });

  it('POST /owners/:ownerId/edit should re-render form with validation errors', async () => {
    const res = await request.post(`/owners/${owner1.id}/edit`).send({
      firstName: 'G', // Invalid
      lastName: 'Franklin',
      address: '1', // Invalid
      city: 'M', // Invalid
      telephone: '123' // Invalid
    });
    expect(res.status).to.equal(400);
    expect(res.text).to.include(`Edit Owner: ${owner1.firstName} ${owner1.lastName}`); // Original owner name in title
    expect(res.text).to.include('First Name must be at least 2 characters long');
    expect(res.text).to.include('Address must be at least 5 characters long');
    expect(res.text).to.include('City must be at least 2 characters long');
    expect(res.text).to.include('Telephone must be a 10-digit number.');
    expect(res.text).to.include('value="G"'); // Submitted data is preserved
  });

  it('POST /owners/:ownerId/edit should return 404 for non-existent owner', async () => {
    const res = await request.post('/owners/99999/edit').send({
      firstName: 'Valid', lastName: 'Name', address: 'Valid Address', city: 'Valid City', telephone: '1111111111'
    });
    expect(res.status).to.equal(404);
    expect(res.text).to.include('Error 404');
    expect(res.text).to.include('Owner with ID 99999 not found.');
  });
});

