const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Startup Model
 * Represents a company in the Aviato ecosystem.
 */
const Startup = sequelize.define('Startup', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valuation: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Stealth', 'Seed', 'Series A', 'IPO', 'Acquired'),
    defaultValue: 'Stealth'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = Startup;
