import prefixes from './prefixes'

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
    this.set = new Set()
    this.add(permissions)
  }

  /**
   * @param  {...string} permissions
   */
  add (...permissions) {
    this._assertValidPermissions(permissions)
    permissions.forEach(perm => this.set.add(perm))
  }

  /**
   * @param  {string} permission
   * @returns {boolean}
   */
  has (permission) {
    return this.set.has(permission)
  }

  /**
   * @param  {string} permission
   * @returns {boolean} return false if the element didn't exist
   */
  delete (permission) {
    return this.set.delete(permission)
  }

  /**
   * @param  {...string} permissions
   */
  _assertValidPermissions (...permissions) {
    // Sanity check to only accept valid permissions
    if (permissions.some(perm => !permissionLinks.hasOwnProperty(perm))) {
      console.group()
      console.error('Please only provide valid permissions')
      console.error('Got', permissions)
      console.error('Expected one or more of', Object.values(permissionLinks))
      console.groupEnd()
      throw new Error('Invalid permissions: ' + JSON.stringify(permissions))
    }
  }

  static get READ () { return permissionLinks.READ }
  static get WRITE () { return permissionLinks.WRITE }
  static get APPEND () { return permissionLinks.APPEND }
  static get CONTROL () { return permissionLinks.CONTROL }
}
