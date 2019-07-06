import Permissions from './Permissions'
import Agents from './Agents'
import { iterableEquals } from './utils'

/** @typedef {import("n3").Quad} Quad */
/** @typedef {import("./AclRule").default} AclRule */

/**
 * @typedef {object} AclRuleOptions
 * @property {Quad[]} [otherQuads=[]]
 * @property {string} [default]
 * @property {string} [defaultForNew]
 */

/**
 * @description Groups together permissions, agents and other relevant information for an acl rule
 */
export default class AclRule {
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
    return iterableEquals(this.accessTo, other.accessTo) &&
      this.permissions.equals(other.permissions) &&
      this.agents.equals(other.agents) &&
      this.default === other.default &&
      this.defaultForNew === other.defaultForNew
  }

  /**
   * @param {AclRule} other
   * @returns {boolean}
   */
  includes (other) {
    return iterableEquals(this.accessTo, other.accessTo) && // TODO: Check if a wildcard accessTo exists
      this.permissions.includes(other.permissions) &&
      this.agents.includes(other.agents) &&
      (this.default === other.default || !other.default) &&
      (this.defaultForNew === other.defaultForNew || !other.defaultForNew)
  }

  /**
   * @description Return true when this rule has no effect (No permissions or no agents or no targets)
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
    const otherQuads = first.otherQuads.filter(quad => second.otherQuads.some(otherQuad => quad.equals(otherQuad)))
    const _default = (first.default === second.default) ? first.default : undefined
    const defaultForNew = (first.defaultForNew === second.defaultForNew) ? first.defaultForNew : undefined
    const options = { otherQuads, default: _default, defaultForNew }

    return new AclRule(permissions, agents, accessTo, options)
  }

  /**
   * @description Return new rules with all rules from the first which aren't in the second
   * If the neither the agents nor the permissions are equal, it is split up into two rules
   * accessTo and otherQuads will be set to the first one
   * @param {AclRule} first
   * @param {AclRule} second
   * @returns {AclRule[]}
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

    // e.g. AclRule([READ, WRITE], ['web', 'id']) - AclRule([READ, WRITE], 'web') = AclRule([READ, WRITE], 'id')
    const agents = Agents.subtract(first.agents, second.agents)
    rules.push(new AclRule(first.permissions, agents, first.accessTo, first.otherQuads))

    // e.g. AclRule([READ, WRITE], 'web') - AclRule(READ, 'web') = AclRule(READ, 'web')
    const permissions = Permissions.subtract(first.permissions, second.permissions)
    rules.push(new AclRule(permissions, first.agents, first.accessTo, first.otherQuads))

    return rules.filter(rule => !rule.hasNoEffect())
  }
}
