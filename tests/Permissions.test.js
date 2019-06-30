import Permissions from '../src/Permissions'

const { READ, WRITE, CONTROL, APPEND } = Permissions
const validPermissions = { READ, WRITE, CONTROL, APPEND }
const validPermissionsArr = Object.values(validPermissions)

describe('add and delete permissions', () => {
  for (const [name, perm] of Object.entries(validPermissions)) {
    test(`can add and remove ${name} and it doesn't exist afterwards`, () => {
      const permissions = new Permissions()
      permissions.add(perm)
      expect(permissions.has(perm)).toBe(true)
      permissions.delete(perm)
      expect(permissions.has(perm)).toBe(false)
    })
  }
  test('can add all valid permissions at once', () => {
    const permissions = new Permissions(...validPermissionsArr)
    expect(permissions.has(...validPermissionsArr)).toBe(true)
  })
  test('throws when trying to add my-invalid-permission', () => {
    expect(() => new Permissions('my-invalid-permission')).toThrowError('Invalid permission')
  })
  test("doesn't throw if deleting inexistent permission", () => {
    const permissions = new Permissions(READ)
    permissions.delete(WRITE)
  })
})

describe('meta functions', () => {
  describe('equals', () => {
    test('returns true for two empty permissions', () => {
      expect((new Permissions()).equals(new Permissions())).toBe(true)
    })
    test('returns true for the same permissions instance', () => {
      const perm = new Permissions(READ, WRITE)
      expect(perm.equals(perm)).toBe(true)
    })
    test('returns true for two instances with the same permissions', () => {
      const first = new Permissions(READ, WRITE)
      const second = new Permissions(WRITE, READ)
      expect(first.equals(second)).toBe(true)
    })
    test('returns false for two instances with different permissions', () => {
      const first = new Permissions(READ, WRITE)
      const second = new Permissions(READ, APPEND)
      expect(first.equals(second)).toBe(false)
    })
  })

  describe('includes', () => {
    test('returns true for two equal permissions', () => {
      const permissions = new Permissions(READ, WRITE)
      expect(permissions.includes(permissions.clone())).toBe(true)
    })
    test('returns true if second is only a subset of first', () => {
      const first = new Permissions(READ, WRITE, CONTROL)
      const second = new Permissions(READ, CONTROL)
      expect(first.includes(second)).toBe(true)
    })
    test('returns false if first is only a subset of second', () => {
      const first = new Permissions(WRITE)
      const second = new Permissions(READ, WRITE)
      expect(first.includes(second)).toBe(false)
    })
    test('returns false if they have different permissions', () => {
      const first = new Permissions(READ)
      const second = new Permissions(WRITE)
      expect(first.includes(second)).toBe(false)
    })
  })

  describe('merge', () => {
    test('can merge two distinct permissions', () => {
      const first = new Permissions(READ)
      const second = new Permissions(WRITE, CONTROL)
      first.merge(second)
      expect(first.has(READ, WRITE, CONTROL)).toBe(true)
    })
    test('can merge permissions with a common permission', () => {
      const first = new Permissions(READ, WRITE)
      const second = new Permissions(WRITE, APPEND)
      first.merge(second)
      expect(first.has(READ, WRITE, APPEND)).toBe(true)
    })
  })

  describe('clone', () => {
    test('returns a new permissions instance with the same values', () => {
      const first = new Permissions(READ, WRITE)
      const clone = first.clone()
      expect(first === clone).toBe(false)
      expect(first.equals(clone)).toBe(true)
    })
  })
})
