import { iterableEquals } from './utils'

/**
 * @module Agents
 */

/**
 * @description class describing multiple agents
 * @alias module:Agents
 * @example
 * const webId = 'https://solid.example.org/profile/card#me'
 * const secondWebId = 'https://second.example.org/profile/card#me'
 * const agents = new Agents(webId) // You can pass zero or more webIds to the constructor
 *
 * // Add a single web id
 * agents.addWebId(secondWebId)
 * agents.hasWebId(webId, secondWebId) // true
 * agents.deleteWebId(webId)
 *
 * // Target everyone (note: this doesn't modify other agents like webIds)
 * agents.addPublic()
 * agents.hasPublic() // true
 * agents.deletePublic()
 *
 * // Shortcut for creating new agents and then calling agents.addPublic()
 * const publicAgents = Agents.PUBLIC
 * agents.hasPublic() // true
 */
class Agents {
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
   * @returns {this}
   */
  addWebId (...webIds) {
    webIds.forEach(webId => this.webIds.add(webId))
    return this
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
   * @return {this}
   */
  deleteWebId (...webIds) {
    webIds.forEach(webId => this.webIds.delete(webId))
    return this
  }

  /**
   * @param {...string} [groups] - link to vcard:Group
   * @return {this}
   */
  addGroup (...groups) {
    groups.forEach(group => this.groups.add(group))
    return this
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
   * @returns {this}
   */
  deleteGroup (...groups) {
    groups.forEach(group => this.groups.delete(group))
    return this
  }

  /**
   * @description Access is given to everyone
   * @return {this}
   */
  addPublic () {
    this.public = true
    return this
  }

  /**
   * @returns {boolean}
   */
  hasPublic () {
    return this.public
  }

  /**
   * @returns {this}
   */
  deletePublic () {
    this.public = false
    return this
  }

  /**
   * @description Access is only given to people who have logged on and provided a specific ID
   * @returns {this}
   */
  addAuthenticated () {
    this.authenticated = true
    return this
  }

  /**
   * @returns {boolean}
   */
  hasAuthenticated () {
    return this.authenticated
  }

  /**
   * @returns {this}
   */
  deleteAuthenticated () {
    this.authenticated = false
    return this
  }

  /**
   * @returns {Agents}
   */
  clone () {
    const clone = new Agents()
    clone.addWebId(...this.webIds)
    clone.addGroup(...this.groups)
    if (this.hasPublic()) {
      clone.addPublic()
    }
    if (this.hasAuthenticated()) {
      clone.addAuthenticated()
    }
    return clone
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
   * @returns {Agents}
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
    if (first.hasPublic() && second.hasPublic()) {
      agents.addPublic()
    }
    if (first.hasAuthenticated() && second.hasAuthenticated()) {
      agents.addAuthenticated()
    }
    return agents
  }

  /**
   * @description Return a new Agents instance which includes all agents from first and second
   * @param {Agents} first
   * @param {Agents} second
   * @returns {Agents}
   */
  static merge (first, second) {
    const merged = first.clone()
    merged.addWebId(...second.webIds)
    merged.addGroup(...second.groups)
    merged.public = merged.public || second.public
    merged.authenticated = merged.authenticated || second.authenticated

    return merged
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
    if (first.hasPublic() && !second.hasPublic()) {
      agents.addPublic()
    }
    if (first.hasAuthenticated() && !second.hasAuthenticated()) {
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

export default Agents
