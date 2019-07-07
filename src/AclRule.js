import Permissions from './Permissions'
import Agents from './Agents'
import { iterableEquals, iterableIncludesIterable } from './utils'

/**
 * @module AclRule
 */
// /** @typedef {import("n3").Quad} Quad */
// /** @typedef {import("./AclRule").default} AclRule */

/**
 * @typedef {object} AclRuleOptions
 * @property {Quad[]} [otherQuads=[]]
 * @property {string} [default]
 * @property {string} [defaultForNew]
 */

/**
 * @description Groups together permissions, agents and other relevant information for an acl rule
 * @alias module:AclRule
 * @example
 * // Store some data in an AclRule
 * const { READ, WRITE } = Permissions
 * const webId = 'https://solid.example.org/profile/card#me'
 * const accessTo = 'https://solid.pod.org/foo/file.ext' // Could be an array
 *
 * const permissions = new Permissions(READ, WRITE)
 * const agents = new Agents()
 * const rule = new AclRule(permissions, agents, accessTo)
 *
 * // The constructor uses Permissions.from and Agents.from
 * // Therefore we can also specify permissions and webIds like this:
 * const rule = new AclRule([READ, WRITE], [webId], accessTo)
 */
class AclRule {
  /**
   * @param {Permissions} permissions
   * @param {Agents} agents
   * @param {string[]|string} [accessTo=[]]
   * @param {AclRuleOptions} options
   */
  constructor (permissions, agents, accessTo = [], { otherQuads = [], default: _default, defaultForNew } = {}) {
    this.permissions = Permissions.from(permissions)
    this.agents = Agents.from(agents)
    this.accessTo = Array.isArray(accessTo) ? [...accessTo] : [ accessTo ]
    this.otherQuads = [...otherQuads]
    // TODO: Check if multiple defaults should be supported
    this.default = _default
    this.defaultForNew = defaultForNew
  }

  /**
   * @returns {AclRule}
   */
  clone () {
    const { otherQuads, default: _default, defaultForNew } = this
    const options = {
      otherQuads,
      defaultForNew,
      default: _default
    }

    return new AclRule(this.permissions, this.agents, this.accessTo, options)
  }

  /**
   * @param {AclRule} other
   * @returns {boolean}
   */
  equals (other) {
    // TODO: Add accessTo?
    return iterableEquals(this.otherQuads, other.otherQuads) &&
      this.permissions.equals(other.permissions) &&
      this.agents.equals(other.agents) &&
      this.default === other.default &&
      this.defaultForNew === other.defaultForNew
  }

  /**
   * @param {AclRule} other
   * @returns {boolean}
   */
  // NOTE: This is only left in case it will be used in the future. Feel free to delete this and the tests in AclRule.test.js
  // includes (other) {
  //   return iterableIncludesIterable(this.accessTo, other.accessTo) &&
  //     iterableIncludesIterable(this.otherQuads, other.otherQuads) &&
  //     this.permissions.includes(other.permissions) &&
  //     this.agents.includes(other.agents) &&
  //     (this.default === other.default || !other.default) &&
  //     (this.defaultForNew === other.defaultForNew || !other.defaultForNew)
  // }

  /**
   * @description Return true when this rule has no effect (No permissions or no agents or no targets).
   * To prevent unexpected errors it will return false if any unknown statements (quads) are stored
   * @returns {boolean}
   */
  hasNoEffect () {
    return this.otherQuads.length === 0 && (
      this.permissions.isEmpty() ||
      this.agents.isEmpty() ||
      this.accessTo.length === 0
    )
  }

  /**
   * @param {AclRule|Permissions|string|string[]} first
   * @param {Agents|string|string[]} [agents]
   * @param {string[]} [accessTo]
   * @param {AclRuleOptions} [options]
   * @returns {AclRule}
   */
  static from (first, agents, accessTo = [], options) {
    if (first instanceof AclRule) {
      return first.clone()
    }
    return new AclRule(first, agents, accessTo, options)
  }

  /**
   * @description Return a new rule with all common permissions, agents, accessTo and quads
   * @param {AclRule} first
   * @param {AclRule} second
   * @returns {AclRule}
   */
  static common (first, second) {
    const permissions = Permissions.common(first.permissions, second.permissions)
    const agents = Agents.common(first.agents, second.agents)
    const accessTo = first.accessTo.filter(val => second.accessTo.includes(val))

    const options = {}
    options.otherQuads = first.otherQuads.filter(quad => second.otherQuads.some(otherQuad => quad.equals(otherQuad)))
    options.default = (first.default === second.default) ? first.default : undefined
    options.defaultForNew = (first.defaultForNew === second.defaultForNew) ? first.defaultForNew : undefined

    return new AclRule(permissions, agents, accessTo, options)
  }

  /**
   * @description Return new rules with all rules from the first which aren't in the second
   * If the neither the agents nor the permissions are equal, it is split up into two rules
   * accessTo and otherQuads will be set to the first one
   * @param {AclRule} first
   * @param {AclRule} second
   * @returns {AclRule[]} Array containing zero, one or two AclRule instances.
   * If two are returned, the first one is the rule for the unaffected agents
   * @example
   * const first = new AclRule([READ, WRITE], ['web', 'id'])
   * const second = new AclRule(READ, 'web')
   * console.log(AclRule.subtract(first, second))
   * // == [
   * //   AclRule([READ, WRITE], ['id']),
   * //   AclRule(WRITE, 'web')
   * // ]
   */
  static subtract (first, second) {
    /** @type {AclRule[]} */
    const rules = []

    // Add rule for all unaffected agents
    // e.g. AclRule([READ, WRITE], ['web', 'id']) - AclRule([READ, WRITE], 'web') = AclRule([READ, WRITE], 'id')
    const unaffectedAgents = Agents.subtract(first.agents, second.agents)
    rules.push(new AclRule(first.permissions, unaffectedAgents, first.accessTo, first.otherQuads))

    // Add rule for all unaffected permissions but affected agents
    // e.g. AclRule([READ, WRITE], 'web') - AclRule(READ, 'web') = AclRule(READ, 'web')
    const unaffectedPermissions = Permissions.subtract(first.permissions, second.permissions)
    const commonAgents = Agents.common(first.agents, second.agents)
    rules.push(new AclRule(unaffectedPermissions, commonAgents, first.accessTo, first.otherQuads))

    return rules.filter(rule => !rule.hasNoEffect())
  }
}

export default AclRule
