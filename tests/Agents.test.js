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
    expect(agents.hasPublic()).toBe(true)
    agents.deletePublic()
    expect(agents.hasPublic()).toBe(false)

    // Assure that WebIds and other agents aren't affected by deletePublic
    expect(agents.hasWebId(...sampleWebIds)).toBe(true)
  })
  test('can use authenticated', () => {
    const agents = new Agents()
    agents.addAuthenticated()
    expect(agents.hasAuthenticated()).toBe(true)
    agents.deleteAuthenticated()
    expect(agents.hasAuthenticated()).toBe(false)
  })
  test('can chain add and delete', () => {
    const agents = new Agents()
    agents.addWebId(...sampleWebIds)
      .addGroup(...sampleGroups)
      .deletePublic()
      .deleteAuthenticated()
      .deleteWebId(sampleWebIds[0])
      .deleteGroup(sampleGroups[0])
      .addPublic()
      .addAuthenticated()

    expect(agents.hasWebId(sampleWebIds[0])).toBe(false)
    expect(agents.hasWebId(...sampleWebIds.slice(1))).toBe(true)
    expect(agents.hasGroup(sampleGroups[0])).toBe(false)
    expect(agents.hasGroup(...sampleGroups.slice(1))).toBe(true)
    expect(agents.hasPublic()).toBe(true)
    expect(agents.hasAuthenticated()).toBe(true)
  })

  test('Agents.PUBLIC returns a new agents instance with public', () => {
    const agents = Agents.PUBLIC
    expect(agents.hasPublic()).toBe(true)
    agents.deletePublic()
    expect(agents.isEmpty()).toBe(true)
  })

  test('Agents.AUTHENTICATED returns a new agents instance with authenticated', () => {
    const agents = Agents.AUTHENTICATED
    expect(agents.hasAuthenticated()).toBe(true)
    agents.deleteAuthenticated()
    expect(agents.isEmpty()).toBe(true)
  })

  test('can use merge to get all agents from both instances', () => {
    const first = new Agents(sampleWebIds[0])
    first.addGroup(...sampleGroups)
    const second = new Agents(...sampleWebIds.slice(1))
    second.addGroup(...sampleGroups)
    second.addPublic()

    const merged = Agents.merge(first, second)

    expect(merged.hasWebId(...sampleWebIds)).toBe(true)
    expect(merged.hasGroup(...sampleGroups)).toBe(true)
    expect(merged.hasPublic()).toBe(true)
    expect(merged.hasAuthenticated()).toBe(false)
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

  describe('isEmpty', () => {
    test('returns true if no agents are stored', () => {
      expect(Agents.from().isEmpty()).toBe(true)
    })
    test('returns false if one or more agents are stored', () => {
      let agents = new Agents()
      agents.addWebId(sampleWebIds[0])
      expect(agents.isEmpty()).toBe(false)
      agents = new Agents()
      agents.addGroup(sampleGroups[0])
      expect(agents.isEmpty()).toBe(false)
      agents = new Agents()
      agents.addPublic()
      expect(agents.isEmpty()).toBe(false)
      agents = new Agents()
      agents.addAuthenticated()
      expect(agents.isEmpty()).toBe(false)
    })
  })

  describe('Agents.from', () => {
    test('can use Agents instance which will return a clone', () => {
      const agents = new Agents(...sampleWebIds)
      agents.addPublic()
      const newAgents = Agents.from(agents)
      expect(newAgents.equals(agents))
      expect(newAgents === agents).toBe(false)
    })
    test('can use zero or more web ids', () => {
      expect(Agents.from().isEmpty()).toBe(true)
      expect(Agents.from(sampleWebIds[0]).hasWebId(sampleWebIds[0])).toBe(true)
      expect(Agents.from(...sampleWebIds).hasWebId(...sampleWebIds)).toBe(true)
    })
    test('can pass one undefined value to create empty agents', () => {
      expect(Agents.from(undefined).isEmpty()).toBe(true)
    })
    test('can use array of web ids', () => {
      expect(Agents.from(sampleWebIds).hasWebId(...sampleWebIds)).toBe(true)
    })
    test('throws error if invalid arguments are passed', () => {
      expect(() => Agents.from({})).toThrowError(/Invalid arguments/)
    })
  })

  describe('Agents.common', () => {
    test('creates a new Agents instance with all agents which are in first and second', () => {
      const first = new Agents()
      first.addWebId(...sampleWebIds)
      first.addGroup(...sampleGroups.slice(1))
      first.addPublic()
      const second = new Agents()
      second.addWebId(sampleWebIds[0])
      second.addGroup(...sampleGroups)
      second.addPublic()
      second.addAuthenticated()

      const common = Agents.common(first, second)
      expect(common.hasWebId(sampleWebIds[0])).toBe(true)
      expect(common.hasWebId(...sampleWebIds.slice(1))).toBe(false)
      expect(common.hasGroup(sampleGroups[0])).toBe(false)
      expect(common.hasGroup(...sampleGroups.slice(1))).toBe(true)
      expect(common.hasPublic()).toBe(true)
      expect(common.hasAuthenticated()).toBe(false)
    })
  })

  describe('Agents.subtract', () => {
    test('creates a new Agents instance with all agents from first which are not in second', () => {
      const first = new Agents()
      first.addWebId(...sampleWebIds)
      first.addGroup(...sampleGroups.slice(1))
      first.addPublic()
      first.addAuthenticated()
      const second = new Agents()
      second.addWebId(sampleWebIds[0])
      second.addGroup(...sampleGroups)
      second.addAuthenticated()

      const subtracted = Agents.subtract(first, second)
      expect(subtracted.hasWebId(sampleWebIds[0])).toBe(false)
      expect(subtracted.hasWebId(...sampleWebIds.slice(1))).toBe(true)
      expect(subtracted.hasGroup(sampleGroups[0])).toBe(false)
      expect(subtracted.hasGroup(...sampleGroups.slice(1))).toBe(false)
      expect(subtracted.hasPublic()).toBe(true)
      expect(subtracted.hasAuthenticated()).toBe(false)
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
