const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const baseAttributes = require('./BaseEntity');

class Visit extends Model {}

Visit.init({
  ...baseAttributes,
  visitDate: { 
    type: DataTypes.DATEONLY, 
    defaultValue: DataTypes.NOW 
  },
  description: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'visit' });

module.exports = Visit;
