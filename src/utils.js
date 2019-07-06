/**
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */
export function iterableEquals (a, b) {
  return a.size === b.size && [...a].every(val => b.has(val))
}
