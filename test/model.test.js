/**
 * @file Tests for the Product Mongoose model.
 * Verifies schema definitions, validations, and default values.
 */

const { expect } = require('chai');
const mongoose = require('mongoose');
const Product = require('../models/product'); // Import the Product model

describe('Product Model', () => {
  // No need to connect/disconnect here, handled by global setup.js
  // beforeEach will clear the collection.

  it('should create a valid product with all required fields', async () => {
    const productData = {
      name: 'Test Product',
      description: 'A description of the test product.',
      price: 9.99,
      quantity: 10
    };
    const product = new Product(productData);
    const savedProduct = await product.save();

    expect(savedProduct._id).to.exist;
    expect(savedProduct.name).to.equal(productData.name);
    expect(savedProduct.description).to.equal(productData.description);
    expect(savedProduct.price).to.equal(productData.price);
    expect(savedProduct.quantity).to.equal(productData.quantity);
    expect(savedProduct.createdAt).to.exist;
    expect(savedProduct.updatedAt).to.exist;
  });

  it('should create a valid product with optional description omitted', async () => {
    const productData = {
      name: 'Product Without Desc',
      price: 15.00,
      quantity: 5
    };
    const product = new Product(productData);
    const savedProduct = await product.save();

    expect(savedProduct._id).to.exist;
    expect(savedProduct.name).to.equal(productData.name);
    expect(savedProduct.description).to.be.empty; // description field exists but is empty string
    expect(savedProduct.price).to.equal(productData.price);
    expect(savedProduct.quantity).to.equal(productData.quantity);
  });

  it('should trim name and description fields', async () => {
    const productData = {
      name: '   Trimmed Name   ',
      description: '   Trimmed Description   ',
      price: 10.00,
      quantity: 1
    };
    const product = new Product(productData);
    const savedProduct = await product.save();

    expect(savedProduct.name).to.equal('Trimmed Name');
    expect(savedProduct.description).to.equal('Trimmed Description');
  });

  it('should default quantity to 0 if not provided', async () => {
    const productData = {
      name: 'Default Quantity Product',
      price: 20.00
      // quantity is omitted
    };
    const product = new Product(productData);
    const savedProduct = await product.save();

    expect(savedProduct.quantity).to.equal(0);
  });

  it('should require a product name', async () => {
    const productData = {
      // name: 'Missing Name',
      price: 10.00,
      quantity: 1
    };
    const product = new Product(productData);
    try {
      await product.save();
      expect.fail('Product should not be saved without a name');
    } catch (error) {
      expect(error.errors.name).to.exist;
      expect(error.errors.name.message).to.equal('Product name is required');
    }
  });

  it('should require a product price', async () => {
    const productData = {
      name: 'Missing Price',
      // price: 10.00,
      quantity: 1
    };
    const product = new Product(productData);
    try {
      await product.save();
      expect.fail('Product should not be saved without a price');
    } catch (error) {
      expect(error.errors.price).to.exist;
      expect(error.errors.price.message).to.equal('Product price is required');
    }
  });

  it('should require a product quantity', async () => {
    const productData = {
      name: 'Missing Quantity',
      price: 10.00
      // quantity: 1
    };
    const product = new Product(productData);
    try {
      await product.save();
      expect.fail('Product should not be saved without a quantity');
    } catch (error) {
      expect(error.errors.quantity).to.exist;
      expect(error.errors.quantity.message).to.equal('Product quantity is required');
    }
  });


  it('should enforce minimum length for product name', async () => {
    const productData = {
      name: 'ab', // Too short
      price: 10.00,
      quantity: 1
    };
    const product = new Product(productData);
    try {
      await product.save();
      expect.fail('Product name should be at least 3 characters long');
    } catch (error) {
      expect(error.errors.name).to.exist;
      expect(error.errors.name.message).to.equal('Product name must be at least 3 characters long');
    }
  });

  it('should not allow negative price', async () => {
    const productData = {
      name: 'Negative Price Product',
      price: -5.00,
      quantity: 10
    };
    const product = new Product(productData);
    try {
      await product.save();
      expect.fail('Product should not be saved with a negative price');
    } catch (error) {
      expect(error.errors.price).to.exist;
      expect(error.errors.price.message).to.equal('Product price cannot be negative');
    }
  });

  it('should not allow negative quantity', async () => {
    const productData = {
      name: 'Negative Quantity Product',
      price: 10.00,
      quantity: -2
    };
    const product = new Product(productData);
    try {
      await product.save();
      expect.fail('Product should not be saved with a negative quantity');
    } catch (error) {
      expect(error.errors.quantity).to.exist;
      expect(error.errors.quantity.message).to.equal('Product quantity cannot be negative');
    }
  });

  it('should enforce maximum length for description', async () => {
    const longDescription = 'a'.repeat(501); // 501 characters
    const productData = {
      name: 'Long Description Product',
      description: longDescription,
      price: 10.00,
      quantity: 1
    };
    const product = new Product(productData);
    try {
      await product.save();
      expect.fail('Product description should not exceed 500 characters');
    } catch (error) {
      expect(error.errors.description).to.exist;
      expect(error.errors.description.message).to.equal('Product description cannot exceed 500 characters');
    }
  });

  it('should auto-generate createdAt and updatedAt timestamps', async () => {
    const productData = {
      name: 'Timestamp Product',
      price: 25.00,
      quantity: 3
    };
    const product = new Product(productData);
    const savedProduct = await product.save();

    expect(savedProduct.createdAt).to.be.an.instanceOf(Date);
    expect(savedProduct.updatedAt).to.be.an.instanceOf(Date);
    expect(savedProduct.createdAt).to.not.be.null;
    expect(savedProduct.updatedAt).to.not.be.null;
    expect(savedProduct.createdAt.getTime()).to.be.closeTo(Date.now(), 2000); // within 2 seconds
    expect(savedProduct.updatedAt.getTime()).to.be.closeTo(Date.now(), 2000); // within 2 seconds

    // Test that updatedAt changes on subsequent save
    savedProduct.name = 'Updated Timestamp Product';
    const updatedProduct = await savedProduct.save();
    expect(updatedProduct.updatedAt.getTime()).to.be.greaterThan(savedProduct.createdAt.getTime());
  });
});
