/* api */
import { strict as assert } from 'node:assert';
import fs, { promises as fsPromise } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import {
  cleanDirectory, commander, createDenoConfigFile, createDenoJson, parseCommand
} from '../scripts/commander.js';

/* constants */
const CHAR = 'utf8';
const DIR_CWD = process.cwd();
const INDENT = 2;
const PERM_FILE = 0o644;

describe('create deno json', () => {
  it('should throw', async () => {
    const stubWrite =
      sinon.stub(fsPromise, 'writeFile').rejects(new Error('error'));
    await createDenoJson().catch(e => {
      assert.deepStrictEqual(e, new Error('error'));
    });
    stubWrite.restore();
  });

  it('should call function', async () => {
    const pkg = {
      dependencies: {
        'css-tree': '^1.2.3',
        'is-potential-custom-element-name': '^1.0.1'
      }
    };
    const stubRead =
      sinon.stub(fsPromise, 'readFile').resolves(JSON.stringify(pkg));
    const filePath = path.resolve(DIR_CWD, 'deno.json');
    const content = `${JSON.stringify({
      imports: {
        'css-tree': 'https://esm.sh/css-tree@1.2.3',
        'is-potential-custom-element-name':
          'https://esm.sh/is-potential-custom-element-name@1.0.1'
      }
    }, null, INDENT)}\n`;
    const opt = {
      encoding: CHAR, flag: 'w', mode: PERM_FILE
    };
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubWriteCond = stubWrite.withArgs(filePath, content, opt);
    const stubInfo = sinon.stub(console, 'info');
    const res = await createDenoJson();
    const { called: writeCalled } = stubWriteCond;
    const { called: infoCalled } = stubInfo;
    stubRead.restore();
    stubWrite.restore();
    stubInfo.restore();
    assert.strictEqual(writeCalled, true, 'called write');
    assert.strictEqual(infoCalled, false, 'not called info');
    assert.strictEqual(res, filePath, 'result');
  });

  it('should call function', async () => {
    const pkg = {
      dependencies: {
        'css-tree': '^1.2.3',
        'is-potential-custom-element-name': '^1.0.1'
      }
    };
    const stubRead =
      sinon.stub(fsPromise, 'readFile').resolves(JSON.stringify(pkg));
    const filePath = path.resolve(DIR_CWD, 'deno.json');
    const content = `${JSON.stringify({
      imports: {
        'css-tree': 'https://esm.sh/css-tree@1.2.3',
        'is-potential-custom-element-name':
          'https://esm.sh/is-potential-custom-element-name@1.0.1'
      }
    }, null, INDENT)}\n`;
    const opt = {
      encoding: CHAR, flag: 'w', mode: PERM_FILE
    };
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubWriteCond = stubWrite.withArgs(filePath, content, opt);
    const stubInfo = sinon.stub(console, 'info');
    const res = await createDenoJson(true);
    const { called: writeCalled } = stubWriteCond;
    const { called: infoCalled } = stubInfo;
    stubRead.restore();
    stubWrite.restore();
    stubInfo.restore();
    assert.strictEqual(writeCalled, true, 'called write');
    assert.strictEqual(infoCalled, true, 'called info');
    assert.strictEqual(res, filePath, 'result');
  });
});

describe('create deno config file', () => {
  it('should throw', async () => {
    const stubWrite =
      sinon.stub(fsPromise, 'writeFile').rejects(new Error('error'));
    await createDenoConfigFile().catch(e => {
      assert.deepStrictEqual(e, new Error('error'));
    });
    stubWrite.restore();
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const res = await createDenoConfigFile();
    const { called: writeCalled } = stubWrite;
    const { called: infoCalled } = stubInfo;
    stubWrite.restore();
    stubInfo.restore();
    assert.strictEqual(writeCalled, true, 'called write');
    assert.strictEqual(infoCalled, false, 'not called info');
    assert.strictEqual(res, path.resolve(DIR_CWD, 'deno.json'), 'result');
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const res = await createDenoConfigFile({
      info: true
    });
    const { called: writeCalled } = stubWrite;
    const { called: infoCalled } = stubInfo;
    stubWrite.restore();
    stubInfo.restore();
    assert.strictEqual(writeCalled, true, 'called write');
    assert.strictEqual(infoCalled, true, 'called info');
    assert.strictEqual(res, path.resolve(DIR_CWD, 'deno.json'), 'result');
  });
});

describe('clean directory', () => {
  it('should not call funtion', () => {
    const stubRm = sinon.stub(fs, 'rmSync');
    const dir = path.resolve('foo');
    cleanDirectory({ dir });
    const { called: rmCalled } = stubRm;
    stubRm.restore();
    assert.strictEqual(rmCalled, false, 'not called');
  });

  it('should call funtion', () => {
    const stubRm = sinon.stub(fs, 'rmSync');
    const stubInfo = sinon.stub(console, 'info');
    const dir = path.resolve('test', 'file');
    cleanDirectory({ dir });
    const { calledOnce: rmCalled } = stubRm;
    const { called: infoCalled } = stubInfo;
    stubRm.restore();
    stubInfo.restore();
    assert.strictEqual(rmCalled, true, 'called');
    assert.strictEqual(infoCalled, false, 'not called');
  });

  it('should call funtion', () => {
    const stubRm = sinon.stub(fs, 'rmSync');
    const stubInfo = sinon.stub(console, 'info');
    const dir = path.resolve('test', 'file');
    cleanDirectory({ dir, info: true });
    const { calledOnce: rmCalled } = stubRm;
    const { calledOnce: infoCalled } = stubInfo;
    stubRm.restore();
    stubInfo.restore();
    assert.strictEqual(rmCalled, true, 'called');
    assert.strictEqual(infoCalled, true, 'called');
  });
});

describe('parse command', () => {
  it('should not parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const i = stubParse.callCount;
    parseCommand();
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should not parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const i = stubParse.callCount;
    parseCommand([]);
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should not parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const i = stubParse.callCount;
    parseCommand(['foo', 'bar', 'baz']);
    assert.strictEqual(stubParse.callCount, i, 'not called');
    stubParse.restore();
  });

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const spyCmd = sinon.spy(commander, 'command');
    const stubAct = sinon.stub(commander, 'action');
    const i = stubParse.callCount;
    const j = spyCmd.callCount;
    parseCommand(['foo', 'bar', 'clean']);
    assert.strictEqual(stubParse.callCount, i + 1, 'called parse');
    assert.strictEqual(spyCmd.callCount, j + 1, 'called command');
    stubParse.restore();
    spyCmd.restore();
    stubAct.restore();
  });

  it('should parse', () => {
    const stubParse = sinon.stub(commander, 'parse');
    const spyCmd = sinon.spy(commander, 'command');
    const stubAct = sinon.stub(commander, 'action');
    const i = stubParse.callCount;
    const j = spyCmd.callCount;
    parseCommand(['foo', 'bar', 'denoconf']);
    assert.strictEqual(stubParse.callCount, i + 1, 'called parse');
    assert.strictEqual(spyCmd.callCount, j + 1, 'called command');
    stubParse.restore();
    spyCmd.restore();
    stubAct.restore();
  });
});
