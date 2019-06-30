import Permissions from './Permissions'
import Agents from './Agents'

export default class AclRule {
  /**
   * @param {Permissions} permissions
   * @param {Agents} agents
   * @param {string} [subjectId]
   */
  constructor (permissions, agents, subjectId) {
    this.permissions = Permissions.from(permissions)
    this.agents = Agents.from(agents)
    this.subjectId = subjectId
  }

  /**
   * @param {AclRule} other
   */
  merge (other) {
    if (!this.canBeMerged(other)) {
      throw new Error('Cannot merge two rules with different permissions or subjectId')
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
    return this.subjectId === other.subjectId &&
      this.permissions.equals(other.permissions)      
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
    return this.subjectId === other.subjectId &&
      this.permissions.equals(other.permissions) &&
      this.agents.equals(other.agents)
  }

  /**
   * @param {AclRule} other
   * @returns {boolean}
   */
  includes (other) {
    return (this.subjectId === other.subjectId || !other.subjectId) &&
      this.permissions.includes(other.permissions) &&
      this.agents.includes(other.agents)
  }

  /**
   * @param {AclRule|Permissions|string|string[]} first
   * @param {Agents|string|string[]} [agents]
   * @param {string} [subjectId]
   */
  static from (first, agents, subjectId) {
    if (first instanceof AclRule) {
      return first.clone()
    }
    return new AclRule(first, agents, subjectId)
  }
}
