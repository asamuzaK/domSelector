/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import {
  getType,
  isString,
  logErr,
  logMsg,
  logWarn,
  sleep,
  throwErr
} from '../scripts/common.js';

describe('getType', () => {
  it('should get Undefined', () => {
    assert.strictEqual(getType(), 'Undefined');
  });

  it('should get Null', () => {
    assert.strictEqual(getType(null), 'Null');
  });

  it('should get Object', () => {
    assert.strictEqual(getType({}), 'Object');
  });

  it('should get Array', () => {
    assert.strictEqual(getType([]), 'Array');
  });

  it('should get Boolean', () => {
    assert.strictEqual(getType(true), 'Boolean');
  });

  it('should get Number', () => {
    assert.strictEqual(getType(1), 'Number');
  });

  it('should get String', () => {
    assert.strictEqual(getType('a'), 'String');
  });
});

describe('isString', () => {
  it('should get true if string is given', () => {
    assert.strictEqual(isString('a'), true);
  });

  it('should get false if given argument is not string', () => {
    assert.strictEqual(isString(1), false);
  });
});

describe('logErr', () => {
  it('should get false', () => {
    const msg = 'Log Error test';
    let errMsg;
    const consoleError = sinon.stub(console, 'error').callsFake(e => {
      errMsg = e.message;
    });
    const res = logErr(new Error(msg));
    const { calledOnce } = consoleError;
    consoleError.restore();
    assert.strictEqual(calledOnce, true);
    assert.strictEqual(errMsg, msg);
    assert.strictEqual(res, false);
  });
});

describe('logMsg', () => {
  it('should get string', () => {
    const msg = 'Log message test';
    let logMessage;
    const consoleLog = sinon.stub(console, 'log').callsFake(m => {
      logMessage = m;
    });
    const res = logMsg(msg);
    const { calledOnce } = consoleLog;
    consoleLog.restore();
    assert.strictEqual(calledOnce, true);
    assert.strictEqual(logMessage, msg);
    assert.strictEqual(res, msg);
  });
});

describe('logWarn', () => {
  it('should get false', () => {
    const msg = 'Log warn test';
    let warnMsg;
    const consoleWarn = sinon.stub(console, 'warn').callsFake(m => {
      warnMsg = m;
    });
    const res = logWarn(msg);
    const { calledOnce } = consoleWarn;
    consoleWarn.restore();
    assert.strictEqual(calledOnce, true);
    assert.strictEqual(warnMsg, msg);
    assert.strictEqual(res, false);
  });
});

describe('throwErr', () => {
  it('should throw', () => {
    const e = new Error('Error');
    assert.throws(() => throwErr(e));
  });
});

describe('sleep', () => {
  it('should resolve even if no argument given', async () => {
    const fake = sinon.fake();
    const fake2 = sinon.fake();
    await sleep().then(fake).catch(fake2);
    assert.strictEqual(fake.callCount, 1);
    assert.strictEqual(fake2.callCount, 0);
  });

  it('should get null if 1st argument is not integer', async () => {
    const res = await sleep('foo');
    assert.deepEqual(res, null);
  });

  it('should get null if 1st argument is not positive integer', async () => {
    const res = await sleep(-1);
    assert.deepEqual(res, null);
  });

  it('should resolve', async () => {
    const fake = sinon.fake();
    const fake2 = sinon.fake();
    await sleep(1).then(fake).catch(fake2);
    assert.strictEqual(fake.callCount, 1);
    assert.strictEqual(fake2.callCount, 0);
  });

  it('should reject', async () => {
    const fake = sinon.fake();
    const fake2 = sinon.fake();
    await sleep(1, true).then(fake).catch(fake2);
    assert.strictEqual(fake.callCount, 0);
    assert.strictEqual(fake2.callCount, 1);
  });
});
