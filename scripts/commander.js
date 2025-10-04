/**
 * commander.js
 */

/* api */
import path from 'node:path';
import process from 'node:process';
import { program as commander } from 'commander';
import { throwErr } from './common.js';
import { createFile, isDir, readFile, removeDir } from './file-util.js';

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
  const importMap = new Map();
  for (const [key, value] of items) {
    const version = value.replace(/^[\^~]/, '');
    importMap.set(key, `https://esm.sh/${key}@${version}`);
  }
  const obj = {
    imports: Object.fromEntries(importMap)
  };
  const content = `${JSON.stringify(obj, null, INDENT)}\n`;
  const filePath = await createFile(
    path.resolve(DIR_CWD, 'deno.json'),
    content
  );
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
 * clean directory
 * @param {object} cmdOpts - command options
 * @returns {void}
 */
export const cleanDirectory = (cmdOpts = {}) => {
  const { dir, info } = cmdOpts;
  if (isDir(dir)) {
    removeDir(dir);
    if (info) {
      console.info(`Removed: ${path.resolve(dir)}`);
    }
  }
};

/**
 * parse command
 * @param {Array} args - process.argv
 * @returns {void}
 */
export const parseCommand = args => {
  const reg = /^(?:(?:--)?help|-h|clean|denoconf)$/;
  if (Array.isArray(args) && args.some(arg => reg.test(arg))) {
    if (args.includes('clean')) {
      commander
        .command('clean')
        .description('clean directory')
        .option('-d, --dir <name>', 'specify directory')
        .option('-i, --info', 'console info')
        .action(cleanDirectory);
    } else if (args.includes('denoconf')) {
      commander
        .command('denoconf')
        .description('create deno config file')
        .option('-i, --info', 'console info')
        .action(createDenoConfigFile);
    }
    commander.parse(args);
  }
};

/* For test */
export { commander };
