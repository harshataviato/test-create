const { expect } = require('chai');
const sinon = require('sinon');
const productController = require('../../controllers/productController');
const productService = require('../../services/productService');

describe('Product Controller Unit Tests', () => {
    let sandbox;
    let req, res, next;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock req, res, next objects
        req = {
            params: {},
            body: {}
        };
        res = {
            render: sandbox.stub(),
            redirect: sandbox.stub(),
            status: sandbox.stub().returnsThis(), // Allows chaining like res.status(XXX).render(...)
            send: sandbox.stub()
        };
        next = sandbox.stub();

        // Stub all productService methods
        sandbox.stub(productService, 'getAllProducts');
        sandbox.stub(productService, 'getProductById');
        sandbox.stub(productService, 'createProduct');
        sandbox.stub(productService, 'updateProduct');
        sandbox.stub(productService, 'deleteProduct');
    });

    afterEach(() => {
        sandbox.restore();
    });

    // Test for getAllProducts controller function
    describe('getAllProducts', () => {
        it('should render the list view with all products', async () => {
            const products = [{ id: '1', name: 'Test Product' }];
            productService.getAllProducts.resolves(products);

            await productController.getAllProducts(req, res);

            expect(productService.getAllProducts.calledOnce).to.be.true;
            expect(res.render.calledOnceWith('products/list', { products, title: 'Product List' })).to.be.true;
            expect(res.status.notCalled).to.be.true; // Should not set status for success
        });

        it('should render an error view if fetching products fails', async () => {
            const errorMessage = 'Failed to fetch';
            productService.getAllProducts.throws(new Error(errorMessage));

            await productController.getAllProducts(req, res);

            expect(productService.getAllProducts.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.render.calledOnceWith('error', { message: 'Failed to load products.' })).to.be.true;
        });
    });

    // Test for getProductById controller function
    describe('getProductById', () => {
        it('should render the detail view with the product if found', async () => {
            req.params.id = '1';
            const product = { id: '1', name: 'Test Product', description: 'desc', price: 100 };
            productService.getProductById.resolves(product);

            await productController.getProductById(req, res);

            expect(productService.getProductById.calledOnceWith('1')).to.be.true;
            expect(res.render.calledOnceWith('products/detail', { product, title: 'Product: Test Product' })).to.be.true;
            expect(res.status.notCalled).to.be.true;
        });

        it('should render a 404 error view if product is not found', async () => {
            req.params.id = '999';
            productService.getProductById.resolves(null);

            await productController.getProductById(req, res);

            expect(productService.getProductById.calledOnceWith('999')).to.be.true;
            expect(res.status.calledWith(404)).to.be.true;
            expect(res.render.calledOnceWith('error', { message: 'Product not found.' })).to.be.true;
        });

        it('should render a 500 error view if fetching product details fails', async () => {
            req.params.id = '1';
            productService.getProductById.throws(new Error('DB error'));

            await productController.getProductById(req, res);

            expect(productService.getProductById.calledOnceWith('1')).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.render.calledOnceWith('error', { message: 'Failed to load product details.' })).to.be.true;
        });
    });

    // Test for showCreateForm controller function
    describe('showCreateForm', () => {
        it('should render the create form', () => {
            productController.showCreateForm(req, res);

            expect(res.render.calledOnceWith('products/create', { title: 'Create New Product', product: {} })).to.be.true;
            expect(res.status.notCalled).to.be.true;
        });
    });

    // Test for createProduct controller function
    describe('createProduct', () => {
        it('should create a product and redirect to product list on success', async () => {
            req.body = { name: 'New Product', description: 'Desc', price: 10.00 };
            productService.createProduct.resolves({}); // Service doesn't necessarily return the product to controller

            await productController.createProduct(req, res);

            expect(productService.createProduct.calledOnceWith(req.body)).to.be.true;
            expect(res.redirect.calledOnceWith('/products')).to.be.true;
            expect(res.render.notCalled).to.be.true;
        });

        it('should render the create form with errors if product creation fails', async () => {
            req.body = { name: '', description: 'Invalid product', price: 10.00 }; // Invalid name
            const validationError = new Error('Product name cannot be empty.');
            productService.createProduct.throws(validationError);

            await productController.createProduct(req, res);

            expect(productService.createProduct.calledOnceWith(req.body)).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(res.render.calledOnceWith('products/create', {
                title: 'Create New Product',
                product: req.body,
                error: validationError.message
            })).to.be.true;
            expect(res.redirect.notCalled).to.be.true;
        });

        it('should render the create form with generic error message on unexpected failure', async () => {
            req.body = { name: 'Valid', description: 'Valid', price: 10.00 };
            const unexpectedError = new Error('Unexpected service error.');
            productService.createProduct.throws(unexpectedError);

            await productController.createProduct(req, res);

            expect(productService.createProduct.calledOnceWith(req.body)).to.be.true;
            expect(res.status.calledWith(400)).to.be.true; // Controller maps all service errors to 400 for 'create'
            expect(res.render.calledOnceWith('products/create', {
                title: 'Create New Product',
                product: req.body,
                error: unexpectedError.message
            })).to.be.true;
        });
    });

    // Test for updateProduct controller function
    describe('updateProduct', () => {
        it('should update a product and redirect to product detail on success', async () => {
            req.params.id = '1';
            req.body = { name: 'Updated Product', description: 'Updated Desc', price: 15.00 };
            const updatedProduct = { id: '1', name: 'Updated Product', description: 'Updated Desc', price: 15.00 };
            productService.updateProduct.resolves(updatedProduct);

            await productController.updateProduct(req, res);

            expect(productService.updateProduct.calledOnceWith('1', req.body)).to.be.true;
            expect(res.redirect.calledOnceWith('/products/1')).to.be.true;
            expect(res.render.notCalled).to.be.true;
        });

        it('should render a 404 error if product to update is not found', async () => {
            req.params.id = '999';
            req.body = { name: 'Non Existent' };
            productService.updateProduct.resolves(null);

            await productController.updateProduct(req, res);

            expect(productService.updateProduct.calledOnceWith('999', req.body)).to.be.true;
            expect(res.status.calledWith(404)).to.be.true;
            expect(res.render.calledOnceWith('error', { message: 'Product not found for update.' })).to.be.true;
            expect(res.redirect.notCalled).to.be.true;
        });

        it('should render a 400 error view if product update fails due to validation', async () => {
            req.params.id = '1';
            req.body = { name: '' }; // Invalid update
            const validationError = new Error('Product name cannot be empty.');
            productService.updateProduct.throws(validationError);

            await productController.updateProduct(req, res);

            expect(productService.updateProduct.calledOnceWith('1', req.body)).to.be.true;
            expect(res.status.calledWith(400)).to.be.true;
            expect(res.render.calledOnceWith('error', { message: `Failed to update product: ${validationError.message}` })).to.be.true;
            expect(res.redirect.notCalled).to.be.true;
        });

        it('should render a 500 error view on unexpected update failure', async () => {
            req.params.id = '1';
            req.body = { name: 'Valid update' };
            const unexpectedError = new Error('Unexpected service error.');
            productService.updateProduct.throws(unexpectedError);

            await productController.updateProduct(req, res);

            expect(productService.updateProduct.calledOnceWith('1', req.body)).to.be.true;
            expect(res.status.calledWith(400)).to.be.true; // Controller catches general errors and sends 400/500
            expect(res.render.calledOnceWith('error', { message: `Failed to update product: ${unexpectedError.message}` })).to.be.true;
        });
    });

    // Test for deleteProduct controller function
    describe('deleteProduct', () => {
        it('should delete a product and redirect to product list on success', async () => {
            req.params.id = '1';
            productService.deleteProduct.resolves(true);

            await productController.deleteProduct(req, res);

            expect(productService.deleteProduct.calledOnceWith('1')).to.be.true;
            expect(res.redirect.calledOnceWith('/products')).to.be.true;
            expect(res.render.notCalled).to.be.true;
        });

        it('should render a 404 error if product to delete is not found', async () => {
            req.params.id = '999';
            productService.deleteProduct.resolves(false);

            await productController.deleteProduct(req, res);

            expect(productService.deleteProduct.calledOnceWith('999')).to.be.true;
            expect(res.status.calledWith(404)).to.be.true;
            expect(res.render.calledOnceWith('error', { message: 'Product not found for deletion.' })).to.be.true;
            expect(res.redirect.notCalled).to.be.true;
        });

        it('should render a 500 error view on unexpected deletion failure', async () => {
            req.params.id = '1';
            productService.deleteProduct.throws(new Error('DB error'));

            await productController.deleteProduct(req, res);

            expect(productService.deleteProduct.calledOnceWith('1')).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.render.calledOnceWith('error', { message: 'Failed to delete product.' })).to.be.true;
            expect(res.redirect.notCalled).to.be.true;
        });
    });
});
