/**
 * @fileoverview Test suite for Owner routes and OwnerController functionality.
 * Covers listing, finding, creating, showing, and updating owners.
 */

const request = require('supertest');
const { expect } = require('chai');
const db = require('../../models');
const { Owner } = db;
const { app } = global; // Access the Express app instance from global setup

describe('Owner Routes', () => {

  describe('GET /owners', () => {
    it('should redirect to /owners/find', (done) => {
      request(app)
        .get('/owners')
        .expect(302)
        .expect('Location', '/owners/find')
        .end(done);
    });
  });

  describe('GET /owners/find', () => {
    it('should return 200 and render the find owners form', (done) => {
      request(app)
        .get('/owners/find')
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Find Owners');
          expect(res.text).to.include('name="lastName"');
          done(err);
        });
    });
  });

  describe('POST /owners/find', () => {
    it('should find owner(s) by last name and redirect to details if one is found', (done) => {
      request(app)
        .post('/owners/find')
        .type('form')
        .send({ lastName: 'Franklin' })
        .expect(302)
        .expect('Location', '/owners/1') // George Franklin has ID 1
        .end(done);
    });

    it('should find owner(s) by partial last name (case-insensitive) and display list if multiple are found', (done) => {
      request(app)
        .post('/owners/find')
        .type('form')
        .send({ lastName: 'dav' }) // Davis (Betty, Harold)
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Owners');
          expect(res.text).to.include('Betty Davis');
          expect(res.text).to.include('Harold Davis');
          done(err);
        });
    });

    it('should return to form with error message if no owners are found', (done) => {
      request(app)
        .post('/owners/find')
        .type('form')
        .send({ lastName: 'NonExistent' })
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('No owners found');
          expect(res.text).to.include('Find Owners'); // Still on the find form
          done(err);
        });
    });

    it('should return to form with validation error if last name is empty', (done) => {
      request(app)
        .post('/owners/find')
        .type('form')
        .send({ lastName: '' })
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Last name must not be empty.');
          expect(res.text).to.include('is-invalid'); // Check for validation class
          done(err);
        });
    });
  });

  describe('GET /owners/new', () => {
    it('should return 200 and render the new owner form', (done) => {
      request(app)
        .get('/owners/new')
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('New Owner');
          expect(res.text).to.include('name="firstName"');
          done(err);
        });
    });
  });

  describe('POST /owners/new', () => {
    const newOwnerData = {
      firstName: 'New',
      lastName: 'Owner',
      address: '789 Pine St',
      city: 'Greenville',
      telephone: '1112223333'
    };

    it('should create a new owner and redirect to their details page on success', (done) => {
      request(app)
        .post('/owners/new')
        .type('form')
        .send(newOwnerData)
        .expect(302)
        .end(async (err, res) => {
          if (err) return done(err);

          const newOwnerId = res.headers.location.split('/').pop();
          expect(res.headers.location).to.match(/^\/owners\/\d+$/);

          const createdOwner = await Owner.findByPk(newOwnerId);
          expect(createdOwner).to.exist;
          expect(createdOwner.firstName).to.equal(newOwnerData.firstName);

          // Follow redirect to check flash message
          request(app)
            .get(res.headers.location)
            .expect(200)
            .expect('Content-Type', /html/)
            .end((err, resAfterRedirect) => {
              expect(resAfterRedirect.text).to.include(`Owner '${newOwnerData.firstName} ${newOwnerData.lastName}' created successfully!`);
              done(err);
            });
        });
    });

    it('should return to form with validation errors if data is invalid', (done) => {
      request(app)
        .post('/owners/new')
        .type('form')
        .send({ ...newOwnerData, telephone: '123' }) // Invalid telephone
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Telephone must be a 10-digit number');
          expect(res.text).to.include('is-invalid');
          done(err);
        });
    });
  });

  describe('GET /owners/:ownerId', () => {
    it('should return 200 and render owner details for a valid ID', (done) => {
      request(app)
        .get('/owners/1') // George Franklin
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('George Franklin');
          expect(res.text).to.include('110 W. Liberty St.');
          expect(res.text).to.include('Leo'); // Pet name
          expect(res.text).to.include('2000-09-07'); // Pet birth date
          done(err);
        });
    });

    it('should redirect to /owners with flash error for an invalid owner ID', (done) => {
      request(app)
        .get('/owners/999') // Non-existent ID
        .expect(302)
        .expect('Location', '/owners')
        .end((err, res) => {
          if (err) return done(err);
          // Follow redirect to check flash message
          request(app)
            .get(res.headers.location)
            .expect(200)
            .expect('Content-Type', /html/)
            .end((err, resAfterRedirect) => {
              expect(resAfterRedirect.text).to.include('Owner with ID 999 not found');
              done(err);
            });
        });
    });
  });

  describe('GET /owners/:ownerId/edit', () => {
    it('should return 200 and render the edit owner form for a valid ID', (done) => {
      request(app)
        .get('/owners/1/edit') // George Franklin
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Edit Owner');
          expect(res.text).to.include('value="George"');
          expect(res.text).to.include('value="Franklin"');
          done(err);
        });
    });

    it('should redirect to /owners with flash error for an invalid owner ID', (done) => {
      request(app)
        .get('/owners/999/edit')
        .expect(302)
        .expect('Location', '/owners')
        .end((err, res) => {
          if (err) return done(err);
          request(app)
            .get(res.headers.location)
            .expect(200)
            .expect('Content-Type', /html/)
            .end((err, resAfterRedirect) => {
              expect(resAfterRedirect.text).to.include('Owner with ID 999 not found');
              done(err);
            });
        });
    });
  });

  describe('POST /owners/:ownerId/edit', () => {
    const updatedOwnerData = {
      firstName: 'Georgina',
      lastName: 'Franklin',
      address: '222 Oak Drive',
      city: 'Springfield',
      telephone: '0001112222'
    };

    it('should update an owner and redirect to their details page on success', (done) => {
      request(app)
        .post('/owners/1/edit') // George Franklin
        .type('form')
        .send(updatedOwnerData)
        .expect(302)
        .expect('Location', '/owners/1')
        .end(async (err, res) => {
          if (err) return done(err);

          const updatedOwner = await Owner.findByPk(1);
          expect(updatedOwner.firstName).to.equal(updatedOwnerData.firstName);
          expect(updatedOwner.city).to.equal(updatedOwnerData.city);

          // Follow redirect to check flash message
          request(app)
            .get(res.headers.location)
            .expect(200)
            .expect('Content-Type', /html/)
            .end((err, resAfterRedirect) => {
              expect(resAfterRedirect.text).to.include(`Owner '${updatedOwnerData.firstName} ${updatedOwnerData.lastName}' updated successfully!`);
              done(err);
            });
        });
    });

    it('should return to form with validation errors if data is invalid', (done) => {
      request(app)
        .post('/owners/1/edit')
        .type('form')
        .send({ ...updatedOwnerData, address: '' }) // Empty address
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Address must not be empty.');
          expect(res.text).to.include('is-invalid');
          done(err);
        });
    });

    it('should redirect to /owners with flash error if owner to update is not found', (done) => {
      request(app)
        .post('/owners/999/edit')
        .type('form')
        .send(updatedOwnerData)
        .expect(302)
        .expect('Location', '/owners')
        .end((err, res) => {
          if (err) return done(err);
          request(app)
            .get(res.headers.location)
            .expect(200)
            .expect('Content-Type', /html/)
            .end((err, resAfterRedirect) => {
              expect(resAfterRedirect.text).to.include('Owner with ID 999 not found');
              done(err);
            });
        });
    });
  });
});
