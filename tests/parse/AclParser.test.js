import AclParser from '../../src/AclParser'
import samples from './samples'
import Permissions from '../../src/Permissions';
import Agents from '../../src/Agents';

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

describe('subject ids', () => {
  test('does not generate equivalent subject Ids', async () => {
    // Add rule
    // doc -> turtle -> doc
    // Add rule
    // doc -> turtle -> doc
    // Check if doc has two distinct rules
    const fileUrl = 'https://solid.example.org/foo/file.ttl'
    const aclUrl = `${fileUrl}.acl`
    const webId = 'https://web.id/profile/card#me'
    const parser = new AclParser({ aclUrl, fileUrl })
    const doubleParse = async doc => parser.turtleToAclDoc(await parser.aclDocToTurtle(doc))
    let doc = await parser.turtleToAclDoc('')
    doc.addRule(Permissions.ALL, webId)
    doc = await doubleParse(doc)
    doc.addRule(Permissions.READ, Agents.PUBLIC)
    doc = await doubleParse(doc)

    expect(doc.hasRule(Permissions.ALL, webId)).toBe(true)
    expect(doc.hasRule(Permissions.READ, Agents.PUBLIC)).toBe(true)
    expect(doc.hasRule(Permissions.WRITE, Agents.PUBLIC)).toBe(false)
    expect(doc.hasRule(Permissions.APPEND, Agents.PUBLIC)).toBe(false)
    expect(doc.hasRule(Permissions.CONTROL, Agents.PUBLIC)).toBe(false)
    expect(Object.keys(doc.rules)).toHaveLength(2)
  })
})