import Agents from './Agents'
import Permissions from './Permissions'
import AclRule from './AclRule'
import AclParser from './AclParser';

/** @typedef {import("./AclRule").default} AclRule */
/** @typedef {import("./Permissions").default} Permissions */

/**
 * @description Class for storing information of an acl file
 */
export default class AclDoc {
  constructor () {
    /** @type {AclRule[]} */
    this.rules = []
    /** @type {any[]} */
    this.otherQuads = []
  }

  /**
   * @param {AclRule} rule
   */
  addRule (...args) {
    const rule = AclRule.from(...args)
    this.rules.push(...rule.split())
  }

  /**
   * @param {AclRule} rule
   */
  hasRule (...args) {
    // TODO: What happens when multiple agents are passed?
    const rule = AclRule.from(...args)
    return rule.split()
      .every(splitRule => this.rules.some(r => r.includes(splitRule)))
  }

  /**
   * @param {AclRule} rule
   */
  deleteRule (...args) {
    const rule = AclRule.from(...args)
    for (const splitRule of rule.split()) {
      this.rules.forEach(r => {
        if (r.permissions.includes(splitRule.permissions)) {
          r.agents.delete(splitRule.agents)
        }
      })
    }
  }

  /**
   * @param {string} subjectId
   */
  deleteBySubject (subjectId) {
    this.rules = this.rules.filter(rule => rule.subjectId !== subjectId)
  }

  /**
   * @param {Agents} agents
   */
  deleteAgents (agents) {
    agents = Agents.from(agents)
    this.rules.forEach(rule => rule.agents.delete(agents))
  }

  /**
   * @param {Permissions} permissions
   */
  deletePermissions (permissions) {
    // TODO
    permissions = Permissions.from(permissions)
    this.rules = this.rules.filter(rule => !rule.permissions.equals(permissions))
  }

  /**
   * @param {Agents} agents
   * @returns {Permissions}
   */
  getPermissionsFor (agents) {
    agents = Agents.from(agents)
    return this.rules
      .filter(rule => rule.agents.includes(agents))
      .map(rule => rule.permissions.clone())
      .reduce((prevPermission, permission) => prevPermission.merge(permission))
  }

  /**
   * @param {Permissions} permissions
   * @returns {Agents}
   */
  getAgentsWith (permissions) {
    permissions = Permissions.from(permissions)
    return this.rules
      .filter(rule => rule.permissions.includes(permissions))
      .map(rule => rule.agents.clone())
      .reduce((prevAgents, agents) => prevAgents.merge(agents))
  }

  /**
   * @description Use this to get a rule list for converting to turtle
   * @returns {AclRule[]}
   */
  getMinifiedRules () {
    // TODO
    return this.rules
  }

  /**
   * @description add data which isn't an access restriction
   * @param {any}
   */
  addOther (other) {
    this.otherQuads.push(other)
  }

  /**
   * @description Create the turtle representation for this acl document
   */
  toTurtle () {
    const parser = new AclParser()
    return parser.aclDocToTurtle(this)
  }
}
