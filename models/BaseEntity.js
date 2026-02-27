const { DataTypes } = require('sequelize');

/**
 * Mirrors the BaseEntity.java class.
 * Provides a standard ID primary key for all domain objects.
 */
const baseAttributes = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
};

module.exports = baseAttributes;
