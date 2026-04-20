const { expect } = require('chai');
const sinon = require('sinon');
const HelloController = require('../controllers/helloController');
const HelloModel = require('../models/helloModel');

describe('HelloController Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      render: sinon.spy(),
      json: sinon.spy(),
      status: sinon.stub().returns({
        send: sinon.spy()
      })
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('renderHello', () => {
    it('should render the index view with the greeting message', () => {
      HelloController.renderHello(req, res);
      
      expect(res.render.calledOnce).to.be.true;
      expect(res.render.firstCall.args[0]).to.equal('index');
      expect(res.render.firstCall.args[1]).to.have.property('message', 'Hello world!');
    });

    it('should return 500 status if HelloModel throws an error', () => {
      // Force an error in the model
      sinon.stub(HelloModel, 'getGreeting').throws(new Error('Database Failure'));
      
      // Suppress console.error for clean test output
      sinon.stub(console, 'error');

      HelloController.renderHello(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.status().send.calledWith('Internal Server Error')).to.be.true;
    });
  });

  describe('getHelloJson', () => {
    it('should return the greeting message as JSON', () => {
      HelloController.getHelloJson(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'Hello world!' });
    });
  });
});
