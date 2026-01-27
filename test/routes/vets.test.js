/**
 * @fileoverview Test suite for Vet routes and VetController functionality.
 * Covers listing all vets and the JSON API endpoint.
 */

const request = require('supertest');
const { expect } = require('chai');
const db = require('../../models');
const { Vet } = db;
const { app } = global; // Access the Express app instance from global setup

describe('Vet Routes', () => {

  describe('GET /vets', () => {
    it('should return 200 and render the vet list page', (done) => {
      request(app)
        .get('/vets')
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Veterinarians');
          expect(res.text).to.include('James Carter');
          expect(res.text).to.include('Helen Leary');
          expect(res.text).to.include('radiology'); // Check for specialties
          done(err);
        });
    });

    it('should display vets sorted by last name', (done) => {
      request(app)
        .get('/vets')
        .expect(200)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          const expectedOrder = ['Carter', 'Douglas', 'Jenkins', 'Leary', 'Ortega', 'Stevens'];
          const vetNamesRegex = /<td[^>]*>(\w+ \w+)<\/td>/g;
          let match;
          const displayedVetsLastNames = [];
          while ((match = vetNamesRegex.exec(res.text)) !== null) {
            displayedVetsLastNames.push(match[1].split(' ')[1]); // Extract last name
          }
          // Filter to only include the pre-seeded vets, excluding any added during other tests
          const seededVetsLastNames = displayedVetsLastNames.filter(name => expectedOrder.includes(name));
          expect(seededVetsLastNames).to.deep.equal(expectedOrder);
          done(err);
        });
    });
  });

  describe('GET /vets.json', () => {
    it('should return 200 and a JSON array of vets', (done) => {
      request(app)
        .get('/vets.json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          expect(res.body).to.have.property('vets');
          expect(res.body.vets).to.be.an('array');
          expect(res.body.vets).to.have.lengthOf(6); // 6 vets in seed data
          expect(res.body.vets[0]).to.have.property('firstName');
          expect(res.body.vets[0]).to.have.property('lastName');
          expect(res.body.vets[0]).to.have.property('specialties');
          expect(res.body.vets[0].specialties).to.be.an('array');
          done(err);
        });
    });

    it('should include specialties for vets in the JSON response', (done) => {
      request(app)
        .get('/vets.json')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          const helenLeary = res.body.vets.find(v => v.firstName === 'Helen' && v.lastName === 'Leary');
          expect(helenLeary).to.exist;
          expect(helenLeary.specialties).to.have.lengthOf(1);
          expect(helenLeary.specialties[0].name).to.equal('radiology');

          const lindaDouglas = res.body.vets.find(v => v.firstName === 'Linda' && v.lastName === 'Douglas');
          expect(lindaDouglas).to.exist;
          expect(lindaDouglas.specialties).to.have.lengthOf(2);
          const specialtyNames = lindaDouglas.specialties.map(s => s.name);
          expect(specialtyNames).to.include.members(['surgery', 'dentistry']);
          done(err);
        });
    });
  });
});
