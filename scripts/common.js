/**
 * common.js
 */

/* constants */
const TYPE_FROM = 8;
const TYPE_TO = -1;

/**
 * throw error
 * @param {!Error} e - Error
 * @throws {Error} - Error
 */
export const throwErr = e => {
  throw e;
};

/**
 * log error
 * @param {!Error} e - Error
 * @returns {boolean} - false
 */
export const logErr = e => {
  console.error(e);
  return false;
};

/**
 * log warn
 * @param {string|Error} msg - message
 * @returns {boolean} - false
 */
export const logWarn = msg => {
  msg && console.warn(msg);
  return false;
};

/**
 * log message
 * @param {string|Error} msg - message
 * @returns {string|Error} - message
 */
export const logMsg = msg => {
  msg && console.log(msg);
  return msg;
};

/**
 * get type
 * @param {object} o - object to check
 * @returns {string} - type of object
 */
export const getType = o =>
  Object.prototype.toString.call(o).slice(TYPE_FROM, TYPE_TO);

/**
 * is string
 * @param {object} o - object to check
 * @returns {boolean} - result
 */
export const isString = o => typeof o === 'string' || o instanceof String;

/**
 * sleep
 * @param {number} [msec] - millisecond
 * @param {boolean} [doReject] - reject instead of resolve
 * @returns {?Promise} - resolve / reject
 */
export const sleep = (msec = 0, doReject = false) => {
  let func;
  if (Number.isInteger(msec) && msec >= 0) {
    func = new Promise((resolve, reject) => {
      if (doReject) {
        setTimeout(reject, msec);
      } else {
        setTimeout(resolve, msec);
      }
    });
  }
  return func || null;
};
