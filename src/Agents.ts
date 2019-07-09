import { iterableEquals } from './utils'

/**
 * @module Agents
 */

export type AgentsCastable = Agents | string | string[] | undefined

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
  public readonly webIds: Set<string>
  public readonly groups: Set<string>
  public public: boolean
  public authenticated: boolean

  constructor (...webIds: string[]) {
    this.webIds = new Set()
    this.groups = new Set()
    this.public = false
    this.authenticated = false

    this.addWebId(...webIds)
  }

  addWebId (...webIds: string[]) {
    webIds.forEach(webId => this.webIds.add(webId))
    return this
  }

  hasWebId (...webIds: string[]) {
    return webIds.every(webId => this.webIds.has(webId))
  }

  deleteWebId (...webIds: string[]) {
    webIds.forEach(webId => this.webIds.delete(webId))
    return this
  }

  addGroup (...groups: string[]) {
    groups.forEach(group => this.groups.add(group))
    return this
  }

  hasGroup (...groups: string[]) {
    return groups.every(group => this.groups.has(group))
  }

  deleteGroup (...groups: string[]) {
    groups.forEach(group => this.groups.delete(group))
    return this
  }

  /**
   * @description Access is given to everyone
   */
  addPublic () {
    this.public = true
    return this
  }

  hasPublic () {
    return this.public
  }

  deletePublic () {
    this.public = false
    return this
  }

  /**
   * @description Access is only given to people who have logged on and provided a specific ID
   */
  addAuthenticated () {
    this.authenticated = true
    return this
  }

  hasAuthenticated () {
    return this.authenticated
  }

  deleteAuthenticated () {
    this.authenticated = false
    return this
  }

  clone () {
    const clone = new Agents()

    clone.addWebId(...this.webIds)
    clone.addGroup(...this.groups)
    clone.public = this.public
    clone.authenticated = this.authenticated

    return clone
  }

  equals (other: Agents) {
    return iterableEquals(this.webIds, other.webIds) &&
      iterableEquals(this.groups, other.groups) &&
      this.public === other.public &&
      this.authenticated === other.authenticated
  }

  includes (other: Agents) {
    return this.hasWebId(...other.webIds) &&
      this.hasGroup(...other.groups) &&
      (this.public || !other.public) &&
      (this.authenticated || !other.authenticated)
  }

  isEmpty () {
    return this.webIds.size === 0 &&
      this.groups.size === 0 &&
      !this.public &&
      !this.authenticated
  }

  static from (firstVal: AgentsCastable): Agents
  static from (...val: string[]): Agents
  static from (firstVal: AgentsCastable, ...val: string[]) {
    if (firstVal instanceof Agents) {
      return firstVal.clone()
    }
    if (Array.isArray(firstVal)) {
      return new Agents(...firstVal)
    }
    if (typeof firstVal === 'string') {
      return new Agents(...[firstVal, ...val].filter(v => !!v))
    }
    if (!firstVal) {
      return new Agents()
    }
    throw new Error(`Invalid arguments: ${val}`)
  }

  /**
   * @description Return all common agents
   */
  static common (first: Agents, second: Agents) {
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
   */
  static merge (first: Agents, second: Agents) {
    const merged = first.clone()
    merged.addWebId(...second.webIds)
    merged.addGroup(...second.groups)
    merged.public = merged.public || second.public
    merged.authenticated = merged.authenticated || second.authenticated

    return merged
  }

  /**
   * @description Return all agents from the first which are not in the second
   */
  static subtract (first: Agents, second: Agents) {
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

  static get PUBLIC () {
    const agents = new Agents()
    agents.addPublic()
    return agents
  }

  static get AUTHENTICATED () {
    const agents = new Agents()
    agents.addAuthenticated()
    return agents
  }
}

export default Agents
