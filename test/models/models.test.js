const { expect } = require('chai');
const { db, sequelize } = require('../utils/testApp');

describe('Unit Tests: Models', () => {
    
    before(async () => {
        await sequelize.sync({ force: true });
    });

    describe('Owner Model', () => {
        it('should create a valid owner', async () => {
            const owner = await db.Owner.create({
                firstName: 'John',
                lastName: 'Doe',
                address: '123 Lane',
                city: 'Test City',
                telephone: '1234567890'
            });
            expect(owner.firstName).to.equal('John');
            expect(owner.id).to.exist;
        });

        it('should fail if telephone is not numeric', async () => {
            try {
                await db.Owner.create({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    address: '123 Lane',
                    city: 'City',
                    telephone: 'abcdefghij'
                });
                throw new Error('Should have failed');
            } catch (err) {
                expect(err.name).to.equal('SequelizeValidationError');
                expect(err.message).to.contain('Telephone must be numeric');
            }
        });

        it('should fail if telephone is not 10 digits', async () => {
            try {
                await db.Owner.create({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    address: '123 Lane',
                    city: 'City',
                    telephone: '123'
                });
                throw new Error('Should have failed');
            } catch (err) {
                expect(err.name).to.equal('SequelizeValidationError');
            }
        });
    });

    describe('Vet Model', () => {
        it('should create a vet', async () => {
            const vet = await db.Vet.create({ firstName: 'Vet', lastName: 'Test' });
            expect(vet.lastName).to.equal('Test');
        });
    });
});
