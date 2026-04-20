const { expect } = require('chai');
const HelloModel = require('../models/helloModel');

describe('HelloModel Unit Tests', () => {
  it('should return the correct greeting message', () => {
    const expectedMessage = "Hello world!";
    const actualMessage = HelloModel.getGreeting();
    
    expect(actualMessage).to.be.a('string');
    expect(actualMessage).to.equal(expectedMessage);
  });

  it('should not return an empty string', () => {
    const actualMessage = HelloModel.getGreeting();
    expect(actualMessage).to.have.lengthOf.at.least(1);
  });
});
