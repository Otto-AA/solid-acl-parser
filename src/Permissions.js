import prefixes from './prefixes'
import { iterableEquals } from './utils'

const permissionLinks = {
  READ: `${prefixes.acl}Read`,
  WRITE: `${prefixes.acl}Write`,
  APPEND: `${prefixes.acl}Append`,
  CONTROL: `${prefixes.acl}Control`
}

export default class Permissions {
  /**
   * @param  {...string} permissions
   */
  constructor (...permissions) {
    /** @type {Set<string>} */
    this.permissions = new Set()
    this.add(...permissions)
  }

  /**
   * @param  {...string} permissions
   * @returns {this}
   */
  add (...permissions) {
    this._assertValidPermissions(...permissions)
    permissions.forEach(perm => this.permissions.add(perm))
    return this
  }

  /**
   * @param  {...string} permissions
   * @returns {boolean}
   */
  has (...permissions) {
    return permissions.every(permission => this.permissions.has(permission))
  }

  /**
   * @param  {...string} permissions
   * @returns {this}
   */
  delete (...permissions) {
    permissions.forEach(permission => this.permissions.delete(permission))
    return this
  }

  /**
   * @param {Permissions} other
   * @returns {boolean}
   */
  equals (other) {
    return iterableEquals(this.permissions, other.permissions)
  }

  /**
   * @param {Permissions} other
   * @returns {boolean}
   */
  includes (other) {
    return this.has(...other.permissions)
  }

  /**
   * @returns {Permissions}
   */
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

  /**
   * @param  {...string} permissions
   */
  _assertValidPermissions (...permissions) {
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
   * @returns {IterableIterator<string>}
   */
  [Symbol.iterator] () {
    return this.permissions.values()
  }

  /**
   * @param {Permissions|...string|string[]} val
   * @returns {Permissions}
   */
  static from (...val) {
    const firstVal = val[0]
    if (firstVal instanceof Permissions) {
      return firstVal.clone()
    }
    if (typeof firstVal === 'string' || typeof firstVal === 'undefined') {
      return new Permissions(...val.filter(v => typeof v !== 'undefined'))
    }
    if (Array.isArray(firstVal)) {
      return new Permissions(...firstVal)
    }
    throw new Error(`Invalid arguments: ${val}`)
  }

  /**
   * @description Return all common permissions
   * @param {Permissions} first
   * @param {Permissions} second
   * @returns {Permissions}
   */
  static common (first, second) {
    const commonPermissions = [...first.permissions].filter(perm => second.has(perm))
    return new Permissions(...commonPermissions)
  }

  /**
   * @description Return all permissions which are in at least one of [first, second]
   * @param {Permissions} first
   * @param {Permissions} second
   * @returns {Permissions}
   */
  static merge (first, second) {
    return new Permissions(...first.permissions, ...second.permissions)
  }

  /**
   * @description Return all permissions from the first which aren't in the second
   * @param {Permissions} first
   * @param {Permissions} second
   * @returns {Permissions}
   */
  static subtract (first, second) {
    const permissions = [...first.permissions].filter(perm => !second.has(perm))
    return new Permissions(...permissions)
  }

  static get READ () { return permissionLinks.READ }
  static get WRITE () { return permissionLinks.WRITE }
  static get APPEND () { return permissionLinks.APPEND }
  static get CONTROL () { return permissionLinks.CONTROL }

  static get ALL () { return new Permissions(...Object.values(permissionLinks)) }
}
