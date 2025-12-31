/**
 * @module test/middleware/localeMiddleware
 * @description Tests for the localeMiddleware.
 */

const localeMiddleware = require('../../middleware/localeMiddleware');
const i18n = require('../../config/i18n'); // Import actual i18n instance
const sinon = require('sinon');

describe('localeMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      originalUrl: '/test?param=value'
    };
    res = {
      redirect: sinon.stub(),
    };
    next = sinon.stub();

    // Stub i18n.setLocale to avoid actual locale changes affecting other tests
    sinon.stub(i18n, 'setLocale');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call next if no lang query parameter is present', () => {
    localeMiddleware(req, res, next);

    expect(i18n.setLocale.notCalled).to.be.true;
    expect(res.redirect.notCalled).to.be.true;
    expect(next.calledOnce).to.be.true;
  });

  it('should set locale and redirect if lang query parameter is present', () => {
    req.query.lang = 'es';
    localeMiddleware(req, res, next);

    expect(i18n.setLocale.calledOnceWith(req, 'es')).to.be.true;
    expect(res.redirect.calledOnceWith('/test')).to.be.true;
    expect(next.notCalled).to.be.true; // Redirect stops further middleware execution
  });

  it('should strip other query parameters when redirecting', () => {
    req.query.lang = 'en';
    req.originalUrl = '/owners?lastName=franklin&lang=en';
    localeMiddleware(req, res, next);

    expect(i18n.setLocale.calledOnceWith(req, 'en')).to.be.true;
    expect(res.redirect.calledOnceWith('/owners')).to.be.true;
    expect(next.notCalled).to.be.true;
  });

  it('should handle root URL correctly when redirecting', () => {
    req.query.lang = 'es';
    req.originalUrl = '/?lang=es';
    localeMiddleware(req, res, next);

    expect(i18n.setLocale.calledOnceWith(req, 'es')).to.be.true;
    expect(res.redirect.calledOnceWith('/')).to.be.true;
    expect(next.notCalled).to.be.true;
  });
});

