// src/model/data/memory/memory-db.js

/**
 * In-Memory Database Implementation for Assignment 1
 * Uses JavaScript Map objects to store fragment metadata and data
 */

// Simple in-memory storage for fragments
const fragments = new Map();
const fragmentData = new Map();

/**
 * Write fragment metadata to memory
 * @param {string} id - Fragment ID
 * @param {object} fragment - Fragment metadata object
 * @returns {Promise<void>}
 */

async function _resetMemory() {
  // fragments and fragmentData are your Maps
  fragments.clear();
  fragmentData.clear();
}

async function writeFragment(id, fragment) {
  if (!id || !fragment) {
    throw new Error('ID and fragment object are required');
  }

  // Store the fragment metadata with created timestamp
  fragments.set(id, {
    ...fragment,
    created: fragment.created || new Date().toISOString(),
    updated: new Date().toISOString(),
  });
}

/**
 * Read fragment metadata from memory
 * @param {string} id - Fragment ID
 * @returns {Promise<object|null>} Fragment metadata or null if not found
 */
async function readFragment(id) {
  if (!id) {
    throw new Error('ID is required');
  }

  return fragments.get(id) || null;
}

/**
 * Write fragment data to memory
 * @param {string} id - Fragment ID
 * @param {Buffer} data - Fragment data
 * @returns {Promise<void>}
 */
async function writeFragmentData(id, data) {
  if (!id) {
    throw new Error('ID is required');
  }

  if (!Buffer.isBuffer(data)) {
    throw new Error('Data must be a Buffer');
  }

  fragmentData.set(id, Buffer.from(data));
}

/**
 * Read fragment data from memory
 * @param {string} id - Fragment ID
 * @returns {Promise<Buffer|null>} Fragment data or null if not found
 */
async function readFragmentData(id) {
  if (!id) {
    throw new Error('ID is required');
  }

  return fragmentData.get(id) || null;
}

/**
 * List fragment IDs for a user
 * @param {string} ownerId - Owner ID (hashed email)
 * @returns {Promise<string[]>} Array of fragment IDs
 */
async function listFragments(ownerId) {
  if (!ownerId) {
    throw new Error('Owner ID is required');
  }

  const userFragments = [];
  for (const [id, fragment] of fragments.entries()) {
    if (fragment.ownerId === ownerId) {
      userFragments.push(id);
    }
  }

  return userFragments;
}

/**
 * Delete a fragment and its data
 * @param {string} id - Fragment ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteFragment(id) {
  if (!id) {
    throw new Error('ID is required');
  }

  const deleted = fragments.delete(id);
  fragmentData.delete(id);

  return deleted;
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
  _resetMemory 
};
