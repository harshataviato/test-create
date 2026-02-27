const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const baseAttributes = require('./BaseEntity');

class Owner extends Model {}

Owner.init({
  ...baseAttributes,
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.STRING, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  telephone: { 
    type: DataTypes.STRING, 
    allowNull: false,
    validate: {
      isNumeric: true,
      len: [10, 10] // Mirrors the 10-digit regex in Java
    }
  }
}, { sequelize, modelName: 'owner' });

module.exports = Owner;
