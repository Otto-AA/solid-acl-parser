import Permissions from './Permissions'
import Agents from './Agents'

export default class AclRule {
  /**
   * @param {Permissions} permissions
   * @param {Agents} agents
   */
  constructor (permissions, agents) {
    this.permissions = Permissions.from(permissions)
    this.agents = Agents.from(agents)
  }

  /**
   * @param {AclRule} other
   */
  merge (other) {
    if (!this.canBeMerged(other)) {
      throw new Error('Cannot merge two rules with different permissions')
    }
    this.agents.merge(other.agents)
  }

  /**
   * @description Return true if these two rules can be merged without loosing information
   * @param {AclRule} other
   * @returns {boolean}
   */
  canBeMerged (other) {
    // Require the permissions to be the same
    // TODO: Also require the scope to be the same
    return this.permissions.equals(other.permissions)
  }

  /**
   * @description Split into rules with unique permission and [TODO] Scope
   * @returns {AclRule[]}
   */
  split () {
    return [...this.permissions.set].map(perm => {
      const newRule = this.clone()
      newRule.permissions = new Permissions(perm)
      return newRule
    })
  }

  /**
   * @returns {AclRule}
   */
  clone () {
    return new AclRule(this.permissions.clone(), this.agents.clone())
  }

  /**
   * @param {AclRule} other
   * @returns {boolean}
   */
  equals (other) {
    return this.permissions.equals(other.permissions) &&
      this.agents.equals(other.agents)
  }

  /**
   * @param {AclRule} other
   * @returns {boolean}
   */
  includes (other) {
    return this.permissions.includes(other.permissions) &&
      this.agents.includes(other.agents)
  }

  /**
   * @param {AclRule|Permissions|string|string[]} first
   * @param {Agents|string|string[]} [agents]
   */
  static from (first, agents) {
    if (first instanceof AclRule) {
      return first.clone()
    }
    return new AclRule(first, agents)
  }
}
