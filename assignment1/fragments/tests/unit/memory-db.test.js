// tests/unit/memory-db.test.js

const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory');

// Utility: make a unique id/owner for each test to avoid state bleed
const uniq = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe('In-Memory Fragment DB (custom tests)', () => {
  describe('writeFragment / readFragment', () => {
    test('returns null when reading a fragment that does not exist', async () => {
      await expect(readFragment(uniq('missing'))).resolves.toBeNull();
    });

    test('writes metadata and can read it back with timestamps', async () => {
      const id = uniq('frag');
      const ownerId = uniq('owner');
      const meta = { id, ownerId, type: 'text/plain', size: 0 };

      await writeFragment(id, meta);
      const got = await readFragment(id);

      expect(got).not.toBeNull();
      expect(got.id).toBe(id);
      expect(got.ownerId).toBe(ownerId);
      expect(got.type).toBe('text/plain');
      expect(got.size).toBe(0);
      expect(typeof got.created).toBe('string');
      expect(typeof got.updated).toBe('string');
    });

    test('updating same id overrides fields and updates the updated timestamp', async () => {
      const id = uniq('frag');
      const ownerId = uniq('owner');

      await writeFragment(id, { id, ownerId, type: 'text/plain', size: 1 });
      const first = await readFragment(id);

      // small delay to ensure timestamp difference
      await new Promise((r) => setTimeout(r, 5));

      await writeFragment(id, { id, ownerId, type: 'text/markdown', size: 2 });
      const second = await readFragment(id);

      expect(second).not.toBeNull();
      // created may be preserved by implementation; at minimum it should exist
      expect(typeof second.created).toBe('string');
      expect(typeof second.updated).toBe('string');
      expect(second.updated >= first.updated).toBe(true);

      expect(second.type).toBe('text/markdown');
      expect(second.size).toBe(2);
    });

    test('writeFragment throws on missing id or fragment', async () => {
      await expect(writeFragment(null, {})).rejects.toThrow();
      await expect(writeFragment('some-id', null)).rejects.toThrow();
    });

    test('readFragment throws on missing id', async () => {
      await expect(readFragment()).rejects.toThrow();
    });
  });

  describe('writeFragmentData / readFragmentData', () => {
    test('returns null when reading data that does not exist', async () => {
      await expect(readFragmentData(uniq('no-data'))).resolves.toBeNull();
    });

    test('stores a copy of the Buffer and reads back an equivalent Buffer', async () => {
      const id = uniq('data');
      const input = Buffer.from('hello world');

      await writeFragmentData(id, input);
      const got = await readFragmentData(id);

      expect(Buffer.isBuffer(got)).toBe(true);
      expect(got.equals(input)).toBe(true);
      expect(got).not.toBe(input); // should not be the same Buffer reference
    });

    test('overwrites previously stored data for the same id', async () => {
      const id = uniq('data');

      await writeFragmentData(id, Buffer.from('first'));
      await writeFragmentData(id, Buffer.from('second'));

      const got = await readFragmentData(id);
      expect(got.toString()).toBe('second');
    });

    test('writeFragmentData throws if id missing or data is not a Buffer', async () => {
      await expect(writeFragmentData()).rejects.toThrow();
      await expect(writeFragmentData('has-id', 'not-a-buffer')).rejects.toThrow();
      await expect(writeFragmentData('has-id', null)).rejects.toThrow();
    });

    test('readFragmentData throws on missing id', async () => {
      await expect(readFragmentData()).rejects.toThrow();
    });
  });

  describe('listFragments and deleteFragment (supporting behaviors)', () => {
    test('listFragments returns only IDs for a specific owner (order-agnostic)', async () => {
      const ownerId = uniq('owner');
      const otherOwner = uniq('owner');

      const f1 = { id: uniq('f1'), ownerId, type: 'text/plain', size: 0 };
      const f2 = { id: uniq('f2'), ownerId, type: 'text/plain', size: 0 };
      const fOther = { id: uniq('f3'), ownerId: otherOwner, type: 'text/plain', size: 0 };

      await writeFragment(f1.id, f1);
      await writeFragment(f2.id, f2);
      await writeFragment(fOther.id, fOther);

      const ids = await listFragments(ownerId);
      expect(ids.sort()).toEqual([f1.id, f2.id].sort());
    });

    test('deleteFragment returns true when something was deleted and removes data too', async () => {
      const id = uniq('to-del');
      const fragment = { id, ownerId: uniq('owner'), type: 'text/plain', size: 0 };
      await writeFragment(id, fragment);
      await writeFragmentData(id, Buffer.from('payload'));

      expect(await deleteFragment(id)).toBe(true);
      expect(await readFragment(id)).toBeNull();
      expect(await readFragmentData(id)).toBeNull();
    });

    test('deleteFragment returns false for a non-existent id', async () => {
      expect(await deleteFragment(uniq('missing'))).toBe(false);
    });
  });
});
