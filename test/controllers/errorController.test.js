/**
 * @module test/controllers/errorController
 * @description Tests for the errorController.
 */

const errorController = require('../../controllers/errorController');
const sinon = require('sinon');

describe('errorController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      __: sinon.stub().returns('Error simulation message') // Mock i18n translation
    };
    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('triggerError', () => {
    it('should throw an error with the correct message', () => {
      let caughtError;
      try {
        errorController.triggerError(req, res, next);
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).to.be.an('error');
      expect(caughtError.message).to.equal('Error simulation message');
      expect(res.__.calledOnceWith('error.simulationMessage')).to.be.true;
      expect(next.notCalled).to.be.true; // Error is thrown, not passed to next
    });
  });
});

