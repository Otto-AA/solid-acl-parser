import AclRule from '../src/AclRule'
import Permissions from '../src/Permissions'
import Agents from '../src/Agents'

const { READ, WRITE, APPEND } = Permissions
const sampleWebIds = [
  'https://alice.example.com/profile/card#me',
  'http://solid.example.com/profile/#me',
  'https://example.org/'
]
const sampleAccessTos = [
  'https://alice.example.com/public/',
  'http://solid.example.com/private/file.ext',
  'https://example.org/'
]

describe('constructor', () => {
  test('can create new AclRule', () => {
    const permissions = new Permissions(READ, WRITE)
    const agents = new Agents()
    agents.addPublic()
    const rule = new AclRule(permissions, agents)
    expect(rule.agents.hasPublic()).toBe(true)
    expect(rule.permissions.has(READ, WRITE)).toBe(true)
  })
  test('can use shortcuts for creating new rule', () => {
    const first = new AclRule(READ, sampleWebIds[0], sampleAccessTos[0])
    const second = new AclRule([READ], [sampleWebIds[0]], [sampleAccessTos[0]])
    expect(first.equals(second)).toBe(true)
  })
})

describe('equals', () => {
  test('returns true for equal AclRules', () => {
    const options = {
      otherQuads: [],
      default: 'a-default',
      defaultForNew: 'a-default-for-new'
    }
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, options)
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, options)
    expect(first.equals(second)).toBe(true)
    expect(second.equals(first)).toBe(true)
  })
  test('returns false if at least one permissions is different', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    const second = new AclRule(READ, sampleWebIds, sampleAccessTos)
    expect(first.equals(second)).toBe(false)
  })
  test('returns false if at least one agent is different', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    const second = new AclRule([READ, WRITE], sampleWebIds.slice(1), sampleAccessTos)
    expect(first.equals(second)).toBe(false)
  })
  test.skip('returns false if at least one accessTo is different', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos.slice(1))
    expect(first.equals(second)).toBe(false)
  })
  test('returns false if otherQuads are not equal', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { otherQuads: [] })
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { otherQuads: [{}] })
    expect(first.equals(second)).toBe(false)
  })
  test('returns false if the default options is different', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { default: 'first' })
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { default: 'second' })
    expect(first.equals(second)).toBe(false)
  })
})

/*
describe('includes', () => {
  test('returns true for equal AclRules', () => {
    const options = {
      otherQuads: [],
      default: 'a-default',
      defaultForNew: 'a-default-for-new'
    }
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, options)
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, options)
    expect(first.includes(second)).toBe(true)
    expect(second.includes(first)).toBe(true)
  })
  test('returns true if first contains more permissions than second', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    const second = new AclRule(READ, sampleWebIds, sampleAccessTos)
    expect(first.includes(second)).toBe(true)
  })
  test('returns false if first contains less permissions than second', () => {
    const first = new AclRule(READ, sampleWebIds, sampleAccessTos)
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    expect(first.includes(second)).toBe(false)
  })
  test('returns true if first contains more webIds than second', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    const second = new AclRule([READ, WRITE], sampleWebIds.slice(1), sampleAccessTos)
    expect(first.includes(second)).toBe(true)
  })
  test('returns false if first contains less webIds than second', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds.slice(1), sampleAccessTos)
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    expect(first.includes(second)).toBe(false)
  })
  test('returns true if first contains more accessTos than second', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos.slice(1))
    expect(first.includes(second)).toBe(true)
  })
  test('returns false if first contains less accessTos than second', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos.slice(1))
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    expect(first.includes(second)).toBe(false)
  })
  test('returns true if first contains more otherQuads than second', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { otherQuads: [{}] })
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { otherQuads: [] })
    expect(first.includes(second)).toBe(true)
  })
  test('returns false if first contains less otherQuads than second', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { otherQuads: [] })
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { otherQuads: [{}] })
    expect(first.includes(second)).toBe(false)
  })
  test('returns false if the default options is different', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { default: 'first' })
    const second = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos, { default: 'second' })
    expect(first.equals(second)).toBe(false)
  })
})
*/

describe('hasNoEffect', () => {
  test('returns false on an AclRule with permissions, agents and accessTo', () => {
    expect(AclRule.from(READ, 'web.id', './file.ext').hasNoEffect()).toBe(false)
  })
  test('returns false if otherQuads is not empty', () => {
    expect(AclRule.from([], [], [], { otherQuads: ['not empty'] }).hasNoEffect()).toBe(false)
  })
  test('returns true on an empty AclRule', () => {
    expect(AclRule.from().hasNoEffect()).toBe(true)
  })
  test('returns true when no permissions are passed', () => {
    expect(AclRule.from([], 'web.id', './file.ext').hasNoEffect()).toBe(true)
  })
  test('returns true when no agents are passed', () => {
    expect(AclRule.from(READ, [], './file.ext').hasNoEffect()).toBe(true)
  })
  test('returns true when no accessTo is passed', () => {
    expect(AclRule.from(READ, 'web.id', []).hasNoEffect()).toBe(true)
  })
})

describe('clone', () => {
  test('clone returns a new AclRule with equal values', () => {
    const rule = AclRule.from([READ, WRITE], ['web.id'], sampleAccessTos, { otherQuads: ['test'] })
    const clone = rule.clone()
    expect(rule.equals(clone)).toBe(true)
    expect(rule === clone).toBe(false)
    expect(rule.permissions === clone.permissions).toBe(false)
    expect(rule.agents === clone.agents).toBe(false)
    expect(rule.otherQuads === clone.otherQuads).toBe(false)
  })
})

describe('AclRule.from', () => {
  test('creates empty AclRule if no parameters are passed', () => {
    const rule = AclRule.from()
    expect(rule.hasNoEffect()).toBe(true)
    expect(rule.permissions.isEmpty()).toBe(true)
    expect(rule.agents.isEmpty()).toBe(true)
  })
  test('creates a clone if an AclRule is passed', () => {
    const rule = new AclRule([READ, WRITE], sampleWebIds, sampleAccessTos)
    const clone = AclRule.from(rule)
    expect(rule.equals(clone)).toBe(true)
  })
  test('can use shortcuts of Permissions.from and AclRule.from', () => {
    const rule = AclRule.from([READ, WRITE], 'web.id')
    expect(rule.permissions.has(READ, WRITE)).toBe(true)
    expect(rule.agents.hasWebId('web.id')).toBe(true)
  })
})

describe('AclRule.common', () => {
  test('creates empty AclRule if no values are common', () => {
    const first = AclRule.from(READ, sampleWebIds[0], sampleAccessTos[0])
    const second = AclRule.from(WRITE, sampleWebIds[1], sampleAccessTos[1])
    const common = AclRule.common(first, second)
    expect(common.permissions.isEmpty()).toBe(true)
    expect(common.agents.isEmpty()).toBe(true)
    expect(common.accessTo.length).toBe(0)
  })
  test('creates copy if used with a clone', () => {
    const rule = AclRule.from([READ, WRITE], sampleWebIds, sampleAccessTos)
    const common = AclRule.common(rule, rule.clone())
    expect(rule.equals(common)).toBe(true)
  })
  test('only has common values if the two are distinct', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds, sampleAccessTos.slice(2))
    const second = AclRule.from([WRITE, APPEND], sampleWebIds.slice(1), sampleAccessTos)

    const common = AclRule.common(first, second)
    expect(common.permissions.has(READ)).toBe(false)
    expect(common.permissions.has(WRITE)).toBe(true)
    expect(common.permissions.has(APPEND)).toBe(false)
    expect(common.agents.hasWebId(sampleWebIds[0])).toBe(false)
    expect(common.agents.hasWebId(...sampleWebIds.slice(1))).toBe(true)
    expect(common.accessTo).toEqual(sampleAccessTos.slice(2))
  })
})

describe('AclRule.subtract', () => {
  test('creates copy of first if they have nothing in common', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds, sampleAccessTos.slice(2))
    const second = AclRule.from(APPEND, [], sampleAccessTos[0])

    const [res1, res2] = AclRule.subtract(first, second)
    expect(first.equals(res1)).toBe(true)
    expect(res2).toBe(undefined)
  })
  test('returns empty array if called with a clone', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds, sampleAccessTos.slice(2))
    const res = AclRule.subtract(first, first.clone())
    expect(res).toHaveLength(0)
  })
  test('creates new AclRules which cover all values of first which are not in second', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds, sampleAccessTos)
    const second = AclRule.from(READ, sampleWebIds[0], sampleAccessTos.slice(2))

    const [res1, res2] = AclRule.subtract(first, second)
    expect(res1).toBeDefined()
    expect(res2).toBeDefined()

    // First one is the one for unaffected agents
    expect(res1.permissions.has(READ, WRITE)).toBe(true)
    expect(res1.agents.hasWebId(sampleWebIds[0])).toBe(false)
    expect(res1.agents.hasWebId(...sampleWebIds.slice(1))).toBe(true)

    // Second one has modified permissions and only the affected agents
    expect(res2.permissions.has(READ)).toBe(false)
    expect(res2.permissions.has(WRITE)).toBe(true)
    expect(res2.agents.hasWebId(sampleWebIds[0])).toBe(true)
    expect(res2.agents.hasWebId(...sampleWebIds.slice(1))).toBe(false)

    // accessTo is not modified
    expect(res1.accessTo).toEqual(first.accessTo)
    expect(res2.accessTo).toEqual(first.accessTo)
  })
})
