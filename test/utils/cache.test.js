/**
 * @module test/utils/cache
 * @description Tests for the cache utility.
 */

const cache = require('../../utils/cache');
const sinon = require('sinon');

describe('Cache Utility', () => {
  beforeEach(() => {
    // Clear cache before each test to ensure isolation
    cache.clear();
    // Ensure default TTL is used for tests unless overridden
    process.env.CACHE_TTL_SECONDS = '1';
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should set and get a value successfully', () => {
    const key = 'testKey';
    const value = { data: 'testData' };

    cache.set(key, value);
    const retrievedValue = cache.get(key);

    expect(retrievedValue).to.deep.equal(value);
  });

  it('should return undefined for a non-existent key', () => {
    const retrievedValue = cache.get('nonExistentKey');
    expect(retrievedValue).to.be.undefined;
  });

  it('should delete a single key', () => {
    const key = 'deleteKey';
    cache.set(key, 'valueToDelete');
    expect(cache.get(key)).to.equal('valueToDelete');

    cache.del(key);
    expect(cache.get(key)).to.be.undefined;
  });

  it('should delete multiple keys', () => {
    const key1 = 'delKey1';
    const key2 = 'delKey2';
    cache.set(key1, 'value1');
    cache.set(key2, 'value2');
    expect(cache.get(key1)).to.exist;
    expect(cache.get(key2)).to.exist;

    cache.del([key1, key2]);
    expect(cache.get(key1)).to.be.undefined;
    expect(cache.get(key2)).to.be.undefined;
  });

  it('should clear the entire cache when no category is specified', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    expect(cache.get('key1')).to.exist;

    cache.clear();
    expect(cache.get('key1')).to.be.undefined;
    expect(cache.get('key2')).to.be.undefined;
  });

  it('should clear specific categories of keys', () => {
    cache.set('vets_page1', 'vetsData1');
    cache.set('vets_page2', 'vetsData2');
    cache.set('owners_data', 'ownersData');

    cache.clear('vets');
    expect(cache.get('vets_page1')).to.be.undefined;
    expect(cache.get('vets_page2')).to.be.undefined;
    expect(cache.get('owners_data')).to.exist; // Should not be cleared
  });

  it('should expire items after their standard TTL', async () => {
    const key = 'ttlKey';
    const value = 'ttlValue';
    process.env.CACHE_TTL_SECONDS = '1'; // Set TTL to 1 second

    cache.set(key, value);
    expect(cache.get(key)).to.equal(value);

    // Wait for more than the TTL
    await new Promise(resolve => setTimeout(resolve, 1500));

    expect(cache.get(key)).to.be.undefined;
  }).timeout(3000); // Increase test timeout for async wait

  it('should respect custom TTL for a specific item', async () => {
    const key = 'customTtlKey';
    const value = 'customTtlValue';
    const customTtl = 0.5; // 0.5 seconds

    cache.set(key, value, customTtl);
    expect(cache.get(key)).to.equal(value);

    // Wait for custom TTL to expire
    await new Promise(resolve => setTimeout(resolve, 600));

    expect(cache.get(key)).to.be.undefined;
  }).timeout(2000);

  it('should not expire if custom TTL is 0 (forever)', async () => {
    const key = 'foreverKey';
    const value = 'foreverValue';

    cache.set(key, value, 0); // TTL 0 means forever
    expect(cache.get(key)).to.equal(value);

    await new Promise(resolve => setTimeout(resolve, 1500)); // Wait longer than default TTL

    expect(cache.get(key)).to.equal(value); // Should still exist
  }).timeout(3000);
});

