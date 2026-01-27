/**
 * @fileoverview Test suite for Pet and Visit routes.
 * Covers adding/editing pets and adding/listing visits for a specific owner/pet.
 */

const request = require('supertest');
const { expect } = require('chai');
const db = require('../../models');
const { Owner, Pet, PetType, Visit } = db;
const { app } = global; // Access the Express app instance from global setup

describe('Pet & Visit Routes', () => {
  let ownerId, petTypeId;

  beforeEach(async () => {
    // Get existing owner and pet type for tests
    const owner = await Owner.findByPk(1); // George Franklin
    const petType = await PetType.findOne({ where: { name: 'cat' } });
    ownerId = owner.id;
    petTypeId = petType.id;
  });

  describe('Pet Routes', () => {
    describe('GET /owners/:ownerId/pets/new', () => {
      it('should return 200 and render the new pet form for a valid owner', (done) => {
        request(app)
          .get(`/owners/${ownerId}/pets/new`)
          .expect(200)
          .expect('Content-Type', /html/)
          .end((err, res) => {
            expect(res.text).to.include('New Pet George Franklin');
            expect(res.text).to.include('name="name"');
            expect(res.text).to.include('name="birthDate"');
            expect(res.text).to.include('name="type_id"');
            done(err);
          });
      });

      it('should redirect to /owners with flash error for an invalid owner ID', (done) => {
        request(app)
          .get('/owners/999/pets/new')
          .expect(302)
          .expect('Location', '/owners')
          .end((err, res) => {
            if (err) return done(err);
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include('Owner with ID 999 not found');
                done(err);
              });
          });
      });
    });

    describe('POST /owners/:ownerId/pets/new', () => {
      const newPetData = {
        name: 'Buddy',
        birthDate: '2020-03-01',
      };

      it('should create a new pet and redirect to owner details on success', (done) => {
        request(app)
          .post(`/owners/${ownerId}/pets/new`)
          .type('form')
          .send({ ...newPetData, type_id: petTypeId })
          .expect(302)
          .expect('Location', `/owners/${ownerId}`)
          .end(async (err, res) => {
            if (err) return done(err);

            const ownerWithNewPet = await Owner.findByPk(ownerId, { include: { model: Pet, as: 'pets' } });
            expect(ownerWithNewPet.pets.some(p => p.name === newPetData.name)).to.be.true;

            // Follow redirect to check flash message
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include(`Pet 'Buddy' for owner 'George Franklin' created successfully!`);
                done(err);
              });
          });
      });

      it('should return to form with validation errors if data is invalid', (done) => {
        request(app)
          .post(`/owners/${ownerId}/pets/new`)
          .type('form')
          .send({ ...newPetData, name: '' }) // Empty name
          .expect(200)
          .expect('Content-Type', /html/)
          .end((err, res) => {
            expect(res.text).to.include('Pet name must not be empty.');
            expect(res.text).to.include('is-invalid');
            done(err);
          });
      });

      it('should return to form with flash error if pet type is not found', (done) => {
        request(app)
          .post(`/owners/${ownerId}/pets/new`)
          .type('form')
          .send({ ...newPetData, type_id: 999 }) // Non-existent type
          .expect(200)
          .expect('Content-Type', /html/)
          .end((err, res) => {
            expect(res.text).to.include('Pet type not found.');
            done(err);
          });
      });

      it('should redirect to /owners with flash error for an invalid owner ID', (done) => {
        request(app)
          .post('/owners/999/pets/new')
          .type('form')
          .send({ ...newPetData, type_id: petTypeId })
          .expect(302)
          .expect('Location', '/owners')
          .end((err, res) => {
            if (err) return done(err);
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include('Owner with ID 999 not found');
                done(err);
              });
          });
      });
    });

    describe('GET /owners/:ownerId/pets/:petId/edit', () => {
      let petId;
      beforeEach(async () => {
        const pet = await Pet.findByPk(1); // Leo (owner 1)
        petId = pet.id;
      });

      it('should return 200 and render the edit pet form for a valid pet', (done) => {
        request(app)
          .get(`/owners/${ownerId}/pets/${petId}/edit`)
          .expect(200)
          .expect('Content-Type', /html/)
          .end((err, res) => {
            expect(res.text).to.include('Edit Pet George Franklin');
            expect(res.text).to.include('value="Leo"');
            expect(res.text).to.include('value="2000-09-07"');
            done(err);
          });
      });

      it('should redirect to owner details with flash error for invalid pet ID', (done) => {
        request(app)
          .get(`/owners/${ownerId}/pets/999/edit`) // Non-existent pet
          .expect(302)
          .expect('Location', `/owners/${ownerId}`)
          .end((err, res) => {
            if (err) return done(err);
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include(`Pet with ID 999 not found for owner ID ${ownerId}`);
                done(err);
              });
          });
      });

      it('should redirect to /owners with flash error for invalid owner ID', (done) => {
        request(app)
          .get(`/owners/999/pets/${petId}/edit`)
          .expect(302)
          .expect('Location', '/owners')
          .end((err, res) => {
            if (err) return done(err);
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include('Owner with ID 999 not found');
                done(err);
              });
          });
      });
    });

    describe('POST /owners/:ownerId/pets/:petId/edit', () => {
      let petId;
      const updatedPetData = {
        name: 'Leonidas',
        birthDate: '2001-10-10',
      };

      beforeEach(async () => {
        const pet = await Pet.findByPk(1); // Leo (owner 1)
        petId = pet.id;
      });

      it('should update a pet and redirect to owner details on success', (done) => {
        request(app)
          .post(`/owners/${ownerId}/pets/${petId}/edit`)
          .type('form')
          .send({ ...updatedPetData, type_id: petTypeId })
          .expect(302)
          .expect('Location', `/owners/${ownerId}`)
          .end(async (err, res) => {
            if (err) return done(err);

            const updatedPet = await Pet.findByPk(petId);
            expect(updatedPet.name).to.equal(updatedPetData.name);
            expect(updatedPet.birthDate).to.equal(updatedPetData.birthDate);

            // Follow redirect to check flash message
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include(`Pet 'Leonidas' for owner 'George Franklin' updated successfully!`);
                done(err);
              });
          });
      });

      it('should return to form with validation errors if data is invalid', (done) => {
        request(app)
          .post(`/owners/${ownerId}/pets/${petId}/edit`)
          .type('form')
          .send({ ...updatedPetData, birthDate: 'invalid-date' })
          .expect(200)
          .expect('Content-Type', /html/)
          .end((err, res) => {
            expect(res.text).to.include('Birth date must be a valid date.');
            expect(res.text).to.include('is-invalid');
            done(err);
          });
      });

      it('should return to form with flash error if pet type is not found', (done) => {
        request(app)
          .post(`/owners/${ownerId}/pets/${petId}/edit`)
          .type('form')
          .send({ ...updatedPetData, type_id: 999 }) // Non-existent type
          .expect(200)
          .expect('Content-Type', /html/)
          .end((err, res) => {
            expect(res.text).to.include('Pet type not found.');
            done(err);
          });
      });

      it('should redirect to owner details with flash error for invalid pet ID', (done) => {
        request(app)
          .post(`/owners/${ownerId}/pets/999/edit`)
          .type('form')
          .send({ ...updatedPetData, type_id: petTypeId })
          .expect(302)
          .expect('Location', `/owners/${ownerId}`)
          .end((err, res) => {
            if (err) return done(err);
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include(`Pet with ID 999 not found for owner ID ${ownerId}`);
                done(err);
              });
          });
      });

      it('should redirect to /owners with flash error for invalid owner ID', (done) => {
        request(app)
          .post(`/owners/999/pets/${petId}/edit`)
          .type('form')
          .send({ ...updatedPetData, type_id: petTypeId })
          .expect(302)
          .expect('Location', '/owners')
          .end((err, res) => {
            if (err) return done(err);
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include('Owner with ID 999 not found');
                done(err);
              });
          });
      });
    });
  });

  describe('Visit Routes', () => {
    let ownerIdWithPet, petIdWithVisits;

    beforeEach(async () => {
      // Create a dedicated owner and pet for visit tests to ensure isolation
      const newOwner = await Owner.create({
        firstName: 'VisitTest', lastName: 'Owner', address: '123 Visit St', city: 'Visit City', telephone: '1111111111'
      });
      const newPetType = await PetType.create({ name: 'test-visit-type' });
      const newPet = await Pet.create({
        name: 'VisitPet', birthDate: '2022-01-01', typeId: newPetType.id, ownerId: newOwner.id
      });
      ownerIdWithPet = newOwner.id;
      petIdWithVisits = newPet.id;
    });

    describe('GET /owners/:ownerId/pets/:petId/visits/new', () => {
      it('should return 200 and render the new visit form for a valid pet', (done) => {
        request(app)
          .get(`/owners/${ownerIdWithPet}/pets/${petIdWithVisits}/visits/new`)
          .expect(200)
          .expect('Content-Type', /html/)
          .end((err, res) => {
            expect(res.text).to.include(`New Visit VisitPet (VisitTest Owner)`);
            expect(res.text).to.include('name="date"');
            expect(res.text).to.include('name="description"');
            done(err);
          });
      });

      it('should redirect to owner details with flash error for invalid pet ID', (done) => {
        request(app)
          .get(`/owners/${ownerIdWithPet}/pets/999/visits/new`)
          .expect(302)
          .expect('Location', `/owners/${ownerIdWithPet}`)
          .end((err, res) => {
            if (err) return done(err);
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include(`Pet with ID 999 not found for owner ID ${ownerIdWithPet}`);
                done(err);
              });
          });
      });
    });

    describe('POST /owners/:ownerId/pets/:petId/visits/new', () => {
      const newVisitData = {
        date: '2023-11-20',
        description: 'Annual checkup'
      };

      it('should create a new visit and redirect to owner details on success', (done) => {
        request(app)
          .post(`/owners/${ownerIdWithPet}/pets/${petIdWithVisits}/visits/new`)
          .type('form')
          .send(newVisitData)
          .expect(302)
          .expect('Location', `/owners/${ownerIdWithPet}`)
          .end(async (err, res) => {
            if (err) return done(err);

            const petWithVisits = await Pet.findByPk(petIdWithVisits, { include: { model: Visit, as: 'visits' } });
            expect(petWithVisits.visits.some(v => v.description === newVisitData.description)).to.be.true;

            // Follow redirect to check flash message
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include(`Visit for pet 'VisitPet' on ${newVisitData.date} created successfully!`);
                done(err);
              });
          });
      });

      it('should return to form with validation errors if data is invalid', (done) => {
        request(app)
          .post(`/owners/${ownerIdWithPet}/pets/${petIdWithVisits}/visits/new`)
          .type('form')
          .send({ ...newVisitData, description: '' }) // Empty description
          .expect(200)
          .expect('Content-Type', /html/)
          .end((err, res) => {
            expect(res.text).to.include('Description must not be empty.');
            expect(res.text).to.include('is-invalid');
            done(err);
          });
      });

      it('should redirect to owner details with flash error for invalid pet ID', (done) => {
        request(app)
          .post(`/owners/${ownerIdWithPet}/pets/999/visits/new`)
          .type('form')
          .send(newVisitData)
          .expect(302)
          .expect('Location', `/owners/${ownerIdWithPet}`)
          .end((err, res) => {
            if (err) return done(err);
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include(`Pet with ID 999 not found for owner ID ${ownerIdWithPet}`);
                done(err);
              });
          });
      });
    });

    describe('GET /owners/:ownerId/pets/:petId/visits', () => {
      let petIdWithExistingVisits;
      beforeEach(async () => {
        const pet = await Pet.findByPk(7); // Samantha, has visits
        ownerIdWithPet = pet.ownerId; // Jean Coleman
        petIdWithExistingVisits = pet.id;
      });

      it('should return 200 and render the pet visits list', (done) => {
        request(app)
          .get(`/owners/${ownerIdWithPet}/pets/${petIdWithExistingVisits}/visits`)
          .expect(200)
          .expect('Content-Type', /html/)
          .end((err, res) => {
            expect(res.text).to.include(`Pet Visits Samantha`);
            expect(res.text).to.include('rabies shot');
            expect(res.text).to.include('spayed');
            done(err);
          });
      });

      it('should redirect to owner details with flash error for invalid pet ID', (done) => {
        request(app)
          .get(`/owners/${ownerIdWithPet}/pets/999/visits`)
          .expect(302)
          .expect('Location', `/owners/${ownerIdWithPet}`)
          .end((err, res) => {
            if (err) return done(err);
            request(app)
              .get(res.headers.location)
              .expect(200)
              .end((err, resAfterRedirect) => {
                expect(resAfterRedirect.text).to.include(`Pet with ID 999 not found for owner ID ${ownerIdWithPet}`);
                done(err);
              });
          });
      });
    });
  });
});
