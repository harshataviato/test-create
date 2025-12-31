/**
 * @module test/routes/homeRoutes
 * @description Tests for the homeRoutes.
 */

// `request` is a global supertest instance from test/setup.js
// `expect` is a global chai.expect instance from test/setup.js

describe('Home Routes', () => {
  it('GET / should render the home page with welcome title (English default)', async () => {
    const res = await request.get('/');

    expect(res.status).to.equal(200);
    expect(res.text).to.include('Welcome to PetClinic!');
    expect(res.text).to.include('<title>Welcome to PetClinic! | PetClinic</title>');
  });

  it('GET /?lang=es should render the home page with Spanish welcome title', async () => {
    const res = await request.get('/?lang=es');

    expect(res.status).to.equal(302); // Redirects to / to clear lang param
    expect(res.headers.location).to.equal('/');

    // Follow the redirect to verify content
    const resFollowed = await request.get(res.headers.location);
    expect(resFollowed.status).to.equal(200);
    expect(resFollowed.text).to.include('¡Bienvenido a la Clínica de Mascotas!');
    expect(resFollowed.text).to.include('<title>¡Bienvenido a la Clínica de Mascotas! | Clínica de Mascotas</title>');
  });

  it('GET /?lang=en should render the home page with English welcome title', async () => {
    // First set to ES to ensure we can switch back
    await request.get('/?lang=es');

    const res = await request.get('/?lang=en');
    expect(res.status).to.equal(302);
    expect(res.headers.location).to.equal('/');

    const resFollowed = await request.get(res.headers.location);
    expect(resFollowed.status).to.equal(200);
    expect(resFollowed.text).to.include('Welcome to PetClinic!');
    expect(resFollowed.text).to.include('<title>Welcome to PetClinic! | PetClinic</title>');
  });
});

