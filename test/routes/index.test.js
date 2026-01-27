/**
 * @fileoverview Test suite for general index routes, including home, error, and locale change.
 */

const request = require('supertest');
const { expect } = require('chai');
const db = require('../../models'); // Ensure models are loaded for global.models
const i18nConfig = require('../../config/i18n');
const { app } = global; // Access the Express app instance from global setup

describe('Index Routes', () => {

  describe('GET /', () => {
    it('should return 200 and render the home page', (done) => {
      request(app)
        .get('/')
        .expect(200)
        .end((err, res) => {
          expect(res.text).to.include('Welcome to PetClinic');
          expect(res.text).to.include('Find Owners'); // Check for common link
          done(err);
        });
    });
  });

  describe('GET /oups', () => {
    it('should return 500 and render the custom error page', (done) => {
      request(app)
        .get('/oups')
        .expect(500)
        .end((err, res) => {
          expect(res.text).to.include('Something went wrong!');
          expect(res.text).to.include('Oups! Something went wrong on purpose.');
          done(err);
        });
    });
  });

  describe('GET /locale', () => {
    it('should change the locale to German and redirect back to home', (done) => {
      request(app)
        .get('/locale?lang=de')
        .set('Referer', '/') // Simulate a referer header
        .expect(302) // Redirect
        .end((err, res) => {
          if (err) return done(err);

          // Follow the redirect to check if locale is applied
          request(app)
            .get(res.headers.location)
            .expect(200)
            .end((err, resAfterRedirect) => {
              if (err) return done(err);
              expect(resAfterRedirect.text).to.include('Willkommen in der Tierklinik'); // German text
              // Verify flash message for locale change
              expect(resAfterRedirect.text).to.include('Sprache geändert zu de');
              done();
            });
        });
    });

    it('should change the locale to Spanish and redirect back to /owners/find', (done) => {
      request(app)
        .get('/locale?lang=es')
        .set('Referer', '/owners/find') // Simulate a referer header
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);

          request(app)
            .get(res.headers.location)
            .expect(200)
            .end((err, resAfterRedirect) => {
              if (err) return done(err);
              expect(resAfterRedirect.text).to.include('Buscar Propietarios'); // Spanish text
              expect(resAfterRedirect.text).to.include('Idioma cambiado a es');
              done();
            });
        });
    });

    it('should not change locale for an invalid language and flash an error', (done) => {
      request(app)
        .get('/locale?lang=fr') // 'fr' is not a supported locale
        .set('Referer', '/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);

          request(app)
            .get(res.headers.location)
            .expect(200)
            .end((err, resAfterRedirect) => {
              if (err) return done(err);
              expect(resAfterRedirect.text).to.include('Welcome to PetClinic'); // Should remain English (default)
              expect(resAfterRedirect.text).to.include('Invalid language selected.'); // Flash error message
              done();
            });
        });
    });

    it('should redirect to home if no referer header is present', (done) => {
      request(app)
        .get('/locale?lang=de')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.headers.location).to.equal('/'); // Should redirect to /
          done();
        });
    });
  });
});
