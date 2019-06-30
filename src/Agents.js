import { setEquals } from './setUtils'

/**
 * @description class describing multiple agents
 */
export default class Agents {
  /**
   * @param {...string} [webIds]
   */
  constructor (...webIds) {
    this.webIds = new Set()
    this.groups = new Set()
    this.public = false
    this.authenticated = false

    this.addWebId(...webIds)
  }

  /**
   * @param {...string} [webIds]
   */
  addWebId (...webIds) {
    webIds.forEach(webId => this.webIds.add(webId))
  }

  /**
   * @param {...string} webIds
   * @returns {boolean}
   */
  hasWebId (...webIds) {
    return webIds.every(webId => this.webIds.has(webId))
  }

  /**
   * @param {...string} webIds
   */
  deleteWebId (...webIds) {
    webIds.forEach(webId => this.webIds.delete(webId))
  }

  /**
   * @param {...string} [groups] - instance of vcard:Group
   */
  addGroup (...groups) {
    groups.forEach(group => this.groups.add(group))
  }

  /**
   * @param {...string} groups
   * @returns {boolean}
   */
  hasGroup (...groups) {
    return groups.every(group => this.groups.has(group))
  }

  /**
   * @param {...string} groups
   */
  deleteGroup (...groups) {
    groups.forEach(group => this.groups.delete(group))
  }

  /**
   * @description Access is given to everyone
   */
  addPublic () {
    this.public = true
  }

  isPublic () {
    return this.public
  }

  deletePublic () {
    this.public = false
  }

  /**
   * @description Access is only given to people who have logged on and provided a specific ID
   */
  addAuthenticated () {
    this.authenticated = true
  }

  isAuthenticated () {
    return this.authenticated
  }

  deleteAuthenticated () {
    this.authenticated = false
  }

  /**
   * @param {Agents} other
   */
  merge (other) {
    this.addWebId(...other.webIds)
    this.addGroup(...other.groups)
    this.public = this.public || other.public
    this.authenticated = this.authenticated || other.authenticated
  }

  /**
   * @description Delete all agents from this which are in common with the other
   * @param {Agents} other
   */
  delete (other) {
    this.deleteWebId(...other.webIds)
    this.deleteGroup(...other.groups)
    this.public = this.public && !other.public
    this.authenticated = this.authenticated && !other.authenticated
  }

  /**
   * @returns {Agents}
   */
  clone () {
    const agents = new Agents()
    agents.addWebId(...this.webIds)
    agents.addGroup(...this.groups)
    if (this.isPublic()) {
      agents.addPublic()
    }
    if (this.isAuthenticated()) {
      agents.addAuthenticated()
    }
    return agents
  }

  /**
   * @param {Agents} other
   * @returns {boolean}
   */
  equals (other) {
    return setEquals(this.webIds, other.webIds) &&
      setEquals(this.groups, other.groups) &&
      this.public === other.public &&
      this.authenticated === other.authenticated
  }

  /**
   * @param {Agents} other
   * @returns {boolean}
   */
  includes (other) {
    return this.hasWebId(...other.webIds) &&
      this.hasGroup(...other.groups) &&
      (this.public || !other.public) &&
      (this.authenticated || !other.authenticated)
  }

  /**
   * @returns {boolean}
   */
  isEmpty () {
    return this.webIds.size === 0 &&
      this.groups.size === 0 &&
      !this.public &&
      !this.authenticated
  }

  /**
   * @param {Agents|string|string[]} val
   */
  static from (val) { // TODO: Test
    if (val instanceof Agents) {
      return val.clone()
    }
    if (typeof val === 'string') {
      return new Agents(val)
    }
    if (Array.isArray(val)) {
      return new Agents(...val)
    }
    throw new Error('Invalid args', val)
  }
}
