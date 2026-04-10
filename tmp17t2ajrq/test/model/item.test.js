process.env.NODE_ENV = 'test'; // Ensure test environment

const { expect } = require('chai');
const { db } = require('../../app'); // Import db from app.js which exports it
const { Item } = db;

describe('Item Model', () => {
    // Before each test, synchronize the database and clear all items
    beforeEach(async () => {
        // Use force: true to drop tables and recreate them, ensuring a clean state
        await db.sequelize.sync({ force: true });
    });

    describe('Item Creation', () => {
        it('should create an item successfully with valid attributes', async () => {
            const item = await Item.create({
                name: 'Test Item',
                description: 'A description for the test item.',
                price: 9.99
            });

            expect(item).to.exist;
            expect(item.name).to.equal('Test Item');
            expect(item.description).to.equal('A description for the test item.');
            expect(item.price).to.equal(9.99);
            expect(item.id).to.exist;
        });

        it('should create an item successfully with a null description', async () => {
            const item = await Item.create({
                name: 'Item without desc',
                description: null,
                price: 19.99
            });

            expect(item).to.exist;
            expect(item.name).to.equal('Item without desc');
            expect(item.description).to.be.null;
            expect(item.price).to.equal(19.99);
        });

        it('should treat empty string description as null (Sequelize default)', async () => {
            const item = await Item.create({
                name: 'Item empty desc',
                description: '',
                price: 29.99
            });

            expect(item).to.exist;
            expect(item.name).to.equal('Item empty desc');
            expect(item.description).to.be.null; // SQLite treats empty string as null by default for TEXT
            expect(item.price).to.equal(29.99);
        });
    });

    describe('Item Validations', () => {
        it('should throw an error if name is null', async () => {
            try {
                await Item.create({
                    name: null,
                    description: 'Some description',
                    price: 10.00
                });
                expect.fail('Expected SequelizeUniqueConstraintError was not thrown');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Item name cannot be empty.');
            }
        });

        it('should throw an error if name is an empty string', async () => {
            try {
                await Item.create({
                    name: '',
                    description: 'Some description',
                    price: 10.00
                });
                expect.fail('Expected SequelizeUniqueConstraintError was not thrown');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Item name cannot be empty.');
            }
        });

        it('should throw an error if name is too short', async () => {
            try {
                await Item.create({
                    name: 'A',
                    description: 'Some description',
                    price: 10.00
                });
                expect.fail('Expected SequelizeUniqueConstraintError was not thrown');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Item name must be between 2 and 100 characters.');
            }
        });

        it('should throw an error if name is too long', async () => {
            try {
                await Item.create({
                    name: 'A'.repeat(101), // 101 characters
                    description: 'Some description',
                    price: 10.00
                });
                expect.fail('Expected SequelizeUniqueConstraintError was not thrown');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Item name must be between 2 and 100 characters.');
            }
        });

        it('should throw an error if price is null', async () => {
            try {
                await Item.create({
                    name: 'Item Null Price',
                    description: 'Some description',
                    price: null
                });
                expect.fail('Expected SequelizeUniqueConstraintError was not thrown');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Price must be a valid decimal number.');
            }
        });

        it('should throw an error if price is zero', async () => {
            try {
                await Item.create({
                    name: 'Item Zero Price',
                    description: 'Some description',
                    price: 0
                });
                expect.fail('Expected SequelizeUniqueConstraintError was not thrown');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Price must be a positive number.');
            }
        });

        it('should throw an error if price is negative', async () => {
            try {
                await Item.create({
                    name: 'Item Negative Price',
                    description: 'Some description',
                    price: -5.00
                });
                expect.fail('Expected SequelizeUniqueConstraintError was not thrown');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Price must be a positive number.');
            }
        });

        it('should throw an error if price is not a number', async () => {
            try {
                await Item.create({
                    name: 'Item Invalid Price',
                    description: 'Some description',
                    price: 'abc'
                });
                expect.fail('Expected SequelizeUniqueConstraintError was not thrown');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Price must be a valid decimal number.');
            }
        });
    });

    describe('Item Update', () => {
        let itemToUpdate;

        beforeEach(async () => {
            itemToUpdate = await Item.create({
                name: 'Original Item',
                description: 'Original description',
                price: 15.00
            });
        });

        it('should update an item successfully', async () => {
            itemToUpdate.name = 'Updated Item';
            itemToUpdate.price = 25.50;
            await itemToUpdate.save();

            const updatedItem = await Item.findByPk(itemToUpdate.id);
            expect(updatedItem.name).to.equal('Updated Item');
            expect(updatedItem.price).to.equal(25.50);
        });

        it('should throw an error if updated name is null', async () => {
            itemToUpdate.name = null;
            try {
                await itemToUpdate.save();
                expect.fail('Expected validation error for null name');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Item name cannot be empty.');
            }
        });

        it('should throw an error if updated price is zero', async () => {
            itemToUpdate.price = 0;
            try {
                await itemToUpdate.save();
                expect.fail('Expected validation error for zero price');
            } catch (error) {
                expect(error.name).to.equal('SequelizeValidationError');
                expect(error.errors[0].message).to.equal('Price must be a positive number.');
            }
        });
    });
});
