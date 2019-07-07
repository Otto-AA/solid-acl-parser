/**
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */
export function iterableEquals (a, b) {
  return arrayEquals([...a], [...b])
}

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {boolean}
 */
export function arrayEquals (a, b) {
  return a.length === b.length && [...a].every(val => {
    return b.some(otherVal => {
      if (typeof val === 'object' && val.hasOwnProperty('equals')) {
        return val.equals(otherVal)
      }
      return val === otherVal
    })
  })
}

/**
 * @param {Iterable} a
 * @param {Iterable} b
 * @returns {boolean}
 */
export function iterableIncludesIterable (a, b) {
  return arrayIncludesArray([...a], [...b])
}

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {boolean}
 */
export function arrayIncludesArray (a, b) {
  return a.length >= b.length && b.every(val => {
    return a.some(otherVal => {
      if (typeof val === 'object' && val.hasOwnProperty('equals')) {
        return val.equals(otherVal)
      }
      return val === otherVal
    })
  })
}
