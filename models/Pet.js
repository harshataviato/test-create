const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const baseAttributes = require('./BaseEntity');

class Pet extends Model {}

Pet.init({
  ...baseAttributes,
  name: { type: DataTypes.STRING, allowNull: false },
  birthDate: { type: DataTypes.DATEONLY, allowNull: false }
}, { sequelize, modelName: 'pet' });

module.exports = Pet;
