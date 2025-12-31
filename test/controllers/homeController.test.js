/**
 * @module test/controllers/homeController
 * @description Tests for the homeController.
 */

const homeController = require('../../controllers/homeController');
const sinon = require('sinon');

describe('homeController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      render: sinon.stub(),
      __: sinon.stub().returns('Welcome to PetClinic!') // Mock i18n translation
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('renderHomePage', () => {
    it('should render the index page with the correct title', () => {
      homeController.renderHomePage(req, res);

      expect(res.render.calledOnceWith('index', { title: 'Welcome to PetClinic!' })).to.be.true;
      expect(res.__.calledOnceWith('home.welcomeTitle')).to.be.true;
    });
  });
});

