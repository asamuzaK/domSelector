/* api */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { assert } from 'chai';

/* test */
import { createFile, getStat, isFile, readFile } from '../scripts/file-util.js';

/* constants */
const TMPDIR = process.env.TMP || process.env.TMPDIR || process.env.TEMP ||
               os.tmpdir();

describe('getStat', () => {
  it('should be an object', () => {
    const p = path.resolve('test', 'file', 'test.txt');
    assert.property(getStat(p), 'mode');
  });

  it('should get null if given argument is not string', () => {
    assert.isNull(getStat());
  });

  it('should get null if file does not exist', () => {
    const p = path.resolve('test', 'file', 'foo.txt');
    assert.isNull(getStat(p));
  });
});

describe('isFile', () => {
  it('should get true if file exists', () => {
    const p = path.resolve('test', 'file', 'test.txt');
    assert.isTrue(isFile(p));
  });

  it('should get false if file does not exist', () => {
    const p = path.resolve('test', 'file', 'foo.txt');
    assert.isFalse(isFile(p));
  });
});

describe('readFile', () => {
  it('should throw', async () => {
    await readFile('foo/bar').catch(e => {
      assert.strictEqual(e.message, 'foo/bar is not a file.');
    });
  });

  it('should get file', async () => {
    const p = path.resolve('test', 'file', 'test.txt');
    const opt = { encoding: 'utf8', flag: 'r' };
    const file = await readFile(p, opt);
    assert.strictEqual(file, 'test file\n');
  });
});

describe('createFile', () => {
  const dirPath = path.join(TMPDIR, 'domselector');
  beforeEach(() => {
    fs.rmSync(dirPath, { force: true, recursive: true });
  });
  afterEach(() => {
    fs.rmSync(dirPath, { force: true, recursive: true });
  });

  it('should get string', async () => {
    fs.mkdirSync(dirPath);
    const filePath = path.join(dirPath, 'test.txt');
    const value = 'test file.\n';
    const file = await createFile(filePath, value);
    assert.strictEqual(file, filePath);
  });

  it('should throw if first argument is not a string', () => {
    createFile().catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });

  it('should throw if second argument is not a string', () => {
    const file = path.join(dirPath, 'test.txt');
    createFile(file).catch(e => {
      assert.instanceOf(e, TypeError, 'error');
      assert.strictEqual(e.message, 'Expected String but got Undefined.');
    });
  });
});
