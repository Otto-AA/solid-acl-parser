import { Quad } from 'n3'
import Permissions, { PermissionsCastable } from './Permissions'
import Agents, { AgentsCastable } from './Agents'
import { iterableEquals } from './utils'

/**
 * @module AclRule
 */

interface AclRuleOptions {
  accessTo?: string
  otherQuads?: Quad[]
  default?: string
  defaultForNew?: string
}

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
  public permissions: Permissions
  public agents: Agents
  public accessTo?: string
  public otherQuads: Quad[]
  public default?: string
  public defaultForNew?: string

  constructor (permissions?: PermissionsCastable, agents?: AgentsCastable, options: AclRuleOptions = {}) {
    this.permissions = Permissions.from(permissions)
    this.agents = Agents.from(agents)
    this.accessTo = options.accessTo
    this.otherQuads = options.otherQuads ? [...options.otherQuads] : []
    this.default = options.default
    this.defaultForNew = options.defaultForNew
  }

  clone () {
    const options = AclRule._getOptions(this)

    return new AclRule(this.permissions, this.agents, options)
  }

  equals (other: AclRule) {
    return other instanceof AclRule &&
      iterableEquals(this.otherQuads, other.otherQuads) &&
      this.accessTo === other.accessTo &&
      this.permissions.equals(other.permissions) &&
      this.agents.equals(other.agents) &&
      this.default === other.default &&
      this.defaultForNew === other.defaultForNew
  }

  /**
   * @description Return true when this rule has no effect (No permissions or no agents or no targets).
   * To prevent unexpected errors it will return false if any unknown statements (quads) are stored
   */
  hasNoEffect () {
    return this.otherQuads.length === 0 && (
      this.permissions.isEmpty() ||
      this.agents.isEmpty() ||
      !this.accessTo
    )
  }

  static from (firstVal: AclRule|PermissionsCastable, agents?: AgentsCastable, options?: AclRuleOptions) {
    if (firstVal instanceof AclRule) {
      return firstVal.clone()
    }
    return new AclRule(firstVal, agents, options)
  }

  /**
   * @description Return new rules with all rules from the first which aren't in the second
   * If the neither the agents nor the permissions are equal, it is split up into two rules
   * otherQuads will be set to the first one.
   * If accessTo is not equal or the first has a default value and it is not equal to the other
   * it returns a copy of the first.
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
  static subtract (first: AclRule, second: AclRule) {
    const rules: AclRule[] = []
    const firstOptions = AclRule._getOptions(first)

    if ((first.default && first.default !== second.default) ||
        first.accessTo !== second.accessTo) {
      return [first.clone()]
    }

    // Add rule for all unaffected agents
    // e.g. AclRule([READ, WRITE], ['web', 'id']) - AclRule([READ, WRITE], 'web') = AclRule([READ, WRITE], 'id')
    const unaffectedAgents = Agents.subtract(first.agents, second.agents)
    rules.push(new AclRule(first.permissions, unaffectedAgents, firstOptions))

    // Add rule for all unaffected permissions but affected agents
    // e.g. AclRule([READ, WRITE], 'web') - AclRule(READ, 'web') = AclRule(READ, 'web')
    const unaffectedPermissions = Permissions.subtract(first.permissions, second.permissions)
    const commonAgents = Agents.common(first.agents, second.agents)
    rules.push(new AclRule(unaffectedPermissions, commonAgents, firstOptions))

    return rules.filter(rule => !rule.hasNoEffect())
  }

  static _getOptions (rule: AclRule) {
    const options: AclRuleOptions = {}
    options.otherQuads = rule.otherQuads
    options.default = rule.default
    options.defaultForNew = rule.defaultForNew
    options.accessTo = rule.accessTo

    return options
  }
}

export default AclRule
