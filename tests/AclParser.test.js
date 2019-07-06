import AclParser from '../src/AclParser'
import fs from 'fs'
import path from 'path'

/** @type {string} */
let sampleTurtle

beforeAll(() => {
  return new Promise((resolve, reject) => {
    const aclPath = path.resolve(__dirname, 'data', 'sample.acl')
    fs.readFile(aclPath, 'utf8', (err, data) => {
      if (err) {
        return reject(err)
      }
      sampleTurtle = data
      return resolve()
    })
  })
})

test('can parse sample turtle file', async () => {
  const parser = new AclParser()
  const doc = await parser.turtleToAclDoc(sampleTurtle)
  const turtle = await parser.aclDocToTurtle(doc)
  expect(typeof turtle).toBe('string')
})
