const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const baseAttributes = require('./BaseEntity');

class Vet extends Model {}

Vet.init({
  ...baseAttributes,
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'vet' });

module.exports = Vet;
