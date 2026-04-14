const { expect } = require('chai');
const sinon = require('sinon');
const productService = require('../../services/productService');
const Product = require('../../models/productModel');

describe('Product Service Unit Tests', () => {
    let sandbox;

    beforeEach(() => {
        // Create a sandbox for stubs to ensure isolation between tests
        sandbox = sinon.createSandbox();

        // Stub Product model methods to control their behavior
        // Mocks for Product.getAll
        sandbox.stub(Product, 'getAll').resolves([
            new Product('1', 'Laptop', 'Powerful computing machine', 1200.00),
            new Product('2', 'Mouse', 'Ergonomic wireless mouse', 25.00)
        ]);

        // Mocks for Product.getById
        sandbox.stub(Product, 'getById').callsFake(async (id) => {
            if (id === '1') return new Product('1', 'Laptop', 'Powerful computing machine', 1200.00);
            if (id === '2') return new Product('2', 'Mouse', 'Ergonomic wireless mouse', 25.00);
            return null;
        });

        // Mocks for Product.deleteById
        sandbox.stub(Product, 'deleteById').callsFake(async (id) => {
            return id === '1'; // Simulate successful deletion for ID '1' only
        });

        // Mocks for Product.prototype.save (for create and update)
        // This stub will replace the actual save logic for Product instances
        sandbox.stub(Product.prototype, 'save').callsFake(async function() {
            if (!this.name || this.name.trim() === '' || this.price === undefined || this.price < 0) {
                throw new Error('Product name and a non-negative price are required.');
            }
            if (!this.id) {
                // Simulate new product creation with an ID
                this.id = 'newId';
            }
            return this;
        });
    });

    afterEach(() => {
        // Restore all stubs created in the sandbox after each test
        sandbox.restore();
    });

    // Test for getAllProducts service method
    describe('getAllProducts()', () => {
        it('should return an array of products', async () => {
            const products = await productService.getAllProducts();
            expect(products).to.be.an('array').with.lengthOf(2);
            expect(products[0].name).to.equal('Laptop');
            expect(Product.getAll.calledOnce).to.be.true; // Verify model method was called
        });

        it('should return an empty array if no products are found', async () => {
            Product.getAll.resolves([]); // Override stub for this specific test
            const products = await productService.getAllProducts();
            expect(products).to.be.an('array').that.is.empty;
            expect(Product.getAll.calledOnce).to.be.true;
        });

        it('should handle errors from the model gracefully', async () => {
            const errorMessage = 'Database connection error';
            Product.getAll.throws(new Error(errorMessage)); // Make model throw an error

            let error;
            try {
                await productService.getAllProducts();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.equal(errorMessage);
            expect(Product.getAll.calledOnce).to.be.true;
        });
    });

    // Test for getProductById service method
    describe('getProductById()', () => {
        it('should return a product if found', async () => {
            const product = await productService.getProductById('1');
            expect(product).to.be.an.instanceOf(Product);
            expect(product.id).to.equal('1');
            expect(Product.getById.calledWith('1')).to.be.true;
        });

        it('should return null if product is not found', async () => {
            const product = await productService.getProductById('999');
            expect(product).to.be.null;
            expect(Product.getById.calledWith('999')).to.be.true;
        });
    });

    // Test for createProduct service method
    describe('createProduct()', () => {
        it('should create and return a new product with valid data', async () => {
            const productData = { name: 'New Item', description: 'A brand new product', price: 99.99 };
            const product = await productService.createProduct(productData);

            expect(product).to.be.an.instanceOf(Product);
            expect(product.id).to.equal('newId'); // Based on our stub
            expect(product.name).to.equal('New Item');
            expect(product.description).to.equal('A brand new product');
            expect(product.price).to.equal(99.99);
            expect(Product.prototype.save.calledOnce).to.be.true; // Verify save was called
        });

        it('should throw an error if product name is empty', async () => {
            const productData = { name: '', description: 'Empty name', price: 10.00 };
            let error;
            try {
                await productService.createProduct(productData);
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.equal('Product name cannot be empty.');
            expect(Product.prototype.save.notCalled).to.be.true; // Should not attempt to save
        });

        it('should throw an error if product name is only whitespace', async () => {
            const productData = { name: '   ', description: 'Whitespace name', price: 10.00 };
            let error;
            try {
                await productService.createProduct(productData);
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.equal('Product name cannot be empty.');
            expect(Product.prototype.save.notCalled).to.be.true;
        });

        it('should throw an error if price is invalid (NaN)', async () => {
            const productData = { name: 'Item', description: 'Invalid price', price: 'abc' };
            let error;
            try {
                await productService.createProduct(productData);
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.equal('Price must be a non-negative number.');
            expect(Product.prototype.save.notCalled).to.be.true;
        });

        it('should throw an error if price is negative', async () => {
            const productData = { name: 'Item', description: 'Negative price', price: -5.00 };
            let error;
            try {
                await productService.createProduct(productData);
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.equal('Price must be a non-negative number.');
            expect(Product.prototype.save.notCalled).to.be.true;
        });
    });

    // Test for updateProduct service method
    describe('updateProduct()', () => {
        it('should update and return an existing product with valid data', async () => {
            const updateData = { name: 'Updated Laptop', description: 'Better Laptop', price: 1300.00 };
            const updatedProduct = await productService.updateProduct('1', updateData);

            expect(updatedProduct).to.be.an.instanceOf(Product);
            expect(updatedProduct.id).to.equal('1');
            expect(updatedProduct.name).to.equal('Updated Laptop');
            expect(updatedProduct.description).to.equal('Better Laptop');
            expect(updatedProduct.price).to.equal(1300.00);
            expect(Product.getById.calledWith('1')).to.be.true;
            expect(Product.prototype.save.calledOnce).to.be.true;
        });

        it('should return null if product to update is not found', async () => {
            const updateData = { name: 'Non Existent', price: 100.00 };
            const updatedProduct = await productService.updateProduct('999', updateData);
            expect(updatedProduct).to.be.null;
            expect(Product.getById.calledWith('999')).to.be.true;
            expect(Product.prototype.save.notCalled).to.be.true;
        });

        it('should throw an error if updated name is empty', async () => {
            const updateData = { name: '' };
            let error;
            try {
                await productService.updateProduct('1', updateData);
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.equal('Product name cannot be empty.');
            expect(Product.getById.calledOnce).to.be.true;
            expect(Product.prototype.save.notCalled).to.be.true;
        });

        it('should throw an error if updated price is invalid (NaN)', async () => {
            const updateData = { price: 'invalid' };
            let error;
            try {
                await productService.updateProduct('1', updateData);
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.equal('Price must be a non-negative number.');
            expect(Product.getById.calledOnce).to.be.true;
            expect(Product.prototype.save.notCalled).to.be.true;
        });

        it('should throw an error if updated price is negative', async () => {
            const updateData = { price: -10.00 };
            let error;
            try {
                await productService.updateProduct('1', updateData);
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.equal('Price must be a non-negative number.');
            expect(Product.getById.calledOnce).to.be.true;
            expect(Product.prototype.save.notCalled).to.be.true;
        });

        it('should not update fields if undefined (partial update)', async () => {
            const updateData = { description: 'Only description updated' };
            const productBefore = await productService.getProductById('1'); // Get original for comparison
            Product.getById.restore(); // Restore getById to get actual product instance initially
            sandbox.stub(Product, 'getById').callsFake(async (id) => {
                if (id === '1') return new Product('1', 'Laptop', 'Powerful computing machine', 1200.00);
                return null;
            });

            const updatedProduct = await productService.updateProduct('1', updateData);

            expect(updatedProduct).to.be.an.instanceOf(Product);
            expect(updatedProduct.id).to.equal('1');
            expect(updatedProduct.name).to.equal('Laptop'); // Name should be unchanged
            expect(updatedProduct.description).to.equal('Only description updated');
            expect(updatedProduct.price).to.equal(1200.00); // Price should be unchanged
            expect(Product.getById.calledWith('1')).to.be.true;
            expect(Product.prototype.save.calledOnce).to.be.true;
        });
    });

    // Test for deleteProduct service method
    describe('deleteProduct()', () => {
        it('should delete a product if found', async () => {
            const isDeleted = await productService.deleteProduct('1');
            expect(isDeleted).to.be.true;
            expect(Product.deleteById.calledWith('1')).to.be.true;
        });

        it('should return false if product to delete is not found', async () => {
            const isDeleted = await productService.deleteProduct('999');
            expect(isDeleted).to.be.false;
            expect(Product.deleteById.calledWith('999')).to.be.true;
        });

        it('should handle errors from the model gracefully', async () => {
            const errorMessage = 'Deletion forbidden';
            Product.deleteById.throws(new Error(errorMessage)); // Make model throw an error

            let error;
            try {
                await productService.deleteProduct('1');
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('error');
            expect(error.message).to.equal(errorMessage);
            expect(Product.deleteById.calledOnce).to.be.true;
        });
    });
});
