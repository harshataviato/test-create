/**
 * @file Unit tests for the productController.js.
 * Mocks the Mongoose Product model to test controller logic in isolation.
 */

const { expect } = require('chai');
const sinon = require('sinon');
const productController = require('../controllers/productController');
const Product = require('../models/product'); // Actual Product model to mock

describe('Product Controller Unit Tests', () => {
  let req, res, next;
  let ProductStub;

  beforeEach(() => {
    // Reset mocks before each test
    req = {
      body: {},
      params: {}
    };
    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
      status: sinon.stub().returnsThis() // Allows chaining .status().render()
    };
    next = sinon.stub();

    // Stub the entire Product model, or specific methods
    ProductStub = sinon.stub(Product);
  });

  afterEach(() => {
    // Restore the original methods after each test
    sinon.restore();
  });

  describe('getNewProductForm', () => {
    it('should render the products/new view', () => {
      productController.getNewProductForm(req, res);
      expect(res.render.calledOnceWith('products/new', { title: 'Create New Product' })).to.be.true;
    });
  });

  describe('createProduct', () => {
    it('should create a product and redirect to /products on success', async () => {
      const newProductData = { name: 'New Product', price: 10, quantity: 5 };
      req.body = newProductData;

      // Mock the Product constructor and its save method
      const saveStub = sinon.stub().resolves({ _id: 'mockId', ...newProductData });
      ProductStub.returns({ save: saveStub });

      await productController.createProduct(req, res);

      expect(ProductStub.calledWith(newProductData)).to.be.true;
      expect(saveStub.calledOnce).to.be.true;
      expect(res.redirect.calledOnceWith('/products')).to.be.true;
      expect(res.render.notCalled).to.be.true;
    });

    it('should re-render the form with error on validation failure', async () => {
      const invalidProductData = { name: 'Ab', price: -1, quantity: 5 }; // Invalid name (too short) and price
      req.body = invalidProductData;

      const mockError = new Error('Validation failed');
      mockError.message = 'Validation Error: Product name must be at least 3 characters long';
      const saveStub = sinon.stub().rejects(mockError);
      ProductStub.returns({ save: saveStub });

      await productController.createProduct(req, res);

      expect(ProductStub.calledWith(invalidProductData)).to.be.true;
      expect(saveStub.calledOnce).to.be.true;
      expect(res.render.calledOnceWith('products/new', {
        title: 'Create New Product',
        error: mockError.message // The controller passes error.message
      })).to.be.true;
      expect(res.redirect.notCalled).to.be.true;
    });

    it('should handle general errors during product creation', async () => {
      req.body = { name: 'Valid Product', price: 10, quantity: 5 };
      const mockError = new Error('Database connection failed');
      const saveStub = sinon.stub().rejects(mockError);
      ProductStub.returns({ save: saveStub });

      await productController.createProduct(req, res);

      expect(res.render.calledOnceWith('products/new', {
        title: 'Create New Product',
        error: mockError.message
      })).to.be.true;
    });
  });

  describe('getAllProducts', () => {
    it('should fetch and render all products', async () => {
      const mockProducts = [{ name: 'Product A' }, { name: 'Product B' }];
      ProductStub.find.resolves(mockProducts);

      await productController.getAllProducts(req, res);

      expect(ProductStub.find.calledOnceWith({})).to.be.true;
      expect(res.render.calledOnceWith('products/index', { title: 'All Products', products: mockProducts })).to.be.true;
    });

    it('should render an error page if fetching products fails', async () => {
      const mockError = new Error('DB error');
      ProductStub.find.rejects(mockError);

      await productController.getAllProducts(req, res);

      expect(ProductStub.find.calledOnce).to.be.true;
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.render.calledOnceWith('error', {
        title: 'Error',
        message: 'Failed to retrieve products',
        error: mockError
      })).to.be.true;
    });
  });

  describe('getProductById', () => {
    it('should fetch and render a single product by ID', async () => {
      const productId = '60c72b2f9b1e8a001c8e4d1e';
      const mockProduct = { _id: productId, name: 'Single Product' };
      req.params.id = productId;
      ProductStub.findById.resolves(mockProduct);

      await productController.getProductById(req, res);

      expect(ProductStub.findById.calledOnceWith(productId)).to.be.true;
      expect(res.render.calledOnceWith('products/show', { title: mockProduct.name, product: mockProduct })).to.be.true;
    });

    it('should render 404 error if product not found', async () => {
      req.params.id = 'nonExistentId';
      ProductStub.findById.resolves(null); // Product not found

      await productController.getProductById(req, res);

      expect(ProductStub.findById.calledOnceWith('nonExistentId')).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', {
        title: 'Product Not Found',
        message: 'The product you requested does not exist.'
      })).to.be.true;
    });

    it('should render 500 error if ID format is invalid', async () => {
      req.params.id = 'invalidIdFormat';
      const mockError = new mongoose.Error.CastError('Cast to ObjectId failed', 'ObjectId', 'invalidIdFormat');
      ProductStub.findById.rejects(mockError); // Simulate Mongoose CastError

      await productController.getProductById(req, res);

      expect(ProductStub.findById.calledOnceWith('invalidIdFormat')).to.be.true;
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.render.calledOnceWith('error', {
        title: 'Error',
        message: 'Failed to retrieve product',
        error: mockError
      })).to.be.true;
    });
  });

  describe('getEditProductForm', () => {
    it('should fetch and render the edit form for a product by ID', async () => {
      const productId = '60c72b2f9b1e8a001c8e4d1f';
      const mockProduct = { _id: productId, name: 'Product to Edit', price: 20, quantity: 2 };
      req.params.id = productId;
      ProductStub.findById.resolves(mockProduct);

      await productController.getEditProductForm(req, res);

      expect(ProductStub.findById.calledOnceWith(productId)).to.be.true;
      expect(res.render.calledOnceWith('products/edit', { title: `Edit ${mockProduct.name}`, product: mockProduct })).to.be.true;
    });

    it('should render 404 error if product for edit not found', async () => {
      req.params.id = 'nonExistentId';
      ProductStub.findById.resolves(null);

      await productController.getEditProductForm(req, res);

      expect(ProductStub.findById.calledOnceWith('nonExistentId')).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', {
        title: 'Product Not Found',
        message: 'The product you are trying to edit does not exist.'
      })).to.be.true;
    });

    it('should render 500 error if ID format is invalid for edit form', async () => {
      req.params.id = 'invalidIdFormat';
      const mockError = new mongoose.Error.CastError('Cast to ObjectId failed', 'ObjectId', 'invalidIdFormat');
      ProductStub.findById.rejects(mockError);

      await productController.getEditProductForm(req, res);

      expect(ProductStub.findById.calledOnceWith('invalidIdFormat')).to.be.true;
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.render.calledOnceWith('error', {
        title: 'Error',
        message: 'Failed to load edit form',
        error: mockError
      })).to.be.true;
    });
  });

  describe('updateProduct', () => {
    it('should update a product and redirect to its show page on success', async () => {
      const productId = '60c72b2f9b1e8a001c8e4d20';
      const updatedProductData = { name: 'Updated Product', price: 12.50, quantity: 8 };
      const mockProduct = { _id: productId, ...updatedProductData, createdAt: new Date(), updatedAt: new Date() };

      req.params.id = productId;
      req.body = updatedProductData;

      ProductStub.findByIdAndUpdate.resolves(mockProduct); // Simulate successful update

      await productController.updateProduct(req, res);

      expect(ProductStub.findByIdAndUpdate.calledOnceWith(
        productId,
        updatedProductData,
        { new: true, runValidators: true }
      )).to.be.true;
      expect(res.redirect.calledOnceWith(`/products/${productId}`)).to.be.true;
    });

    it('should render edit form with error on validation failure during update', async () => {
      const productId = '60c72b2f9b1e8a001c8e4d21';
      const invalidUpdateData = { name: 'S', price: -5, quantity: 1 }; // Invalid name and price
      const originalProduct = { _id: productId, name: 'Original', price: 10, quantity: 5 };

      req.params.id = productId;
      req.body = invalidUpdateData;

      const mockError = new Error('Validation failed');
      mockError.message = 'Validation Error: Product name must be at least 3 characters long';
      ProductStub.findByIdAndUpdate.rejects(mockError); // Simulate validation error
      ProductStub.findById.resolves(originalProduct); // For re-rendering the form

      await productController.updateProduct(req, res);

      expect(ProductStub.findByIdAndUpdate.calledOnce).to.be.true;
      expect(ProductStub.findById.calledOnceWith(productId)).to.be.true; // Should re-fetch original product
      expect(res.render.calledOnceWith('products/edit', {
        title: `Edit ${originalProduct.name}`,
        product: originalProduct,
        error: mockError.message
      })).to.be.true;
    });

    it('should render 404 error if product for update not found', async () => {
      req.params.id = 'nonExistentId';
      req.body = { name: 'Update', price: 10, quantity: 1 };
      ProductStub.findByIdAndUpdate.resolves(null); // Product not found

      await productController.updateProduct(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', {
        title: 'Product Not Found',
        message: 'The product you are trying to update does not exist.'
      })).to.be.true;
    });

    it('should render 500 error if ID format is invalid for update', async () => {
      req.params.id = 'invalidIdFormat';
      req.body = { name: 'Update', price: 10, quantity: 1 };
      const mockError = new mongoose.Error.CastError('Cast to ObjectId failed', 'ObjectId', 'invalidIdFormat');
      ProductStub.findByIdAndUpdate.rejects(mockError); // Simulate Mongoose CastError

      // To handle the re-render path, we also need to mock findById
      ProductStub.findById.resolves(null); // Or mock with a valid product if testing that specific path

      await productController.updateProduct(req, res);

      // The controller attempts to findById to render the edit form again with error
      // if findByIdAndUpdate fails. If the findById also fails or returns null,
      // it should still show the error message.
      expect(ProductStub.findByIdAndUpdate.calledOnceWith('invalidIdFormat', req.body, { new: true, runValidators: true })).to.be.true;
      expect(ProductStub.findById.calledOnceWith('invalidIdFormat')).to.be.true;
      expect(res.render.calledOnceWithMatch('products/edit', {
        title: sinon.match.any,
        product: null, // Because findById also returned null
        error: mockError.message
      })).to.be.true;
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and redirect to /products on success', async () => {
      const productId = '60c72b2f9b1e8a001c8e4d22';
      req.params.id = productId;
      ProductStub.findByIdAndDelete.resolves({ _id: productId }); // Simulate successful deletion

      await productController.deleteProduct(req, res);

      expect(ProductStub.findByIdAndDelete.calledOnceWith(productId)).to.be.true;
      expect(res.redirect.calledOnceWith('/products')).to.be.true;
    });

    it('should render 404 error if product for deletion not found', async () => {
      req.params.id = 'nonExistentId';
      ProductStub.findByIdAndDelete.resolves(null); // Product not found

      await productController.deleteProduct(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.render.calledOnceWith('error', {
        title: 'Product Not Found',
        message: 'The product you are trying to delete does not exist.'
      })).to.be.true;
    });

    it('should render 500 error if ID format is invalid for deletion', async () => {
      req.params.id = 'invalidIdFormat';
      const mockError = new mongoose.Error.CastError('Cast to ObjectId failed', 'ObjectId', 'invalidIdFormat');
      ProductStub.findByIdAndDelete.rejects(mockError); // Simulate Mongoose CastError

      await productController.deleteProduct(req, res);

      expect(ProductStub.findByIdAndDelete.calledOnceWith('invalidIdFormat')).to.be.true;
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.render.calledOnceWith('error', {
        title: 'Error',
        message: 'Failed to delete product',
        error: mockError
      })).to.be.true;
    });
  });
});
