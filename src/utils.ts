import { N3Parser, Quad } from 'n3'

type Iterable<T=any> = Array<T>|Set<T>

export function iterableEquals (a: Iterable, b: Iterable): boolean {
  return arrayEquals([...a], [...b])
}
export function arrayEquals (a: Array<any>, b: Array<any>): boolean {
  return a.length === b.length && [...a].every(val => {
    return b.some(otherVal => {
      if (typeof val === 'object' && val.hasOwnProperty('equals')) {
        return val.equals(otherVal)
      }
      return val === otherVal
    })
  })
}

export function iterableIncludesIterable (a: Iterable, b: Iterable): boolean {
  return arrayIncludesArray([...a], [...b])
}

export function arrayIncludesArray (a: Array<any>, b: Array<any>) {
  return a.length >= b.length && b.every(val => {
    return a.some(otherVal => {
      if (typeof val === 'object' && val.hasOwnProperty('equals')) {
        return val.equals(otherVal)
      }
      return val === otherVal
    })
  })
}

export function parseTurtle (parser: N3Parser, turtle: string) {
  const data: Record<string, Quad[]> = {}

  return new Promise<typeof data>((resolve, reject) => {
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
