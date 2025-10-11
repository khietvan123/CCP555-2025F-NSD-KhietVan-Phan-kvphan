// tests/unit/hash.test.js
const { hash } = require('../../src/hash');

describe('Hash function', () => {
  test('hash() should return a string', () => {
    const result = hash('test@example.com');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/^[a-f0-9]{64}$/); // hex length 64
  });

  test('hash() should return consistent results for same input', () => {
    const input = 'test@example.com';
    expect(hash(input)).toBe(hash(input));
  });

  test('hash() normalizes (trim + lowercase) so equivalent emails hash the same', () => {
    const a = hash('User@Example.com ');
    const b = hash(' user@example.com');
    expect(a).toBe(b);
  });

  test('hash() should return different results for different inputs', () => {
    expect(hash('test1@example.com')).not.toBe(hash('test2@example.com'));
  });

  test('hash() should handle empty string', () => {
    const result = hash('');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('hash() should throw error for null/undefined/non-string', () => {
    expect(() => hash(null)).toThrow('Email must be a string');
    expect(() => hash(undefined)).toThrow('Email must be a string');
    expect(() => hash(123)).toThrow('Email must be a string');
  });
});
