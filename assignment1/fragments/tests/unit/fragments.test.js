// tests/unit/fragment.test.js

const Fragment = require('../../src/model/fragments');
const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory');
const { _resetMemory } = require('../../src/model/data/memory/memory-db');

beforeEach(async () => {
  await _resetMemory();
});

describe('Fragment class', () => {
  test('constructor sets all properties when provided', () => {
    const fragment = new Fragment({
      id: 'test-id',
      ownerId: 'test-owner',
      type: 'text/plain',
      size: 100,
    });

    expect(fragment.id).toBe('test-id');
    expect(fragment.ownerId).toBe('test-owner');
    expect(fragment.type).toBe('text/plain');
    expect(fragment.size).toBe(100);
    expect(fragment.created).toBeDefined();
    expect(fragment.updated).toBeDefined();
  });

  test('constructor generates id when not provided', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    expect(fragment.id).toBeDefined();
    expect(typeof fragment.id).toBe('string');
    expect(fragment.id.length).toBeGreaterThan(0);
  });

  test('constructor sets created/updated timestamps (updated >= created)', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    expect(fragment.created).toBeDefined();
    expect(fragment.updated).toBeDefined();
    expect(new Date(fragment.updated).getTime())
      .toBeGreaterThanOrEqual(new Date(fragment.created).getTime());
  });

  test('isSupportedType() returns true only for supported types', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
    expect(Fragment.isSupportedType('application/json')).toBe(false);
    expect(Fragment.isSupportedType('image/png')).toBe(false);
  });

  // Negative constructor guards (useful to catch regressions)
  test('constructor throws without ownerId', () => {
    expect(() => new Fragment({ type: 'text/plain' })).toThrow();
  });

  test('constructor throws for unsupported type', () => {
    expect(() => new Fragment({ ownerId: 'x', type: 'application/json' })).toThrow();
  });

  test('byUser() returns fragments for a user (order-agnostic)', async () => {
    const ownerId = `test-user-${Date.now()}`;
    const fragment = {
      id: 'test-fragment-user',
      ownerId,
      type: 'text/plain',
      size: 0,
    };

    await writeFragment(fragment.id, fragment);

    const list = await Fragment.byUser(ownerId);
    expect(Array.isArray(list)).toBe(true);
    const ids = list.map((f) => f.id);
    expect(ids).toContain(fragment.id);
  });

  test('byId() returns a Fragment instance when found', async () => {
    const fragment = {
      id: 'test-fragment-id',
      ownerId: 'test-owner',
      type: 'text/plain',
      size: 0,
    };

    await writeFragment(fragment.id, fragment);

    const result = await Fragment.byId(fragment.id);
    expect(result).toBeInstanceOf(Fragment);
    expect(result.id).toBe(fragment.id);
  });

  test('byId() returns null when not found', async () => {
    const result = await Fragment.byId('non-existent-id');
    expect(result).toBeNull();
  });

  test('save() persists metadata (writeFragment)', async () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    await fragment.save();

    const saved = await readFragment(fragment.id);
    expect(saved).toBeDefined();
    expect(saved.id).toBe(fragment.id);
    expect(saved.ownerId).toBe('test-owner');
    expect(saved.type).toBe('text/plain');
  });

  test('getData() returns stored data', async () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    const testData = Buffer.from('Hello, world!');
    await writeFragmentData(fragment.id, testData);

    const result = await fragment.getData();
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.equals(testData)).toBe(true);
  });

  test('setData() saves data and updates size', async () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    const testData = Buffer.from('Test data for fragment');
    await fragment.setData(testData);

    expect(fragment.size).toBe(testData.length);

    const saved = await readFragmentData(fragment.id);
    expect(Buffer.isBuffer(saved)).toBe(true);
    expect(saved.equals(testData)).toBe(true);
  });

  test('setData() throws if data is not a Buffer', async () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    await expect(fragment.setData('not-a-buffer')).rejects.toThrow();
  });

  test('delete() removes fragment metadata and data', async () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    await fragment.save();
    await writeFragmentData(fragment.id, Buffer.from('abc'));

    const deleted = await fragment.delete();
    expect(deleted).toBe(true);

    const meta = await readFragment(fragment.id);
    const data = await readFragmentData(fragment.id);
    expect(meta).toBeNull();
    expect(data).toBeNull();
  });
});

// This is a random comment to test git changes.