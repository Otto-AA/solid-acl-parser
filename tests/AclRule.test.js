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

const accessTo = sampleAccessTos[0]

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
    const first = new AclRule(READ, sampleWebIds[0])
    const second = new AclRule([READ], [sampleWebIds[0]])
    expect(first.equals(second)).toBe(true)
  })
})

describe('equals', () => {
  test('returns true for equal AclRules', () => {
    const options = {
      accessTo,
      otherQuads: [],
      default: 'a-default',
      defaultForNew: 'a-default-for-new'
    }
    const first = new AclRule([READ, WRITE], sampleWebIds, options)
    const second = new AclRule([READ, WRITE], sampleWebIds, options)
    expect(first.equals(second)).toBe(true)
    expect(second.equals(first)).toBe(true)
  })
  test('returns false if at least one permissions is different', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds)
    const second = new AclRule(READ, sampleWebIds)
    expect(first.equals(second)).toBe(false)
  })
  test('returns false if at least one agent is different', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds)
    const second = new AclRule([READ, WRITE], sampleWebIds.slice(1))
    expect(first.equals(second)).toBe(false)
  })
  test('returns false if accessTo is different', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, { accessTo })
    const second = new AclRule([READ, WRITE], sampleWebIds,{ accessTo: sampleAccessTos[1]})
    expect(first.equals(second)).toBe(false)
  })
  test('returns false if otherQuads are not equal', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, { otherQuads: [] })
    const second = new AclRule([READ, WRITE], sampleWebIds, { otherQuads: [{}] })
    expect(first.equals(second)).toBe(false)
  })
  test('returns false if the default options is different', () => {
    const first = new AclRule([READ, WRITE], sampleWebIds, { default: 'first' })
    const second = new AclRule([READ, WRITE], sampleWebIds, { default: 'second' })
    expect(first.equals(second)).toBe(false)
  })
})

describe('hasNoEffect', () => {
  test('returns false on an AclRule with permissions, agents and accessTo', () => {
    expect(AclRule.from(READ, 'web.id', { accessTo: 'test' }).hasNoEffect()).toBe(false)
  })
  test('returns false if otherQuads is not empty', () => {
    expect(AclRule.from([], [], { otherQuads: ['not empty'] }).hasNoEffect()).toBe(false)
  })
  test('returns true on an empty AclRule', () => {
    expect(AclRule.from().hasNoEffect()).toBe(true)
  })
  test('returns true when no permissions are passed', () => {
    expect(AclRule.from([], 'web.id', { accessTo: 'test' }).hasNoEffect()).toBe(true)
  })
  test('returns true when no agents are passed', () => {
    expect(AclRule.from(READ, [], { accessTo: 'test' }).hasNoEffect()).toBe(true)
  })
  test('returns true when no accessTo is passed', () => {
    expect(AclRule.from(READ, 'web.id').hasNoEffect()).toBe(true)
  })
})

describe('clone', () => {
  test('clone returns a new AclRule with equal values', () => {
    const rule = AclRule.from([READ, WRITE], ['web.id'], { otherQuads: ['test'] })
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
    const rule = new AclRule([READ, WRITE], sampleWebIds)
    const clone = AclRule.from(rule)
    expect(rule.equals(clone)).toBe(true)
  })
  test('can use shortcuts of Permissions.from and AclRule.from', () => {
    const rule = AclRule.from([READ, WRITE], 'web.id')
    expect(rule.permissions.has(READ, WRITE)).toBe(true)
    expect(rule.agents.hasWebId('web.id')).toBe(true)
  })
})

describe('AclRule.subtract', () => {
  test('creates copy of first if they have different permissions', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds, { accessTo })
    const second = AclRule.from(APPEND, sampleWebIds, { accessTo })

    const [res1, res2] = AclRule.subtract(first, second)
    expect(first.equals(res1)).toBe(true)
    expect(res2).toBe(undefined)
  })
  test('creates copy of first if they have different agents', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds[0], { accessTo })
    const second = AclRule.from([READ, WRITE], sampleWebIds[1], { accessTo })

    const [res1, res2] = AclRule.subtract(first, second)
    expect(first.equals(res1)).toBe(true)
    expect(res2).toBe(undefined)
  })
  test('creates copy of first if first has a default and it is not equal to second\'s', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds, { default: '#first' })
    const second = AclRule.from([READ, WRITE], sampleWebIds, { default: '#second' })

    const [res1, res2] = AclRule.subtract(first, second)
    expect(first.equals(res1)).toBe(true)
    expect(res2).toBe(undefined)
  })
  test('creates copy of first if accessTo differs', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds, { accessTo: sampleAccessTos[0] })
    const second = AclRule.from([READ, WRITE], sampleWebIds, { accessTo: sampleAccessTos[1] })

    const [res1, res2] = AclRule.subtract(first, second)
    expect(first.equals(res1)).toBe(true)
    expect(res2).toBe(undefined)
  })
  test('returns empty array if called with a clone', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds, { accessTo, default: accessTo })
    const res = AclRule.subtract(first, first.clone())
    expect(res).toHaveLength(0)
  })
  test('creates new AclRules which cover all values of first which are not in second', () => {
    const first = AclRule.from([READ, WRITE], sampleWebIds, { accessTo })
    const second = AclRule.from(READ, sampleWebIds[0], { accessTo })

    const [res1, res2, res3] = AclRule.subtract(first, second)
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
  })
})
