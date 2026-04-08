const { expect } = require('chai');
const db = require('../../config/db');

describe('In-Memory Database (db.js)', () => {
  // Clear the database before each test to ensure isolation
  beforeEach(() => {
    db.clearProducts();
  });

  // Test case 1: saveProduct should store a product and assign an ID and createdAt
  it('should save a new product and assign a unique ID and createdAt timestamp', () => {
    const productData = { name: 'Laptop', description: 'Powerful laptop', price: 1200.00 };
    const savedProduct = db.saveProduct(productData);

    expect(savedProduct).to.have.property('id').that.is.a('string');
    expect(savedProduct).to.have.property('createdAt').that.is.an.instanceOf(Date);
    expect(savedProduct.name).to.equal(productData.name);
    expect(savedProduct.description).to.equal(productData.description);
    expect(savedProduct.price).to.equal(productData.price);

    const products = db.getProducts();
    expect(products).to.have.lengthOf(1);
    expect(products[0].id).to.equal(savedProduct.id);
  });

  // Test case 2: saveProduct should assign sequential unique IDs
  it('should assign sequential unique IDs to new products', () => {
    const product1 = db.saveProduct({ name: 'Product A', description: 'Desc A', price: 10 });
    const product2 = db.saveProduct({ name: 'Product B', description: 'Desc B', price: 20 });

    expect(product1.id).to.equal('1');
    expect(product2.id).to.equal('2');
    expect(db.getProducts()).to.have.lengthOf(2);
  });

  // Test case 3: getProducts should return an empty array if no products are saved
  it('should return an empty array if no products have been saved', () => {
    const products = db.getProducts();
    expect(products).to.be.an('array').that.is.empty;
  });

  // Test case 4: getProducts should return all saved products
  it('should return all products that have been saved', () => {
    db.saveProduct({ name: 'Prod1', description: 'Desc1', price: 100 });
    db.saveProduct({ name: 'Prod2', description: 'Desc2', price: 200 });

    const products = db.getProducts();
    expect(products).to.have.lengthOf(2);
    expect(products[0].name).to.equal('Prod1');
    expect(products[1].name).to.equal('Prod2');
  });

  // Test case 5: getProducts should return a copy, not the original array reference
  it('should return a shallow copy of the products array', () => {
    const product = db.saveProduct({ name: 'Original', description: 'Original', price: 100 });
    const productsCopy = db.getProducts();

    // Modify the copy and ensure the original (internal) array is unaffected
    productsCopy.push({ id: '99', name: 'Added to Copy' });
    expect(db.getProducts()).to.have.lengthOf(1);
    expect(db.getProducts()[0].name).to.equal('Original');
    expect(productsCopy).to.have.lengthOf(2);
  });

  // Test case 6: getProductById should return undefined for a non-existent ID
  it('should return undefined for a product ID that does not exist', () => {
    db.saveProduct({ name: 'Existing Product', description: 'Desc', price: 50 });
    const product = db.getProductById('999');
    expect(product).to.be.undefined;
  });

  // Test case 7: getProductById should return the correct product for an existing ID
  it('should return the correct product for an existing ID', () => {
    const savedProduct1 = db.saveProduct({ name: 'First Product', description: 'Desc1', price: 10 });
    const savedProduct2 = db.saveProduct({ name: 'Second Product', description: 'Desc2', price: 20 });
    const retrievedProduct = db.getProductById(savedProduct2.id);

    expect(retrievedProduct).to.deep.equal(savedProduct2);
    expect(retrievedProduct.id).to.equal(savedProduct2.id);
  });

  // Test case 8: clearProducts should empty the product array and reset ID counter
  it('should clear all products and reset the nextProductId counter', () => {
    db.saveProduct({ name: 'Prod1', description: 'Desc1', price: 100 });
    db.saveProduct({ name: 'Prod2', description: 'Desc2', price: 200 });
    expect(db.getProducts()).to.have.lengthOf(2);

    db.clearProducts();
    expect(db.getProducts()).to.be.empty;

    const newProductAfterClear = db.saveProduct({ name: 'New Prod', description: 'New Desc', price: 300 });
    expect(newProductAfterClear.id).to.equal('1'); // ID counter should reset
  });
});
