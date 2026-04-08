const { expect } = require('chai');
const Product = require('../../models/product');

describe('Product Model', () => {
  // Test case 1: Successfully create a product with valid inputs
  it('should create a new product instance with valid data', () => {
    const product = new Product('Test Product', 'This is a test description.', 19.99);

    expect(product).to.be.an.instanceOf(Product);
    expect(product.name).to.equal('Test Product');
    expect(product.description).to.equal('This is a test description.');
    expect(product.price).to.equal(19.99);
    expect(product.id).to.be.null; // ID should be null initially, set by DB
    expect(product.createdAt).to.be.null; // createdAt should be null initially, set by DB
  });

  // Test case 2: toObject method should return a plain object
  it('should return a plain object representation via toObject()', () => {
    const product = new Product('Object Product', 'Description for object.', 25.50, '123', new Date());
    const productObject = product.toObject();

    expect(productObject).to.be.an('object');
    expect(productObject).to.have.all.keys('id', 'name', 'description', 'price', 'createdAt');
    expect(productObject.name).to.equal('Object Product');
    expect(productObject.price).to.equal(25.50);
  });

  // Test case 3: Product name is required
  it('should throw an error if name is missing', () => {
    expect(() => new Product(null, 'Description', 10.00)).to.throw('Product name is required and must be a non-empty string.');
    expect(() => new Product('', 'Description', 10.00)).to.throw('Product name is required and must be a non-empty string.');
    expect(() => new Product('   ', 'Description', 10.00)).to.throw('Product name is required and must be a non-empty string.');
  });

  // Test case 4: Product name must be a string
  it('should throw an error if name is not a string', () => {
    expect(() => new Product(123, 'Description', 10.00)).to.throw('Product name is required and must be a non-empty string.');
    expect(() => new Product({}, 'Description', 10.00)).to.throw('Product name is required and must be a non-empty string.');
  });

  // Test case 5: Product description is required
  it('should throw an error if description is missing', () => {
    expect(() => new Product('Name', null, 10.00)).to.throw('Product description is required and must be a non-empty string.');
    expect(() => new Product('Name', '', 10.00)).to.throw('Product description is required and must be a non-empty string.');
    expect(() => new Product('Name', '   ', 10.00)).to.throw('Product description is required and must be a non-empty string.');
  });

  // Test case 6: Product description must be a string
  it('should throw an error if description is not a string', () => {
    expect(() => new Product('Name', 123, 10.00)).to.throw('Product description is required and must be a non-empty string.');
    expect(() => new Product('Name', {}, 10.00)).to.throw('Product description is required and must be a non-empty string.');
  });

  // Test case 7: Product price is required
  it('should throw an error if price is missing or not a number', () => {
    expect(() => new Product('Name', 'Description', null)).to.throw('Product price is required and must be a non-negative number.');
    expect(() => new Product('Name', 'Description', 'abc')).to.throw('Product price is required and must be a non-negative number.');
    expect(() => new Product('Name', 'Description', undefined)).to.throw('Product price is required and must be a non-negative number.');
  });

  // Test case 8: Product price must be a non-negative number
  it('should throw an error if price is negative', () => {
    expect(() => new Product('Name', 'Description', -1.00)).to.throw('Product price is required and must be a non-negative number.');
  });

  // Test case 9: Product constructor should trim name and description
  it('should trim whitespace from name and description', () => {
    const product = new Product('  Trimmed Name  ', '  Trimmed Description   ', 15.00);
    expect(product.name).to.equal('Trimmed Name');
    expect(product.description).to.equal('Trimmed Description');
  });

  // Test case 10: Product should accept id and createdAt if provided
  it('should accept id and createdAt parameters', () => {
    const now = new Date();
    const product = new Product('Product with ID', 'Description for product with ID', 99.99, 'prod123', now);
    expect(product.id).to.equal('prod123');
    expect(product.createdAt).to.equal(now);
  });
});
