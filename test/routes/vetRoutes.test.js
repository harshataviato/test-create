/**
 * @module test/routes/vetRoutes
 * @description Integration tests for vetRoutes.
 */

const db = require('../../config/database');
const cache = require('../../utils/cache');
const sinon = require('sinon');

describe('Vet Routes', () => {
  let vet1, vet2, vet3, specialty1, specialty2;

  beforeEach(async () => {
    await db.sequelize.sync({ force: true }); // Clean slate for DB
    cache.clear(); // Ensure cache is clear for each test

    specialty1 = await db.Specialty.create({ name: 'radiology' });
    specialty2 = await db.Specialty.create({ name: 'surgery' });

    vet1 = await db.Vet.create({ firstName: 'James', lastName: 'Carter' });
    vet2 = await db.Vet.create({ firstName: 'Helen', lastName: 'Leary' });
    vet3 = await db.Vet.create({ firstName: 'Linda', lastName: 'Douglas' }); // No specialties for this one

    await vet1.addSpecialty(specialty1); // James Carter - radiology
    await vet2.addSpecialty(specialty2); // Helen Leary - surgery

    // Add more vets for pagination testing (default page size 10)
    for (let i = 0; i < 15; i++) {
      await db.Vet.create({ firstName: `Test${i}`, lastName: `Zzz${String.fromCharCode(65 + i)}` });
    }
  });

  // --- GET /vets ---
  it('GET /vets should render a paginated list of vets (first page)', async () => {
    const res = await request.get('/vets');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Veterinarians');
    expect(res.text).to.include(vet1.fullName);
    expect(res.text).to.include(specialty1.name);
    expect(res.text).to.include(vet3.fullName); // Linda Douglas (no specialty)
    expect(res.text).to.include('<em>No specialties listed</em>'); // Verify no specialties message
    expect(res.text).to.include('<ul class="pagination">'); // Verify pagination exists
    expect(res.text).to.include('<a class="page-link" href="?page=2">2</a>'); // Link to next page
    expect(res.text).to.include('<li class="page-item active"><a class="page-link" href="?page=1">1</a></li>'); // Current page active
    expect(res.text).to.not.include(`Test10 ZzzK`); // Should be on second page
    expect(res.text.match(/<td>Test/g)).to.have.lengthOf(7); // Vets 'Test0'-'Test9' + 3 initial = 13 total.
                                                              // Ordered by lastName: Carter, Douglas, Leary, then Zzz*.
                                                              // ZzzA-ZzzJ are 10 vets. So James, Helen, Linda, Test0-Test7.
                                                              // Total 18 vets. First page 10.
                                                              // First 3 (Carter, Douglas, Leary) + next 7 'Zzz' vets.
  });

  it('GET /vets?page=2 should render the second page of vets', async () => {
    const res = await request.get('/vets?page=2');
    expect(res.status).to.equal(200);
    expect(res.text).to.include('Veterinarians');
    expect(res.text).to.not.include(vet1.fullName); // Should not be on second page
    expect(res.text).to.include('<li class="page-item active"><a class="page-link" href="?page=2">2</a></li>'); // Current page active
    expect(res.text).to.include('<a class="page-link" href="?page=1" aria-label="Previous">'); // Link to previous page
    expect(res.text.match(/<td>Test/g)).to.have.lengthOf(8); // Remaining 8 vets (18 total - 10 on page 1)
  });

  it('GET /vets should use cache after first request', async () => {
    // First request - populates cache
    await request.get('/vets');

    // Clear DB to ensure data comes from cache
    await db.Vet.destroy({ truncate: true, cascade: true });
    await db.Specialty.destroy({ truncate: true, cascade: true });

    const res = await request.get('/vets'); // Second request - should hit cache
    expect(res.status).to.equal(200);
    expect(res.text).to.include(vet1.fullName); // Still contains cached data
    expect(res.text).to.include(specialty1.name);
    expect(res.text.match(/<td>Test/g)).to.have.lengthOf(7);
  });

  it('Cache should clear after TTL expires', async () => {
    process.env.CACHE_TTL_SECONDS = '1'; // Ensure short TTL for this test
    cache.clear(); // Start fresh

    await request.get('/vets'); // First hit to populate cache

    // Clear DB
    await db.Vet.destroy({ truncate: true, cascade: true });
    await db.Specialty.destroy({ truncate: true, cascade: true });

    // Wait for cache to expire (TTL is 1 second, allow some buffer)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const res = await request.get('/vets'); // Second hit after TTL
    expect(res.status).to.equal(200);
    expect(res.text).to.include('No veterinarians found.'); // Should now be empty as DB is empty
  }).timeout(3000); // Increase timeout for the sleep
});

