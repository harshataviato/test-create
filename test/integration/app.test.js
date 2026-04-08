const request = require('supertest');
const { expect } = require('chai');
const cheerio = require('cheerio');
const app = require('../../app'); // The Express app instance
const db = require('../../config/db'); // The in-memory database

describe('Product Management Application Integration Tests', () => {
  // Clear the in-memory database before each test to ensure test isolation
  beforeEach(() => {
    db.clearProducts();
  });

  // Test 1: Root path '/' should redirect to '/products'
  it('GET / should redirect to /products', (done) => {
    request(app)
      .get('/')
      .expect(302) // Expect a redirect status code
      .expect('Location', '/products') // Expect the Location header to be /products
      .end(done);
  });

  // Test 2: GET /products should render the product list page
  it('GET /products should render the product-list page with no products', (done) => {
    request(app)
      .get('/products')
      .expect(200)
      .expect('Content-Type', /html/)
      .end((err, res) => {
        if (err) return done(err);
        const $ = cheerio.load(res.text);
        expect($('h2').text()).to.include('Product List');
        expect($('p').text()).to.include('No products found. Create one!');
        expect($('table').length).to.equal(0); // No table if no products
        done();
      });
  });

  // Test 3: GET /products with existing products should render them in a table
  it('GET /products should render the product-list page with existing products', (done) => {
    db.saveProduct({ name: 'Laptop', description: 'Powerful laptop', price: 1200.00 });
    db.saveProduct({ name: 'Mouse', description: 'Wireless mouse', price: 25.00 });

    request(app)
      .get('/products')
      .expect(200)
      .expect('Content-Type', /html/)
      .end((err, res) => {
        if (err) return done(err);
        const $ = cheerio.load(res.text);
        expect($('h2').text()).to.include('Product List');
        expect($('table').length).to.equal(1);
        expect($('tbody tr').length).to.equal(2); // Two products should be in the table
        expect($('tbody tr:nth-child(1) td:nth-child(2)').text()).to.equal('Laptop');
        expect($('tbody tr:nth-child(2) td:nth-child(2)').text()).to.equal('Mouse');
        expect($('tbody tr:nth-child(1) td:nth-child(4)').text()).to.equal('$1200.00');
        expect($('tbody tr:nth-child(2) td:nth-child(4)').text()).to.equal('$25.00');
        done();
      });
  });

  // Test 4: GET /products/create should render the product creation form
  it('GET /products/create should render the product-create form', (done) => {
    request(app)
      .get('/products/create')
      .expect(200)
      .expect('Content-Type', /html/)
      .end((err, res) => {
        if (err) return done(err);
        const $ = cheerio.load(res.text);
        expect($('h2').text()).to.include('Create New Product');
        expect($('form').attr('action')).to.equal('/products/create');
        expect($('#name').length).to.equal(1);
        expect($('#description').length).to.equal(1);
        expect($('#price').length).to.equal(1);
        done();
      });
  });

  // Test 5: POST /products/create with valid data should create a product and redirect
  it('POST /products/create with valid data should create a product and redirect to /products', (done) => {
    request(app)
      .post('/products/create')
      .send({ name: 'New Phone', description: 'Latest smartphone model', price: 799.99 })
      .expect(302) // Expect a redirect
      .expect('Location', '/products')
      .end((err, res) => {
        if (err) return done(err);
        expect(db.getProducts()).to.have.lengthOf(1);
        expect(db.getProducts()[0].name).to.equal('New Phone');
        done();
      });
  });

  // Test 6: POST /products/create with invalid name should re-render form with error
  it('POST /products/create with empty name should re-render the form with an error message', (done) => {
    request(app)
      .post('/products/create')
      .send({ name: '', description: 'Description', price: 100 })
      .expect(200) // Stays on the same page, so 200 OK
      .expect('Content-Type', /html/)
      .end((err, res) => {
        if (err) return done(err);
        const $ = cheerio.load(res.text);
        expect($('h2').text()).to.include('Create New Product');
        expect($('.message.error').text()).to.include('Please enter valid product details');
        expect($('#name').val()).to.equal(''); // Form field should be pre-filled
        expect(db.getProducts()).to.be.empty; // No product should be created
        done();
      });
  });

  // Test 7: POST /products/create with invalid price should re-render form with error
  it('POST /products/create with invalid price should re-render the form with an error message', (done) => {
    request(app)
      .post('/products/create')
      .send({ name: 'Valid Name', description: 'Valid Description', price: 'abc' })
      .expect(200)
      .expect('Content-Type', /html/)
      .end((err, res) => {
        if (err) return done(err);
        const $ = cheerio.load(res.text);
        expect($('h2').text()).to.include('Create New Product');
        expect($('.message.error').text()).to.include('Please enter valid product details');
        expect($('#price').val()).to.equal('abc'); // Form field should be pre-filled
        expect(db.getProducts()).to.be.empty;
        done();
      });
  });

  // Test 8: POST /products/create with negative price should re-render form with error
  it('POST /products/create with negative price should re-render the form with an error message', (done) => {
    request(app)
      .post('/products/create')
      .send({ name: 'Valid Name', description: 'Valid Description', price: -10.00 })
      .expect(200)
      .expect('Content-Type', /html/)
      .end((err, res) => {
        if (err) return done(err);
        const $ = cheerio.load(res.text);
        expect($('h2').text()).to.include('Create New Product');
        expect($('.message.error').text()).to.include('Please enter valid product details');
        expect($('#price').val()).to.equal('-10'); // Form field should be pre-filled
        expect(db.getProducts()).to.be.empty;
        done();
      });
  });

  // Test 9: 404 handler for unknown routes
  it('GET /non-existent-route should return a 404 Not Found page', (done) => {
    request(app)
      .get('/non-existent-route')
      .expect(404)
      .expect('Content-Type', /html/)
      .end((err, res) => {
        if (err) return done(err);
        const $ = cheerio.load(res.text);
        expect($('h1').text()).to.include('An Error Occurred!');
        expect($('p').text()).to.include('Not Found');
        done();
      });
  });

  // Test 10: Global error handler for 500 Internal Server Error
  it('GET /test-error should return a 500 Internal Server Error page', (done) => {
    request(app)
      .get('/test-error') // This route is specifically added in app.js for testing this scenario
      .expect(500)
      .expect('Content-Type', /html/)
      .end((err, res) => {
        if (err) return done(err);
        const $ = cheerio.load(res.text);
        expect($('h1').text()).to.include('An Error Occurred!');
        expect($('p').text()).to.include('Simulated Internal Server Error');
        done();
      });
  });
});
