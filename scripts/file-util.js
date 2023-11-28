/**
 * file-util.js
 */

import fs, { promises as fsPromise } from 'node:fs';
import path from 'node:path';
import { getType, isString } from './common.js';

/* constants */
const CHAR = 'utf8';
const PERM_FILE = 0o644;

/**
 * get stat
 * @param {string} file - file path
 * @returns {object} - file stat
 */
export const getStat = file =>
  isString(file) && fs.existsSync(file) ? fs.statSync(file) : null;

/**
 * the file is a file
 * @param {string} file - file path
 * @returns {boolean} - result
 */
export const isFile = file => {
  const stat = getStat(file);
  return stat ? stat.isFile() : false;
};

/**
 * read a file
 * @param {string} file - file path
 * @param {object} [opt] - options
 * @param {string} [opt.encoding] - encoding
 * @param {string} [opt.flag] - flag
 * @returns {Promise.<string|Buffer>} - file content
 */
export const readFile = async (file, opt = { encoding: null, flag: 'r' }) => {
  if (!isFile(file)) {
    throw new Error(`${file} is not a file.`);
  }
  const value = await fsPromise.readFile(file, opt);
  return value;
};

/**
 * create a file
 * @param {string} file - file path to create
 * @param {string} value - value to write
 * @returns {Promise.<string>} - file path
 */
export const createFile = async (file, value) => {
  if (!isString(file)) {
    throw new TypeError(`Expected String but got ${getType(file)}.`);
  }
  if (!isString(value)) {
    throw new TypeError(`Expected String but got ${getType(value)}.`);
  }
  const filePath = path.resolve(file);
  await fsPromise.writeFile(filePath, value, {
    encoding: CHAR, flag: 'w', mode: PERM_FILE
  });
  return filePath;
};
