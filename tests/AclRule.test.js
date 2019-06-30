import AclRule from '../src/AclRule'
import Permissions from '../src/Permissions'
import Agents from '../src/Agents'

const { READ, WRITE, CONTROL } = Permissions

describe('constructor', () => {
  test('can create new AclRule', () => {
    const permissions = new Permissions(READ, WRITE)
    const agents = new Agents()
    agents.addPublic()
    const rule = new AclRule(permissions, agents)
    expect(rule.agents.isPublic()).toBe(true)
    expect(rule.permissions.has(READ, WRITE)).toBe(true)
  })
})

describe('merge', () => {
  test('can merge two rules with the same permissions', () => {
    const permissions = new Permissions(READ, WRITE)
    const first = new AclRule(permissions, new Agents('first'))
    const second = new AclRule(permissions, new Agents('second'))
    expect(first.canBeMerged(second)).toBe(true)
    first.merge(second)
    expect(first.agents.hasWebId('first', 'second')).toBe(true)
  })
  test('canBeMerged returns false if the permissions are not equal', () => {
    const firstPermissions = new Permissions(READ, WRITE)
    const secondPermissions = new Permissions(READ)
    const agents = new Agents('webId')
    const first = new AclRule(firstPermissions, agents)
    const second = new AclRule(secondPermissions, agents)
    expect(first.canBeMerged(second)).toBe(false)
  })
})

describe('split', () => {
  test('split returns one rule per permission', () => {
    const permissions = new Permissions(READ, WRITE, CONTROL)
    const originalRule = new AclRule(permissions, new Agents('web', 'id'))
    const split = originalRule.split()
    expect(split).toHaveLength(3)
    split.forEach(rule => expect(rule.permissions.set.size).toBe(1))
    split.forEach(rule => expect(rule.agents.hasWebId('web', 'id')).toBe(true))
  })
})

describe('clone', () => {
  test('clone returns a new AclRule with equal values', () => {
    const permissions = new Permissions(READ, WRITE)
    const rule = new AclRule(permissions, new Agents('webId'))
    const clone = rule.clone()
    expect(rule === clone).toBe(false)
    expect(rule.permissions === clone.permissions).toBe(false)
    expect(rule.agents === clone.agents).toBe(false)
    expect(rule.equals(clone)).toBe(true)
  })
})
