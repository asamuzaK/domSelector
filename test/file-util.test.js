/* api */
import { strict as assert } from 'node:assert';
import fs, { promises as fsPromise } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import {
  copyFile,
  createFile,
  getStat,
  isDir,
  isFile,
  readFile,
  removeDir,
  removeFile
} from '../scripts/file-util.js';

/* constants */
const TMPDIR =
  process.env.TMP || process.env.TMPDIR || process.env.TEMP || os.tmpdir();

describe('getStat', () => {
  it('should be an object', () => {
    const p = path.resolve('test', 'file', 'test.txt');
    assert.strictEqual(typeof getStat(p), 'object');
  });

  it('should get null if given argument is not string', () => {
    assert.deepEqual(getStat(), null);
  });

  it('should get null if file does not exist', () => {
    const p = path.resolve('test', 'file', 'foo.txt');
    assert.deepEqual(getStat(p), null);
  });
});

describe('isDir', () => {
  it('should get true if dir exists', () => {
    const p = path.resolve(path.join('test', 'file'));
    assert.strictEqual(isDir(p), true);
  });

  it('should get false if dir does not exist', () => {
    const p = path.resolve(path.join('test', 'foo'));
    assert.strictEqual(isDir(p), false);
  });
});

describe('isFile', () => {
  it('should get true if file exists', () => {
    const p = path.resolve('test', 'file', 'test.txt');
    assert.strictEqual(isFile(p), true);
  });

  it('should get false if file does not exist', () => {
    const p = path.resolve('test', 'file', 'foo.txt');
    assert.strictEqual(isFile(p), false);
  });
});

describe('removeDir', () => {
  it('should throw', () => {
    const foo = path.resolve('foo');
    assert.strictEqual(isDir(foo), false);
    assert.throws(() => removeDir(foo), Error, `No such directory: ${foo}`);
  });

  it("should remove dir and it's files", async () => {
    const dirPath = path.join(TMPDIR, 'domselector');
    fs.mkdirSync(dirPath);
    const subDirPath = path.join(dirPath, 'foo');
    fs.mkdirSync(subDirPath);
    const filePath = path.join(subDirPath, 'test.txt');
    const value = 'test file.\n';
    await fsPromise.writeFile(filePath, value, {
      encoding: 'utf8',
      flag: 'w',
      mode: 0o666
    });
    const res1 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath)
    ]);
    removeDir(dirPath);
    const res2 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath)
    ]);
    assert.deepEqual(res1, [true, true, true]);
    assert.deepEqual(res2, [false, false, false]);
  });
});

describe('removeFile', () => {
  it('should throw', () => {
    const foo = path.resolve('foo');
    assert.strictEqual(isFile(foo), false);
    assert.throws(() => removeFile(foo), Error, `No such file: ${foo}`);
  });

  it('should remove file', async () => {
    const dirPath = path.join(TMPDIR, 'domselector');
    fs.mkdirSync(dirPath);
    const subDirPath = path.join(dirPath, 'foo');
    fs.mkdirSync(subDirPath);
    const filePath = path.join(subDirPath, 'test.txt');
    const value = 'test file.\n';
    await fsPromise.writeFile(filePath, value, {
      encoding: 'utf8',
      flag: 'w',
      mode: 0o666
    });
    const res1 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath)
    ]);
    removeFile(filePath);
    const res2 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath)
    ]);
    removeDir(dirPath);
    assert.deepEqual(res1, [true, true, true]);
    assert.deepEqual(res2, [true, true, false]);
  });
});

describe('copyFile', () => {
  it('should copy file', async () => {
    const dirPath = path.join(TMPDIR, 'domselector');
    fs.mkdirSync(dirPath);
    const subDirPath = path.join(dirPath, 'foo');
    fs.mkdirSync(subDirPath);
    const filePath = path.join(subDirPath, 'test.txt');
    const copyPath = path.join(subDirPath, 'test2.txt');
    const value = 'test file.\n';
    await fsPromise.writeFile(filePath, value, {
      encoding: 'utf8',
      flag: 'w',
      mode: 0o666
    });
    const res1 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath),
      fs.existsSync(copyPath)
    ]);
    copyFile(filePath, copyPath);
    const res2 = await Promise.all([
      fs.existsSync(dirPath),
      fs.existsSync(subDirPath),
      fs.existsSync(filePath),
      fs.existsSync(copyPath)
    ]);
    removeDir(dirPath);
    assert.deepEqual(res1, [true, true, true, false]);
    assert.deepEqual(res2, [true, true, true, true]);
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
    assert.strictEqual(/^test file\r?\n$/.test(file), true);
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
