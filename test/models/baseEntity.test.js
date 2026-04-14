// test/models/baseEntity.test.js
const { expect } = require('chai');
const { BaseEntity } = require('../../test/config/testDb').models; // Using testDb for models

describe('BaseEntity Model', () => {
  beforeEach(() => {
    // Reset any state or create fresh instances for each test
  });

  it('should correctly identify a new entity when id is null', () => {
    const entity = new BaseEntity();
    entity.id = null;
    expect(entity.isNew()).to.be.true;
  });

  it('should correctly identify a new entity when id is undefined', () => {
    const entity = new BaseEntity();
    delete entity.id; // Ensure id is truly undefined
    expect(entity.isNew()).to.be.true;
  });

  it('should correctly identify an existing entity when id is set', () => {
    const entity = new BaseEntity();
    entity.id = 1;
    expect(entity.isNew()).to.be.false;
  });

  it('should correctly identify an existing entity when id is 0 (though typically IDs are positive)', () => {
    const entity = new BaseEntity();
    entity.id = 0;
    expect(entity.isNew()).to.be.false;
  });
});
