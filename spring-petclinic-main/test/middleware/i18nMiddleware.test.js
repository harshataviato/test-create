/**
 * @file test/middleware/i18nMiddleware.test.js
 * @description Automated tests for the i18nMiddleware.
 */

process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const sinon = require('sinon');
const i18n = require('../../utils/i18n'); // The actual i18n instance
const i18nMiddleware = require('../../middleware/i18nMiddleware');

describe('i18nMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      path: '/'
    };
    res = {
      locals: {}
    };
    next = sinon.spy();
    sinon.stub(i18n, 'setLocale'); // Stub setLocale to check calls
    sinon.stub(i18n, 'getLocale').returns('en'); // Default locale for checks
  });

  afterEach(() => {
    sinon.restore(); // Restore all stubs
    // Reset i18n locale to default after each test
    i18n.setLocale.restore(); // Need to restore to allow setting
    i18n.setLocale('en');
  });

  it('should initialize i18n and set res.locals.__ and __n', () => {
    const middleware = i18nMiddleware(i18n);
    middleware(req, res, next);

    expect(res.locals.__).to.be.a('function');
    expect(res.locals.__n).to.be.a('function');
    expect(next.calledOnce).to.be.true;
    expect(i18n.setLocale.notCalled).to.be.true; // No lang param
  });

  it('should change locale if "lang" query parameter is present', () => {
    req.query.lang = 'es';
    const middleware = i18nMiddleware(i18n);
    middleware(req, res, next);

    expect(i18n.setLocale.calledOnceWith('es')).to.be.true;
    expect(next.calledOnce).to.be.true;
  });

  it('should not change locale if "lang" query parameter is absent', () => {
    const middleware = i18nMiddleware(i18n);
    middleware(req, res, next);

    expect(i18n.setLocale.notCalled).to.be.true;
    expect(next.calledOnce).to.be.true;
  });

  it('should make translation function available globally to views', () => {
    const middleware = i18nMiddleware(i18n);
    middleware(req, res, next);

    // Call res.locals.__ directly
    sinon.stub(i18n, '__').returns('Translated text');
    const translated = res.locals.__('some.key');
    expect(translated).to.equal('Translated text');
    expect(i18n.__.calledOnceWith('some.key')).to.be.true;
  });
});

