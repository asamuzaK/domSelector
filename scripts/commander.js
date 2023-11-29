/**
 * commander.js
 */

/* api */
import path from 'node:path';
import process from 'node:process';
import { program as commander } from 'commander';
import { throwErr } from './common.js';
import { createFile, readFile } from './file-util.js';

/* constants */
const CHAR = 'utf8';
const DIR_CWD = process.cwd();
const INDENT = 2;

/**
 * create deno.json
 * @param {boolean} info - console info
 * @returns {Promise.<string>} - file path
 */
export const createDenoJson = async info => {
  const pkg = await readFile(path.join(DIR_CWD, 'package.json'), {
    encoding: CHAR,
    flag: 'r'
  });
  const { dependencies } = JSON.parse(pkg);
  const items = Object.entries(dependencies);
  const esm = new Set([
    'is-potential-custom-element-name'
  ]);
  const importMap = new Map();
  for (const [key, value] of items) {
    // import from esm.sh
    if (esm.has(key)) {
      const version = value.replace(/^[\^~]/, '');
      importMap.set(key, `https://esm.sh/${key}@${version}`);
    // import from npm
    } else {
      importMap.set(key, `npm:${key}@${value}`);
    }
  }
  const obj = {
    imports: Object.fromEntries(importMap),
    nodeModulesDir: true
  };
  const content = `${JSON.stringify(obj, null, INDENT)}\n`;
  const filePath =
    await createFile(path.resolve(DIR_CWD, 'deno.json'), content);
  if (filePath && info) {
    console.info(`Created: ${filePath}`);
  }
  return filePath;
};

/**
 * create deno config file
 * @param {object} cmdOpts - command options
 * @returns {Promise} - promise chain
 */
export const createDenoConfigFile = (cmdOpts = {}) => {
  const { info } = cmdOpts;
  return createDenoJson(info).catch(throwErr);
};

/**
 * parse command
 * @param {Array} args - process.argv
 * @returns {void}
 */
export const parseCommand = args => {
  const reg = /^(?:(?:--)?help|-h|denoconf)$/;
  if (Array.isArray(args) && args.some(arg => reg.test(arg))) {
    commander.command('denoconf')
      .description('create deno config file')
      .option('-i, --info', 'console info')
      .action(createDenoConfigFile);
    commander.parse(args);
  }
};

/* For test */
export {
  commander
};
