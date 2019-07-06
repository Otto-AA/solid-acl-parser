import { iterableEquals } from './utils'

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
    return iterableEquals(this.webIds, other.webIds) &&
      iterableEquals(this.groups, other.groups) &&
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
   * @param {Agents|...string|string[]} val
   */
  static from (...val) {
    const firstVal = val[0]
    if (firstVal instanceof Agents) {
      return firstVal.clone()
    }
    if (typeof firstVal === 'string' || typeof firstVal === 'undefined') {
      return new Agents(...val.filter(v => typeof v !== 'undefined'))
    }
    if (Array.isArray(firstVal)) {
      return new Agents(...firstVal)
    }
    throw new Error(`Invalid arguments: ${val}`)
  }

  /**
   * @description Return all common agents
   * @param {Agents} first
   * @param {Agents} second
   * @returns {Agents}
   */
  static common (first, second) {
    const agents = new Agents()
    agents.addWebId(...[...first.webIds].filter(webId => second.hasWebId(webId)))
    agents.addGroup(...[...first.groups].filter(group => second.hasGroup(group)))
    if (first.isPublic() && second.isPublic()) {
      agents.addPublic()
    }
    if (first.isAuthenticated() && second.isAuthenticated()) {
      agents.addAuthenticated()
    }
    return agents
  }

  /**
   * @description Return all agents from the first which are not in the second
   * @param {Agents} first
   * @param {Agents} second
   * @returns {Agents}
   */
  static subtract (first, second) {
    const agents = new Agents()
    agents.addWebId(...[...first.webIds].filter(webId => !second.hasWebId(webId)))
    agents.addGroup(...[...first.groups].filter(group => !second.hasGroup(group)))
    if (first.isPublic() && !second.isPublic()) {
      agents.addPublic()
    }
    if (first.isAuthenticated() && !second.isAuthenticated()) {
      agents.addAuthenticated()
    }
    return agents
  }

  /**
   * @returns {Agents}
   */
  static get PUBLIC () {
    const agents = new Agents()
    agents.addPublic()
    return agents
  }

  /**
   * @returns {Agents}
   */
  static get AUTHENTICATED () {
    const agents = new Agents()
    agents.addAuthenticated()
    return agents
  }
}
