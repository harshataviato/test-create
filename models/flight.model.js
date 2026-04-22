/**
 * Flight Model definition.
 * Defines the schema for the flights table.
 */
module.exports = (sequelize, DataTypes) => {
    const Flight = sequelize.define('Flight', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        flightNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        origin: {
            type: DataTypes.STRING,
            allowNull: false
        },
        destination: {
            type: DataTypes.STRING,
            allowNull: false
        },
        departureTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('On Time', 'Delayed', 'Cancelled'),
            defaultValue: 'On Time'
        }
    });

    return Flight;
};
