import AclDoc from '../src/AclDoc'
import AclRule from '../src/AclRule'
import Permissions from '../src/Permissions'
import Agents from '../src/Agents'

const { READ, WRITE, APPEND } = Permissions

const sampleRules = [
  new AclRule(READ, 'https://example.first/#me'),
  new AclRule([READ, WRITE], 'https://example.second#me'),
  new AclRule(WRITE, 'https://example.third/#me')
]

const defaultAccessTo = 'https://example.org/foo/bar.ext'

describe('add and delete rules', () => {
  test('can add and delete multiple rules', () => {
    const doc = new AclDoc({ defaultAccessTo })
    sampleRules.forEach(rule => doc.addRule(rule))
    sampleRules.forEach(rule => expect(doc.hasRule(rule)).toBe(true))

    doc.deletePermissions(WRITE)
    expect(doc.hasRule(sampleRules[0])).toBe(true)
    expect(doc.hasRule(sampleRules[1])).toBe(false)
    expect(doc.hasRule(sampleRules[2])).toBe(false)

    doc.deleteAgents(sampleRules[0].agents)
    sampleRules.forEach(rule => expect(doc.hasRule(rule)).toBe(false))
    expect(doc.hasRule(READ, sampleRules[1].agents)).toBe(true)
  })
  describe('delete', () => {
    test('deleteRule only affects specified permissions and agents', () => {
      const firstAgent = 'https://example.first#me'
      const secondAgent = 'https://example.second#me'
      const thirdAgent = 'https://example.third#me'
      const rules = [
        new AclRule(READ, firstAgent),
        new AclRule([READ, WRITE], secondAgent),
        new AclRule(WRITE, thirdAgent)
      ]
      const doc = new AclDoc({ defaultAccessTo })
      rules.forEach(rule => doc.addRule(rule))

      doc.deleteRule(WRITE, [secondAgent, thirdAgent])

      expect(doc.hasRule(READ, firstAgent)).toBe(true)
      expect(doc.hasRule(READ, secondAgent)).toBe(true)
      expect(doc.hasRule(WRITE, secondAgent)).toBe(false)
      expect(doc.hasRule(WRITE, thirdAgent)).toBe(false)
    })
    test('deletePermissions only affects specified permissions', () => {
      const rule = new AclRule([READ, WRITE], 'https://example.second#me')
      const doc = new AclDoc({ defaultAccessTo })
      doc.addRule(rule)
      doc.deletePermissions(READ)
      expect(doc.hasRule(READ, rule.agents)).toBe(false)
      expect(doc.hasRule(WRITE, rule.agents)).toBe(true)
    })
    test('deleteAgents only affects specified agents', () => {
      const firstAgent = 'https://example.first#me'
      const secondAgent = 'https://example.second#me'
      const rule = new AclRule([READ, WRITE], [firstAgent, secondAgent])
      const doc = new AclDoc({ defaultAccessTo })
      doc.addRule(rule)
      doc.deleteAgents(firstAgent)
      expect(doc.hasRule(READ, firstAgent)).toBe(false)
      expect(doc.hasRule(WRITE, firstAgent)).toBe(false)
      expect(doc.hasRule([READ, WRITE], secondAgent)).toBe(true)
    })
  })

  describe('can use different ways to work with rules', () => {
    test('explicit', () => {
      const doc = new AclDoc({ defaultAccessTo })
      const rule = new AclRule(new Permissions(READ), new Agents('web', 'ids'))
      doc.addRule(rule)
      expect(doc.hasRule(rule)).toBe(true)
      doc.deleteRule(rule)
      expect(doc.hasRule(new AclRule(READ, 'web'))).toBe(false)
    })

    test('casting', () => {
      const doc = new AclDoc({ defaultAccessTo })
      doc.addRule([READ, WRITE], ['web', 'ids'])
      expect(doc.hasRule([READ, WRITE], 'web')).toBe(true)
      expect(doc.hasRule([READ, WRITE], 'ids')).toBe(true)
      doc.deleteRule(READ, ['web', 'ids'])
      expect(doc.hasRule(READ, 'web')).toBe(false)
      expect(doc.hasRule(WRITE, 'web')).toBe(true)

      doc.addRule(APPEND, 'test')
      expect(doc.hasRule(APPEND, 'test')).toBe(true)
    })
  })
})
