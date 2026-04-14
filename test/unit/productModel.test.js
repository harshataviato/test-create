const { expect } = require('chai');
const db = require('../../config/db');
const Product = require('../../models/productModel');

describe('Product Model Unit Tests', () => {
    // Reset the database before each test to ensure test isolation
    beforeEach(() => {
        db.reset();
    });

    // Test for static method: Product.getAll()
    describe('Product.getAll()', () => {
        it('should retrieve all products from the database', async () => {
            const products = await Product.getAll();
            expect(products).to.be.an('array');
            expect(products).to.have.lengthOf(3); // Initial seeded products
            expect(products[0]).to.be.an.instanceOf(Product);
            expect(products[0].name).to.equal('Laptop');
        });

        it('should return an empty array if no products exist', async () => {
            db._setProducts([]); // Manually clear products for this test
            const products = await Product.getAll();
            expect(products).to.be.an('array').that.is.empty;
        });
    });

    // Test for static method: Product.getById()
    describe('Product.getById()', () => {
        it('should retrieve a product by its ID', async () => {
            const product = await Product.getById('1');
            expect(product).to.be.an.instanceOf(Product);
            expect(product.id).to.equal('1');
            expect(product.name).to.equal('Laptop');
        });

        it('should return null if the product ID does not exist', async () => {
            const product = await Product.getById('999');
            expect(product).to.be.null;
        });
    });

    // Test for instance method: product.save() (creating new product)
    describe('product.save() - Create', () => {
        it('should save a new product to the database', async () => {
            const newProductData = {
                name: 'Webcam',
                description: 'HD webcam for video calls',
                price: 49.99
            };
            const newProduct = new Product(null, newProductData.name, newProductData.description, newProductData.price);
            const savedProduct = await newProduct.save();

            expect(savedProduct).to.be.an.instanceOf(Product);
            expect(savedProduct.id).to.exist;
            expect(savedProduct.name).to.equal(newProductData.name);
            expect(savedProduct.description).to.equal(newProductData.description);
            expect(savedProduct.price).to.equal(newProductData.price);

            // Verify it's actually in the database
            const productInDb = await Product.getById(savedProduct.id);
            expect(productInDb.name).to.equal(newProductData.name);
            expect(db._getProducts()).to.have.lengthOf(4); // 3 initial + 1 new
        });

        it('should throw an error if name is missing when creating a new product', async () => {
            const newProduct = new Product(null, '', 'Description', 10.00);
            let error;
            try {
                await newProduct.save();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.include('Product name and a non-negative price are required.');
        });

        it('should throw an error if price is missing when creating a new product', async () => {
            const newProduct = new Product(null, 'Valid Name', 'Description', undefined);
            let error;
            try {
                await newProduct.save();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.include('Product name and a non-negative price are required.');
        });

        it('should throw an error if price is negative when creating a new product', async () => {
            const newProduct = new Product(null, 'Valid Name', 'Description', -10.00);
            let error;
            try {
                await newProduct.save();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.include('Product name and a non-negative price are required.');
        });
    });

    // Test for instance method: product.save() (updating existing product)
    describe('product.save() - Update', () => {
        it('should update an existing product in the database', async () => {
            const existingProduct = await Product.getById('1');
            existingProduct.name = 'Updated Laptop';
            existingProduct.price = 1300.00;
            existingProduct.description = 'Improved computing machine';

            const updatedProduct = await existingProduct.save();

            expect(updatedProduct).to.be.an.instanceOf(Product);
            expect(updatedProduct.id).to.equal('1');
            expect(updatedProduct.name).to.equal('Updated Laptop');
            expect(updatedProduct.price).to.equal(1300.00);

            // Verify it's actually updated in the database
            const productInDb = await Product.getById('1');
            expect(productInDb.name).to.equal('Updated Laptop');
            expect(productInDb.description).to.equal('Improved computing machine');
            expect(productInDb.price).to.equal(1300.00);
            expect(db._getProducts()).to.have.lengthOf(3); // Length should remain the same
        });

        it('should throw an error if the product to update is not found', async () => {
            const nonExistentProduct = new Product('999', 'Ghost Product', 'Does not exist', 0.01);
            let error;
            try {
                await nonExistentProduct.save();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.include('Product with ID 999 not found for update.');
        });

        it('should throw an error if name is cleared when updating a product', async () => {
            const existingProduct = await Product.getById('1');
            existingProduct.name = '';
            let error;
            try {
                await existingProduct.save();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.include('Product name and a non-negative price are required.');
        });

        it('should throw an error if price is set to negative when updating a product', async () => {
            const existingProduct = await Product.getById('1');
            existingProduct.price = -50.00;
            let error;
            try {
                await existingProduct.save();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.include('Product name and a non-negative price are required.');
        });
    });

    // Test for static method: Product.deleteById()
    describe('Product.deleteById()', () => {
        it('should delete a product by its ID', async () => {
            const isDeleted = await Product.deleteById('1');
            expect(isDeleted).to.be.true;

            // Verify it's no longer in the database
            const productInDb = await Product.getById('1');
            expect(productInDb).to.be.null;
            expect(db._getProducts()).to.have.lengthOf(2);
        });

        it('should return false if the product ID to delete does not exist', async () => {
            const isDeleted = await Product.deleteById('999');
            expect(isDeleted).to.be.false;
            expect(db._getProducts()).to.have.lengthOf(3); // No change in length
        });
    });
});
