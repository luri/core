
/**
 * Returns a promise that resolves with given values after <ms> delay.
 * 
 * @param {number} ms Amount in ms
 * @param  {...any} values Values that will be passed to resolve
 * @returns {Promise}
 */
export function delay(ms, ...values) {
  return new Promise(resolve => setTimeout(resolve, ms, ...values));
}