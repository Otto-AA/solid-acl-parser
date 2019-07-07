import AclParser from '../../src/AclParser'
import samples from './samples'

describe('turtle -> AclDoc', () => {
  for (const sample of samples) {
    test(sample.description, async () => {
      const { aclUrl, fileUrl, turtle } = sample
      const parser = new AclParser({ aclUrl, fileUrl })
      const parsedDoc = await parser.turtleToAclDoc(turtle)
      const expectedDoc = sample.getAclDoc()

      expect(parsedDoc).toEqual(expectedDoc)
    })
  }
})

describe('AclDoc -> turtle -> AclDoc', () => {
  for (const sample of samples) {
    test(sample.description, async () => {
      const { aclUrl, fileUrl } = sample
      const parser = new AclParser({ aclUrl, fileUrl })
      const expectedDoc = sample.getAclDoc()
      const parsedTurtle = await parser.aclDocToTurtle(expectedDoc)
      const parsedDoc = await parser.turtleToAclDoc(parsedTurtle)

      expect(parsedDoc).toEqual(expectedDoc)
    })
  }
})

test.todo('Test if no non-acl data gets lost while parsing')