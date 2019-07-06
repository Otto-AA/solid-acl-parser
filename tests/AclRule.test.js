import AclRule from '../src/AclRule'
import Permissions from '../src/Permissions'
import Agents from '../src/Agents'

const { READ, WRITE } = Permissions

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
