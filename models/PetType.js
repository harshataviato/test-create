const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const baseAttributes = require('./BaseEntity');

class PetType extends Model {}

PetType.init({
  ...baseAttributes,
  name: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'pet_type' });

module.exports = PetType;
