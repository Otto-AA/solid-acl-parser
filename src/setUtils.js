/**
 * @param {Set} a
 * @param {Set} b
 * @returns {boolean}
 */
export function setEquals (a, b) {
  return a.size === b.size && [...a].every(val => b.has(val))
}
