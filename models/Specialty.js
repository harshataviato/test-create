const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const baseAttributes = require('./BaseEntity');

class Specialty extends Model {}

Specialty.init({
  ...baseAttributes,
  name: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'specialty' });

module.exports = Specialty;
