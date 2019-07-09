import prefixes from './prefixes'
import { iterableEquals } from './utils'

/**
 * @module Permissions
 */

const permissionLinks = {
  READ: `${prefixes.acl}Read`,
  WRITE: `${prefixes.acl}Write`,
  APPEND: `${prefixes.acl}Append`,
  CONTROL: `${prefixes.acl}Control`
} as Record<string, permissionString> 

export type permissionString = 'http://www.w3.org/ns/auth/acl#Read' |
  'http://www.w3.org/ns/auth/acl#Write' |
  'http://www.w3.org/ns/auth/acl#Append' |
  'http://www.w3.org/ns/auth/acl#Control'

export type PermissionsCastable = Permissions | permissionString | permissionString[] | undefined

/**
 * @alias module:Permissions
 * @example
 * const { READ, WRITE, APPEND, CONTROL } = Permissions
 * // Create a new permissions instance with READ and WRITE permission
 * const permissions = new Permissions(READ, WRITE)
 * permissions.add(APPEND)
 * permissions.has(READ, WRITE, APPEND) // true
 * permissions.delete(APPEND)
 * permissions.has(APPEND) // false
 *
 * // It has an inbuilt iterator which allows a for-each loop and using the spread syntax
 * for (const perm of permissions) {
 *   console.log(perm)
 * }
 * [...perm].forEach(perm => console.log(perm))
 */
class Permissions {
  public readonly permissions: Set<permissionString>

  constructor (...permissions: permissionString[]) {
    this.permissions = new Set()
    this.add(...permissions)
  }

  add (...permissions: permissionString[]) {
    this._assertValidPermissions(...permissions)
    permissions.forEach(perm => this.permissions.add(perm))
    return this
  }

  has (...permissions: permissionString[]) {
    return permissions.every(permission => this.permissions.has(permission))
  }

  delete (...permissions: permissionString[]) {
    permissions.forEach(permission => this.permissions.delete(permission))
    return this
  }

  equals (other: Permissions) {
    return iterableEquals(this.permissions, other.permissions)
  }

  includes (other: Permissions) {
    return this.has(...other.permissions)
  }

  clone () {
    return new Permissions(...this.permissions)
  }

  /**
   * @description Return true when no permissions are stored
   * @returns {boolean}
   */
  isEmpty () {
    return this.permissions.size === 0
  }

  _assertValidPermissions (...permissions: permissionString[]) {
    // Sanity check to only accept valid permissions
    const validPermissions = Object.values(permissionLinks)
    for (const perm of permissions) {
      if (!validPermissions.includes(perm)) {
        let msg = `Invalid permission: ${perm}\n`
        msg += `Please use one of: ${JSON.stringify(validPermissions)}`
        throw new Error(msg)
      }
    }
  }

  /**
   * @description Make a permissions instance iterable
   * @returns {IterableIterator<permissionString>}
   */
  [Symbol.iterator] () {
    return this.permissions.values()
  }

  static from (): Permissions
  static from (firstVal: PermissionsCastable): Permissions
  static from (firstVal: PermissionsCastable, ...val: permissionString[]): Permissions
  static from (firstVal?: PermissionsCastable, ...val: permissionString[]) {
    if (firstVal instanceof Permissions) {
      return firstVal.clone()
    }
    if (Array.isArray(firstVal)) {
      return new Permissions(...firstVal)
    }
    if (typeof firstVal === 'string') {
      return new Permissions(...[firstVal, ...val].filter(v => !!v))
    }
    if (!firstVal) {
      return new Permissions()
    }
    throw new Error(`Invalid arguments: ${val}`)
  }

  /**
   * @description Return all common permissions
   */
  static common (first: Permissions, second: Permissions) {
    const commonPermissions = [...first.permissions].filter(perm => second.has(perm))
    return new Permissions(...commonPermissions)
  }

  /**
   * @description Return all permissions which are in at least one of [first, second]
   */
  static merge (first: Permissions, second: Permissions) {
    return new Permissions(...first.permissions, ...second.permissions)
  }

  /**
   * @description Return all permissions from the first which aren't in the second
   */
  static subtract (first: Permissions, second: Permissions) {
    const permissions = [...first.permissions].filter(perm => !second.has(perm))
    return new Permissions(...permissions)
  }

  static get READ () { return permissionLinks.READ }
  static get WRITE () { return permissionLinks.WRITE }
  static get APPEND () { return permissionLinks.APPEND }
  static get CONTROL () { return permissionLinks.CONTROL }

  static get ALL () { return new Permissions(...Object.values(permissionLinks)) }
}

export default Permissions
