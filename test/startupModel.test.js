const { expect } = require('chai');
const Startup = require('../models/Startup');
const sequelize = require('../config/database');

describe('Startup Model Unit Tests', () => {
  before(async () => {
    // Sync the database specifically for the model tests
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    // Clean up table after each test
    await Startup.destroy({ where: {}, truncate: true });
  });

  it('should create a valid startup with all required fields', async () => {
    const startupData = {
      name: 'Pied Piper',
      industry: 'Data Compression',
      valuation: 500000000,
      status: 'Series A'
    };
    
    const startup = await Startup.create(startupData);
    
    expect(startup.id).to.not.be.null;
    expect(startup.name).to.equal('Pied Piper');
    expect(startup.status).to.equal('Series A');
    expect(parseFloat(startup.valuation)).to.equal(500000000.00);
  });

  it('should apply default values for valuation and status', async () => {
    const startup = await Startup.create({
      name: 'Hooli',
      industry: 'Everything'
    });

    expect(parseFloat(startup.valuation)).to.equal(0.00);
    expect(startup.status).to.equal('Stealth');
  });

  it('should fail validation if name is empty', async () => {
    try {
      await Startup.create({
        name: '',
        industry: 'Tech'
      });
      throw new Error('Should have thrown validation error');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
    }
  });

  it('should fail if name is null', async () => {
    try {
      await Startup.create({
        industry: 'Tech'
      });
      throw new Error('Should have thrown validation error');
    } catch (error) {
      expect(error.name).to.equal('SequelizeValidationError');
      expect(error.errors[0].path).to.equal('name');
    }
  });

  it('should restrict status to the allowed ENUM values', async () => {
    try {
      await Startup.create({
        name: 'BadStatus Inc',
        industry: 'Testing',
        status: 'Bankruptcy' // Not in ENUM
      });
      throw new Error('Should have thrown validation error');
    } catch (error) {
      expect(error.name).to.equal('SequelizeDatabaseError').catch;
      // SQLite handles ENUMs as strings but Sequelize enforces validation
      if(error.name === 'SequelizeValidationError') {
         expect(error.message).to.contain('status');
      }
    }
  });
});
