import Agents from '../src/Agents'

const sampleWebIds = [
  'https://alice.example.com/profile/card#me',
  'http://solid.example.com/profile/#me',
  'https://example.org/'
]
const sampleGroups = [
  'https://alice.example.com/work-groups#Accounting',
  'https://alice.example.com/work-groups#Work',
  'https://bob.example.com/work-groups#Family'
]

describe('create and manipulate agents', () => {
  test('can use constructor to add multiple webIds', () => {
    const agents = new Agents(...sampleWebIds)
    sampleWebIds.forEach(webId => expect(agents.hasWebId(webId)).toBe(true))
  })
  test('can add and remove all webIds and groups', () => {
    const agents = new Agents()
    agents.addWebId(...sampleWebIds)
    agents.addGroup(...sampleGroups)

    expect(agents.hasWebId(...sampleWebIds)).toBe(true)
    expect(agents.hasGroup(...sampleGroups)).toBe(true)

    agents.deleteWebId(...sampleWebIds)
    agents.deleteGroup(...sampleGroups)

    expect(agents.hasWebId(...sampleWebIds)).toBe(false)
    expect(agents.hasGroup(...sampleGroups)).toBe(false)
  })
  test('can use public', () => {
    const agents = new Agents(...sampleWebIds)
    agents.addPublic()
    expect(agents.isPublic()).toBe(true)
    agents.deletePublic()
    expect(agents.isPublic()).toBe(false)

    // WebIds and other agents aren't affected by deletePublic
    expect(agents.hasWebId(...sampleWebIds)).toBe(true)
  })
  test('can use authenticated', () => {
    const agents = new Agents()
    agents.addAuthenticated()
    expect(agents.isAuthenticated()).toBe(true)
    agents.deleteAuthenticated()
    expect(agents.isAuthenticated()).toBe(false)
  })

  test('can use delete to remove all agents from other agents instance', () => {
    const first = new Agents(...sampleWebIds)
    first.addGroup(...sampleGroups)
    first.addPublic()
    first.addAuthenticated()
    const second = new Agents(...sampleWebIds.slice(1))
    second.addGroup(...sampleGroups)
    second.addPublic()

    first.delete(second)

    expect(first.hasWebId(sampleWebIds[0])).toBe(true)
    expect(first.hasWebId(...sampleWebIds.slice(1))).toBe(false)
    expect(first.hasGroup(...sampleGroups)).toBe(false)
    expect(first.isPublic()).toBe(false)
    expect(first.isAuthenticated()).toBe(true)
  })

  test('can use merge to get all agents from both instances', () => {
    const first = new Agents(sampleWebIds[0])
    first.addGroup(...sampleGroups)
    const second = new Agents(...sampleWebIds.slice(1))
    second.addGroup(...sampleGroups)
    second.addPublic()

    first.merge(second)

    expect(first.hasWebId(...sampleWebIds)).toBe(true)
    expect(first.hasGroup(...sampleGroups)).toBe(true)
    expect(first.isPublic()).toBe(true)
    expect(first.isAuthenticated()).toBe(false)
  })
})

describe('meta methods', () => {
  describe('equals', () => {
    test('two empty agents are equal', () => {
      expect((new Agents()).equals(new Agents())).toBe(true)
    })
    test('one instance euqlas itself', () => {
      const agents = new Agents(...sampleWebIds)
      expect(agents.equals(agents)).toBe(true)
    })
    test('two agents instances with the same values are equal', () => {
      const first = new Agents(...sampleWebIds)
      first.addGroup(...sampleGroups)
      first.addPublic()
      first.addAuthenticated()
      const second = new Agents(...sampleWebIds)
      second.addGroup(...sampleGroups)
      second.addPublic()
      second.addAuthenticated()
      expect(first.equals(second)).toBe(true)
    })
    test('two different agents instances are not equal', () => {
      const first = new Agents(...sampleWebIds)
      first.addPublic()
      const second = new Agents(...sampleWebIds)
      expect(first.equals(second)).toBe(false)
    })
  })

  describe('includes', () => {
    test('returns true if both have the same values', () => {
      const first = new Agents(...sampleWebIds)
      first.addPublic()
      const clone = first.clone()
      expect(first.includes(clone)).toBe(true)
      expect(clone.includes(first)).toBe(true)
    })
    test('returns true if second is a subset of first, else false', () => {
      const first = new Agents(...sampleWebIds)
      first.addPublic()
      const second = new Agents(sampleWebIds[0])
      second.addPublic()
      expect(first.includes(second)).toBe(true)
      expect(second.includes(first)).toBe(false)
    })
  })

  describe('clone', () => {
    test('returns a new Agents instance with the same values', () => {
      const first = new Agents(...sampleWebIds)
      first.addPublic()
      const clone = first.clone()
      expect(first === clone).toBe(false)
      expect(first.equals(clone)).toBe(true)
    })
  })
  test('agents.webIds is of the type Set', () => {
    const agents = new Agents(...sampleWebIds)
    expect(agents.webIds).toEqual(expect.any(Set))
  })
  test('agents.groups is of the type Set', () => {
    const agents = new Agents()
    agents.addGroup(...sampleGroups)
    expect(agents.groups).toEqual(expect.any(Set))
  })
})
