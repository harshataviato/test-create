/**
 * @fileoverview Integration tests for the main Express application setup (app.js).
 * Covers middleware, static file serving, and global error handling.
 */

const request = require('supertest');
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { app } = global; // Access the Express app instance from global setup

describe('Application Integration Tests (app.js)', () => {

  describe('Static File Serving', () => {
    it('should serve petclinic.css from /resources/css', (done) => {
      const cssFilePath = path.join(__dirname, '../../public/resources/css/petclinic.css');
      const cssContent = fs.readFileSync(cssFilePath, 'utf8');

      request(app)
        .get('/resources/css/petclinic.css')
        .expect(200)
        .expect('Content-Type', 'text/css; charset=utf-8')
        .end((err, res) => {
          expect(res.text).to.equal(cssContent);
          done(err);
        });
    });

    it('should serve bootstrap.min.css from /webjars/bootstrap', (done) => {
      request(app)
        .get('/webjars/bootstrap/5.3.3/css/bootstrap.min.css')
        .expect(200)
        .expect('Content-Type', 'text/css; charset=UTF-8') // npm's webjars typically serve with UTF-8
        .end((err, res) => {
          // Basic check for content to ensure it's not empty and looks like CSS
          expect(res.text).to.not.be.empty;
          expect(res.text).to.include('.btn-primary');
          done(err);
        });
    }).timeout(5000); // Increased timeout for file serving from node_modules

    it('should return 404 for a non-existent static file', (done) => {
      request(app)
        .get('/resources/css/non-existent.css')
        .expect(404)
        .end(done);
    });
  });

  describe('Global Error Handling', () => {
    it('should render the error page for a non-existent route (404)', (done) => {
      request(app)
        .get('/non-existent-route')
        .expect(404)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Something went wrong!');
          expect(res.text).to.include('Not Found'); // Default Express 404 message or configured i18n
          expect(res.text).to.include('Status: 404');
          done(err);
        });
    });

    it('should render the error page for a server-side error (500)', (done) => {
      // Trigger the /oups route which is designed to throw a 500 error
      request(app)
        .get('/oups')
        .expect(500)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Something went wrong!');
          expect(res.text).to.include('Oups! Something went wrong on purpose.');
          expect(res.text).to.include('Status: 500');
          // In development, stack trace might be visible
          if (process.env.NODE_ENV === 'development') {
            expect(res.text).to.include('at exports.oups'); // Check for part of stack trace
          }
          done(err);
        });
    });

    it('should display a generic error message for unhandled errors without specific message', (done) => {
      // Temporarily add a route that throws a generic error
      app.get('/test-generic-error', (req, res, next) => {
        next(new Error()); // Error without a specific message
      });

      request(app)
        .get('/test-generic-error')
        .expect(500)
        .expect('Content-Type', /html/)
        .end((err, res) => {
          expect(res.text).to.include('Something went wrong!');
          expect(res.text).to.include('An unexpected error occurred. Please try again later.'); // Default i18n message
          expect(res.text).to.include('Status: 500');
          // Remove the temporary route
          app._router.stack = app._router.stack.filter(layer => layer.route && layer.route.path !== '/test-generic-error');
          done(err);
        });
    });
  });

  describe('i18n Middleware', () => {
    it('should apply default locale (en) if no session locale or query param', (done) => {
      request(app)
        .get('/')
        .expect(200)
        .end((err, res) => {
          expect(res.text).to.include('Welcome to PetClinic'); // English default
          done(err);
        });
    });

    it('should apply locale from query parameter for the current request', (done) => {
      request(app)
        .get('/?lang=de')
        .expect(200)
        .end((err, res) => {
          expect(res.text).to.include('Willkommen in der Tierklinik'); // German
          done(err);
        });
    });
  });

  // Flash messages are primarily tested in controller/route tests where redirects occur.
  // This test provides a basic check for res.locals.messages/errors availability.
  describe('Flash Message Middleware', () => {
    it('should make flash messages available in res.locals', (done) => {
      // A route that sets a flash message and redirects to another that renders it.
      app.get('/test-flash-set', (req, res) => {
        req.flash('message', 'This is a test flash message.');
        res.redirect('/test-flash-get');
      });

      // A route that renders a view to check res.locals.messages
      app.get('/test-flash-get', (req, res) => {
        res.render('home', { title: 'Flash Test', messages: res.locals.messages, errors: res.locals.errors });
      });

      request(app)
        .get('/test-flash-set')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          request(app)
            .get(res.headers.location)
            .expect(200)
            .end((err, resAfterRedirect) => {
              expect(resAfterRedirect.text).to.include('This is a test flash message.');
              // Clean up test routes
              app._router.stack = app._router.stack.filter(layer => !layer.route || (layer.route.path !== '/test-flash-set' && layer.route.path !== '/test-flash-get'));
              done(err);
            });
        });
    });
  });
});
