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
  test('can chain add and delete', () => {
    const permissions = new Permissions()
    permissions.add(READ, WRITE)
      .delete(READ)
      .add(CONTROL)
    expect(permissions.has(WRITE, CONTROL)).toBe(true)
    expect(permissions.has(READ)).toBe(false)
  })
  test('throws when trying to add my-invalid-permission', () => {
    expect(() => new Permissions('my-invalid-permission')).toThrowError('Invalid permission')
  })
  test("doesn't throw if deleting inexistent permission", () => {
    const permissions = new Permissions(READ)
    permissions.delete(WRITE)
  })
  test('Permissions.all creates a new Permissions instance with all permissions', () => {
    const permissions = Permissions.ALL
    expect(permissions.has(...validPermissionsArr)).toBe(true)
  })
  describe('Permissions.from', () => {
    test('can use Permissions.from with Permissions instance', () => {
      const permissions = new Permissions(READ, WRITE)
      const newPermissions = Permissions.from(permissions)
      expect(newPermissions.has(READ, WRITE)).toBe(true)
      expect(newPermissions.has(APPEND, CONTROL)).toBe(false)
    })
    test('can use Permissions.from with zero or more strings', () => {
      const permissions = Permissions.from(READ, WRITE)
      expect(permissions.has(READ, WRITE)).toBe(true)
      expect(permissions.has(APPEND, CONTROL)).toBe(false)
      expect(Permissions.from().has(READ)).toBe(false)
    })
    test('can pass one undefined parameter to create empty permissions', () => {
      expect(Permissions.from(undefined).isEmpty()).toBe(true)
    })
    test('can use Permissions.from with string array', () => {
      const permissions = Permissions.from([READ, WRITE])
      expect(permissions.has(READ, WRITE)).toBe(true)
      expect(permissions.has(APPEND, CONTROL)).toBe(false)
    })
    test('throws error with invalid arguments', () => {
      expect(() => Permissions.from(3)).toThrowError(/Invalid arguments/)
      expect(() => Permissions.from(null)).toThrowError(/Invalid arguments/)
      expect(() => Permissions.from({})).toThrowError(/Invalid arguments/)
    })
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

  describe('isEmpty', () => {
    test('returns true if no permissions are stored', () => {
      expect(Permissions.from().isEmpty()).toBe(true)
    })
    test('returns false if one or more permissions are stored', () => {
      expect(Permissions.from(READ).isEmpty()).toBe(false)
      expect(Permissions.from(READ, WRITE).isEmpty()).toBe(false)
    })
  })

  describe('merge', () => {
    test('can merge two distinct permissions', () => {
      const first = new Permissions(READ)
      const second = new Permissions(WRITE, CONTROL)
      const merged = Permissions.merge(first, second)
      expect(merged.has(READ, WRITE, CONTROL)).toBe(true)
    })
    test('can merge permissions with a common permission', () => {
      const first = new Permissions(READ, WRITE)
      const second = new Permissions(WRITE, APPEND)
      const merged = Permissions.merge(first, second)
      expect(merged.has(READ, WRITE, APPEND)).toBe(true)
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

  describe('common', () => {
    test('creates a new Permissions instance with the common permissions', () => {
      const first = new Permissions(READ, WRITE)
      const second = new Permissions(APPEND, WRITE)
      const common = Permissions.common(first, second)
      expect(common.has(WRITE)).toBe(true)
      expect(common.has(READ)).toBe(false)
      expect(common.has(APPEND)).toBe(false)
      expect(common.has(CONTROL)).toBe(false)
    })
  })

  describe('subtract', () => {
    test('creates a new Permissions instance with all permissions from first which are not in second', () => {
      const first = new Permissions(READ, WRITE)
      const second = new Permissions(APPEND, WRITE)
      const common = Permissions.subtract(first, second)
      expect(common.has(READ)).toBe(true)
      expect(common.has(WRITE)).toBe(false)
      expect(common.has(APPEND)).toBe(false)
      expect(common.has(CONTROL)).toBe(false)
    })
  })
})
