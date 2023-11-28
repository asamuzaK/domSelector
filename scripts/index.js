/**
 * index.js
 */

/* api */
import process from 'node:process';
import { logErr, throwErr } from './common.js';
import { parseCommand } from './commander.js';

/* process */
process.on('uncaughtException', throwErr);
process.on('unhandledRejection', logErr);

parseCommand(process.argv);
