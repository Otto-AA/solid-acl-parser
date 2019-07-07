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

/**
 * @description parse all data from a turtle file and groups it by subjectIds
 * @param {N3.N3Parser} parser
 * @param {string} turtle
 * @returns {Object.<string, N3.Quad[]>}
 */
export function parseTurtle (parser, turtle) {
  /** @type {Object.<string, N3.Quad[]>} */
  const data = {}

  return new Promise((resolve, reject) => {
    parser.parse(turtle, (error, quad) => {
      if (error) {
        return reject(error)
      }

      if (quad === null) {
        return resolve(data)
      }

      const subjectId = quad.subject.id
      if (!data.hasOwnProperty(subjectId)) {
        data[subjectId] = []
      }
      data[subjectId].push(quad)
    })
  })
}
