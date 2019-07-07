import AclDoc from '../src/AclDoc'
import AclRule from '../src/AclRule'
import Permissions from '../src/Permissions'
import Agents from '../src/Agents'

const { READ, WRITE, APPEND, CONTROL } = Permissions

const sampleWebIds = [
  'https://example.first/#me',
  'https://example.second#me',
  'https://example.third/#me'
]

const sampleRules = [
  new AclRule(READ, sampleWebIds[0]),
  new AclRule([READ, WRITE], sampleWebIds[1]),
  new AclRule(WRITE, sampleWebIds[2])
]

const accessTo = 'https://example.org/foo/bar.ext'

/** @type {AclDoc} */
let doc

beforeEach(() => { doc = new AclDoc({ accessTo }) })

describe('addRule', () => {
  test('can add rule by passing AclRule instance', () => {
    doc.addRule(sampleRules[0])
    doc.addRule(sampleRules[1], '#my-id')
    expect(doc.hasRule(sampleRules[0])).toBe(true)
    expect(doc.hasRule(sampleRules[1])).toBe(true)
  })
  test('can add rule by passing rule arguments', () => {
    doc.addRule([READ, WRITE], sampleWebIds)
    doc.addRule(CONTROL, sampleWebIds, { subjectId: '#my-id' })
    expect(doc.hasRule([READ, WRITE], sampleWebIds)).toBe(true)
    expect(doc.hasRule(CONTROL, sampleWebIds)).toBe(true)
  })
  test('overwrites existing subjectId if specified', () => {
    doc.addRule(sampleRules[0], undefined, { subjectId: '#my-id' })
    doc.addRule(sampleRules[1], undefined, { subjectId: '#my-id' })
    expect(doc.hasRule(sampleRules[0])).toBe(false)
    expect(doc.hasRule(sampleRules[1])).toBe(true)
  })
})

describe('hasRule', () => {
  test('returns true if the same rule has been added', () => {
    doc.addRule(sampleRules[0])
    expect(doc.hasRule(sampleRules[0])).toBe(true)
    doc.addRule(READ, Agents.PUBLIC)
    expect(doc.hasRule(READ, Agents.PUBLIC)).toBe(true)
  })
  test('returns false if no permissions are granted', () => {
    expect(doc.hasRule(READ, Agents.PUBLIC)).toBe(false)
  })
  test('returns true for any subsets of an added rule', () => {
    doc.addRule([READ, WRITE], sampleWebIds)

    expect(doc.hasRule([READ, WRITE], sampleWebIds)).toBe(true)
    expect(doc.hasRule(READ, sampleWebIds)).toBe(true)
    expect(doc.hasRule([READ, WRITE], sampleWebIds.slice(1))).toBe(true)
    expect(doc.hasRule(WRITE, sampleWebIds[0])).toBe(true)
  })
  test('returns true if rule is stored in multiple subjects', () => {
    doc.addRule(READ, sampleWebIds[0], { subjectId: '#first' })
    doc.addRule(WRITE, sampleWebIds[0], { subjectId: '#second' })
    expect(doc.hasRule([READ, WRITE], sampleWebIds[0])).toBe(true)
  })
  test('returns false if not all permissions are granted', () => {
    doc.addRule(READ, sampleWebIds[0], { subjectId: '#first' })
    doc.addRule(WRITE, sampleWebIds[0], { subjectId: '#second' })
    expect(doc.hasRule([READ, WRITE, CONTROL], sampleWebIds[0])).toBe(false)
  })
})

describe('getRuleBySubjectId', () => {
  test('returns rule with this id if existing', () => {
    const rule = new AclRule([READ, WRITE], sampleWebIds)
    doc.addRule(rule, undefined, { subjectId: '#my-id' })
    expect(doc.getRuleBySubjectId('#my-id').equals(rule)).toBe(true)
  })
  test('returns undefined if no rule with that id exists', () => {
    expect(doc.getRuleBySubjectId('#inexistent')).toBe(undefined)
  })
})

describe('deleteBySubjectId', () => {
  test('deletes completely if no rule is specified', () => {
    doc.addRule(sampleRules[0], undefined, { subjectId: '#my-id' })
    doc.deleteBySubjectId('#my-id')
    expect(Object.keys(doc.rules)).toHaveLength(0)
  })
  test('deletes completely if clone of rule is passed', () => {
    doc.addRule(sampleRules[0], undefined, { subjectId: '#my-id' })
    doc.deleteBySubjectId('#my-id', sampleRules[0].clone())
    expect(Object.keys(doc.rules)).toHaveLength(0)
  })
  test('deletes partial if only permissions differ', () => {
    doc.addRule([READ, WRITE], sampleWebIds, { subjectId: '#my-id' })
    doc.deleteBySubjectId('#my-id', READ, sampleWebIds)
    const rule = doc.getRuleBySubjectId('#my-id')
    expect(rule).toBeDefined()
    expect(rule.permissions.has(READ)).toBe(false)
    expect(rule.permissions.has(WRITE)).toBe(true)
    expect(rule.agents.hasWebId(...sampleWebIds)).toBe(true)
    expect(Object.keys(doc.rules)).toHaveLength(1)
  })
  test('deletes partial if only agents differ', () => {
    doc.addRule([READ, WRITE], sampleWebIds, { subjectId: '#my-id' })
    doc.deleteBySubjectId('#my-id', [READ, WRITE], sampleWebIds.slice(1))
    const rule = doc.getRuleBySubjectId('#my-id')
    expect(rule).toBeDefined()
    expect(rule.permissions.has(READ, WRITE)).toBe(true)
    expect(rule.agents.hasWebId(sampleWebIds[0])).toBe(true)
    expect(rule.agents.hasWebId(...sampleWebIds.slice(1))).toBe(false)
    expect(Object.keys(doc.rules)).toHaveLength(1)
  })
  test('splits up if permissions and agents differ', () => {
    doc.addRule([READ, WRITE], sampleWebIds, { subjectId: '#my-id' })
    doc.deleteBySubjectId('#my-id', READ, sampleWebIds[0])
    expect(doc.hasRule([READ, WRITE], sampleWebIds.slice(1))).toBe(true)
    expect(doc.hasRule([READ, WRITE], sampleWebIds[0])).toBe(false)
    expect(doc.hasRule(WRITE, sampleWebIds[0])).toBe(true)
    expect(Object.keys(doc.rules)).toHaveLength(2)
  })
})

describe('deleteRule', () => {
  test('deletes combination of permissions and agents from the doc', () => {
    doc.addRule([READ, WRITE], sampleWebIds)
    doc.addRule([APPEND, CONTROL], sampleWebIds[0])

    doc.deleteRule([READ, APPEND], sampleWebIds[0])

    // Other webIds are not affected
    expect(doc.hasRule([READ, WRITE], sampleWebIds.slice(1))).toBe(true)

    // sampleWebIds[0] doesn't has READ and CONTROL anymore
    expect(doc.hasRule(READ, sampleWebIds[0])).toBe(false)
    expect(doc.hasRule(APPEND, sampleWebIds[0])).toBe(false)

    // sampleWebIds[0] still has WRITE and CONTROL
    expect(doc.hasRule([WRITE, CONTROL], sampleWebIds[0])).toBe(true)
  })
})

describe('deletePermissions', () => {
  test('deletes specified permissions from all rules', () => {
    doc.addRule([READ, WRITE], sampleWebIds[0])
    doc.addRule([READ, WRITE, CONTROL], sampleWebIds[1])
    doc.addRule([READ, APPEND], sampleWebIds[2])

    doc.deletePermissions(READ, WRITE)

    for (let i = 0; i < 3; i++) {
      expect(doc.hasRule(READ, sampleWebIds[i])).toBe(false)
      expect(doc.hasRule(WRITE, sampleWebIds[i])).toBe(false)
    }
    expect(doc.hasRule(CONTROL, sampleWebIds[1])).toBe(true)
    expect(doc.hasRule(APPEND, sampleWebIds[2])).toBe(true)
  })
})

describe('deleteAgents', () => {
  test('deletes specified agents from all rules', () => {
    doc.addRule(READ, Agents.PUBLIC)
    doc.addRule([READ, WRITE], sampleWebIds)

    const agents = new Agents(sampleWebIds[0])
    agents.addPublic()
    doc.deleteAgents(agents)

    expect(doc.hasRule(READ, Agents.PUBLIC)).toBe(false)
    expect(doc.hasRule(READ, sampleWebIds[0])).toBe(false)
    expect(doc.hasRule(WRITE, sampleWebIds[0])).toBe(false)
    expect(doc.hasRule([READ, WRITE], sampleWebIds.slice(1))).toBe(true)
  })
})

describe('getPermissionsFor', () => {
  test('returns all permissions which have been granted to a single agent', () => {
    doc.addRule(READ, Agents.PUBLIC)
    doc.addRule([READ, WRITE], sampleWebIds)

    expect(doc.getPermissionsFor(sampleWebIds[0]).has(READ, WRITE)).toBe(true)
    expect(doc.getPermissionsFor(sampleWebIds[0]).has(APPEND)).toBe(false)
    expect(doc.getPermissionsFor(Agents.PUBLIC).has(READ)).toBe(true)
    expect(doc.getPermissionsFor(Agents.PUBLIC).has(WRITE)).toBe(false)
  })
  test('returns all permissions which have been granted to multiple webIds', () => {
    doc.addRule(READ, sampleWebIds[0])
    doc.addRule(READ, sampleWebIds[1])
    doc.addRule([READ, WRITE], sampleWebIds[2])

    const permissions = doc.getPermissionsFor(sampleWebIds.slice(0, 2))
    expect(permissions.has(READ)).toBe(true)
    expect(permissions.has(WRITE)).toBe(false)
  })
})

describe('getAgentsWith', () => {
  test('returns all agents with single permissions', () => {
    doc.addRule(READ, Agents.PUBLIC)
    doc.addRule([READ, WRITE], sampleWebIds.slice(1))

    const agents = doc.getAgentsWith(READ)
    expect(agents.hasPublic()).toBe(true)
    expect(agents.hasAuthenticated()).toBe(false)
    expect(agents.hasWebId(...sampleWebIds.slice(1))).toBe(true)
    expect(agents.hasWebId(sampleWebIds[0])).toBe(false)
  })
  test('returns all agents with combination of permissions', () => {
    doc.addRule(READ, Agents.PUBLIC)
    doc.addRule([READ, WRITE], sampleWebIds[0])
    doc.addRule([READ, WRITE, CONTROL], sampleWebIds[1])
    doc.addRule([READ, APPEND], sampleWebIds[2])

    const agents = doc.getAgentsWith([READ, WRITE])
    expect(agents.hasPublic()).toBe(false)
    expect(agents.hasWebId(sampleWebIds[0])).toBe(true)
    expect(agents.hasWebId(sampleWebIds[1])).toBe(true)
    expect(agents.hasWebId(sampleWebIds[2])).toBe(false)
  })
})

describe('equals', () => {
  test('returns false for docs with different accessTo values', () => {
    const otherDoc = new AclDoc({ accessTo: 'different' })
    expect(doc.equals(otherDoc)).toBe(false)
  })
  test('returns true for empty docs with same accessTo values', () => {
    const otherDoc = new AclDoc({ accessTo })
    expect(doc.equals(otherDoc)).toBe(true)
  })
  test('returns true for docs which have been added the same rules', () => {
    const otherDoc = new AclDoc({ accessTo })
    doc.addRule(sampleRules[0])
      .addRule(sampleRules[1])
    otherDoc.addRule(sampleRules[0])
      .addRule(sampleRules[1])

    expect(doc.equals(otherDoc)).toBe(true)
  })
  test('returns false for docs which have been added different rules', () => {
    const otherDoc = new AclDoc({ accessTo })
    doc.addRule(sampleRules[1])
      .addRule(sampleRules[0])
    otherDoc.addRule(sampleRules[1])
      .addRule(sampleRules[2])

    expect(doc.equals(otherDoc)).toBe(false)
  })
  test('returns false if otherQuads are not the same', () => {
    const otherDoc = new AclDoc({ accessTo })
    doc.addOther('test')
    expect(doc.equals(otherDoc)).toBe(false)
  })
})

describe('addOther', () => {
  test('adds quad to otherQuads', () => {
    const quads = [1, 2, 3, 4]
    doc.addOther(...quads)
    expect(doc.otherQuads).toEqual(quads)
  })
})

describe('getMinifiedRules', () => {
  test('no rules with no effect are included', () => {
    doc.addRule([], Agents.PUBLIC)
    doc.addRule(Permissions.ALL, [])
    doc.minimizeRules()
    expect(Object.keys(doc.rules)).toHaveLength(0)
  })
})

describe('chainable methods', () => {
  test('can chain methods which support it', () => {
    doc.addRule(READ, Agents.PUBLIC, { subjectId: '#public' })
      .addRule(WRITE, sampleWebIds)
      .deleteBySubjectId('#public')
      .deleteAgents(sampleWebIds)
      .minimizeRules()

    expect(Object.keys(doc.rules)).toHaveLength(0)

    doc.addRule(READ, Agents.PUBLIC, { subjectId: '#public' })
      .deleteRule(READ, Agents.PUBLIC)
      .addRule([READ, WRITE], sampleWebIds)
      .deletePermissions(READ, WRITE)
      .addOther('test')
      .minimizeRules()

    expect(Object.keys(doc.rules)).toHaveLength(0)
  })
})
