/* api */
import { promises as fsPromise } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sinon from 'sinon';
import { assert } from 'chai';
import { describe, it } from 'mocha';

/* test */
import {
  commander, createDenoConfigFile, createDenoJson, parseCommand
} from '../scripts/commander.js';

/* constants */
const DIR_CWD = process.cwd();

describe('create deno json', () => {
  it('should throw', async () => {
    const stubWrite =
      sinon.stub(fsPromise, 'writeFile').rejects(new Error('error'));
    await createDenoJson().catch(e => {
      assert.instanceOf(e, Error, 'error');
      assert.strictEqual(e.message, 'error', 'message');
    });
    stubWrite.restore();
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const res = await createDenoJson();
    const { called: writeCalled } = stubWrite;
    const { called: infoCalled } = stubInfo;
    stubWrite.restore();
    stubInfo.restore();
    assert.isTrue(writeCalled, 'called');
    assert.isFalse(infoCalled, 'called');
    assert.strictEqual(res, path.resolve(DIR_CWD, 'deno.json'), 'result');
  });

  it('should call function', async () => {
    const stubWrite = sinon.stub(fsPromise, 'writeFile');
    const stubInfo = sinon.stub(console, 'info');
    const res = await createDenoJson(true);
    const { called: writeCalled } = stubWrite;
    const { called: infoCalled } = stubInfo;
    stubWrite.restore();
    stubInfo.restore();
    assert.isTrue(writeCalled, 'called');
    assert.isTrue(infoCalled, 'called');
    assert.strictEqual(res, path.resolve(DIR_CWD, 'deno.json'), 'result');
  });
});

describe('create deno config file', () => {
  it('should throw', async () => {
    const stubWrite =
      sinon.stub(fsPromise, 'writeFile').rejects(new Error('error'));
    await createDenoConfigFile().catch(e => {
      assert.instanceOf(e, Error, 'error');
      assert.strictEqual(e.message, 'error', 'message');
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
    assert.isTrue(writeCalled, 'called');
    assert.isFalse(infoCalled, 'called');
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
    assert.isTrue(writeCalled, 'called');
    assert.isTrue(infoCalled, 'called');
    assert.strictEqual(res, path.resolve(DIR_CWD, 'deno.json'), 'result');
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
    const stubVer = sinon.stub(commander, 'version');
    const i = stubParse.callCount;
    const j = stubVer.callCount;
    parseCommand(['foo', 'bar', '-v']);
    assert.strictEqual(stubParse.callCount, i + 1, 'called');
    assert.strictEqual(stubVer.callCount, j + 1, 'called');
    stubParse.restore();
    stubVer.restore();
  });
});
