// src/model/fragment.js

const crypto = require('crypto');
const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 } = {}) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!type || !Fragment.isSupportedType(type)) {
      throw new Error(`Unsupported type: ${type}`);
    }

    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments for a user
   * @param {string} ownerId - The owner's hashed email
   * @returns {Promise<Fragment[]>} - Array of Fragment objects
   */
  static async byUser(ownerId) {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    const fragmentIds = await listFragments(ownerId);
    const fragments = [];

    for (const id of fragmentIds) {
      const fragmentData = await readFragment(id);
      if (fragmentData) {
        fragments.push(new Fragment(fragmentData));
      }
    }

    return fragments;
  }

  //Export both name to be safe
    static async byOwner(ownerId) {
    return this.byUser(ownerId);
  }


  /**
   * Get a fragment by ID
   * @param {string} id - Fragment ID
   * @returns {Promise<Fragment|null>} - Fragment object or null if not found
   */
  static async byId(id) {
    if (!id) {
      throw new Error('ID is required');
    }

    const fragmentData = await readFragment(id);
    return fragmentData ? new Fragment(fragmentData) : null;
  }



  /**
   * Save the fragment metadata to the database
   * @returns {Promise<void>}
   */
  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this.id, {
      id: this.id,
      ownerId: this.ownerId,
      created: this.created,
      updated: this.updated,
      type: this.type,
      size: this.size,
    });
  }

  /**
   * Get the fragment data from the database
   * @returns {Promise<Buffer|null>} - Fragment data or null if not found
   */
  async getData() {
    return await readFragmentData(this.id);
  }

  /**
   * Set the fragment data in the database
   * @param {Buffer} data - Fragment data
   * @returns {Promise<void>}
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();

    await writeFragmentData(this.id, data);
    await this.save(); // Update metadata with new size and timestamp
  }

  /**
   * Delete the fragment and its data
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async delete() {
    return await deleteFragment(this.id);
  }

  /**
   * Check if a content type is supported
   * @param {string} type - Content type
   * @returns {boolean} - True if supported, false otherwise
   */
  static isSupportedType(type) {
    // For Assignment 1, only support text/plain
    // TODO: Expand this for future assignments
    return type === 'text/plain';
  }
}

module.exports = Fragment;
