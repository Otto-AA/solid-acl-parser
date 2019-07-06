import Agents from './Agents'
import Permissions from './Permissions'
import AclRule from './AclRule'
import AclParser from './AclParser'

/** @typedef {import("./AclRule").default} AclRule */
/** @typedef {import("./Permissions").default} Permissions */
/** @typedef {import("n3").Quad} Quad */

/**
 * @typedef {object} AclDocOptions
 * @property {string} [defaultAccessTo] - Url to the file/folder which will be granted access to
 */

/**
 * @description Class for storing information of an acl file
 */
export default class AclDoc {
  /**
   * @param {AclDocOptions} [options]
   */
  constructor (options = {}) {
    this.defaultAccessTo = options.defaultAccessTo

    /** @type {{[subjectId: string]: AclRule}} */
    this.rules = {}
    /** @type {Quad[]} */
    this.otherQuads = []
  }

  /**
   * @param {Permissions} permissions
   * @param {Agents} agents
   * @param {string} [accessTo]
   * @param {string} [subjectId]
   */
  addRule (permissions, agents, accessTo, subjectId) {
    const rule = this._ruleFromArgs(permissions, agents, accessTo)

    subjectId = subjectId || this._getNewSubjectId()
    this.rules[subjectId] = rule
  }

  /**
   * @param {AclRule} rule
   * @returns {boolean} true if this combination of these agents have the permissions for the accessTo file
   */
  hasRule (...args) {
    // rulesToCheck contains all semi rules which aren't found yet
    let rulesToCheck = [ this._ruleFromArgs(...args) ]

    for (const r of Object.values(this.rules)) {
      const newRulesToCheck = []
      while (rulesToCheck.length) {
        const rule = rulesToCheck.pop()
        newRulesToCheck.push(...AclRule.subtract(rule, r))
      }
      rulesToCheck = newRulesToCheck

      if (rulesToCheck.length === 0) {
        return true
      }
    }

    return false
  }

  /**
   * @param {AclRule} rule
   */
  deleteRule (...args) {
    const toDelete = this._ruleFromArgs(...args)

    for (const subjectId of Object.keys(this.rules)) {
      this.deleteBySubject(subjectId, toDelete)
    }
  }

  /**
   * @param {string} subjectId
   * @param {AclRule} [rule] - if not specified it will delete the entire subject group
   */
  deleteBySubject (subjectId, rule) {
    if (this.rules.hasOwnProperty(subjectId)) {
      if (!rule) {
        // Delete whole subject group
        delete this.rules[subjectId]
      } else {
        // Delete only specific combination of permissions and agents
        // If necessary, split up into two new subject ids
        const prevRule = this.rules[subjectId]
        const newRules = AclRule.subtract(prevRule, rule)

        if (newRules.length === 1) {
          this.rules[subjectId] = newRules[0]
        } else {
          delete this.rules[subjectId]

          for (const newRule of newRules) {
            const newSubjectId = this._getNewSubjectId(subjectId)
            this.rules[newSubjectId] = newRule
          }
        }
      }
    }
  }

  /**
   * @param {Agents} agents
   */
  deleteAgents (agents) {
    this.deleteRule(new AclRule(Permissions.ALL, agents))
  }

  /**
   * @param {Permissions} permissions
   */
  deletePermissions (permissions) {
    permissions = Permissions.from(permissions)

    for (const [subjectId, rule] of Object.entries(this.rules)) {
      const toDelete = new AclRule(permissions, rule.agents)
      this.deleteBySubject(subjectId, toDelete)
    }
  }

  /**
   * @description Get all permissions a specific group of agents has
   * Ignores accessTo
   * @param {Agents} agents
   * @returns {Permissions}
   */
  getPermissionsFor (agents) {
    agents = Agents.from(agents)

    return Object.values(this.rules)
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

    return Object.values(this.rules)
      .filter(rule => rule.permissions.includes(permissions))
      .map(rule => rule.agents.clone())
      .reduce((prevAgents, agents) => prevAgents.merge(agents))
  }

  /**
   * @description Use this to get all rules for converting to turtle
   * @returns {{[ subjectId: string]: AclRule}}
   */
  getMinifiedRules () {
    // TODO
    for (const [subjectId, rule] of Object.entries(this.rules)) {
      if (rule.hasNoEffect()) {
        delete this.rules[subjectId]
      }
    }
    return this.rules
  }

  /**
   * @description add data which isn't an access restriction
   * @param {Quad} other
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

  /**
   * @param {string} subjectId
   * @param {AclRule} rule
   */

  /**
   * @returns {AclRule}
   */
  _ruleFromArgs (permission, agents, accessTo) {
    const rule = AclRule.from(permission, agents, accessTo)
    if (!rule.accessTo.length) {
      rule.accessTo.push(this._getDefaultAccessTo())
    }
    return rule
  }

  /**
   * @returns {string}
   */
  _getDefaultAccessTo () {
    if (!this.defaultAccessTo) {
      throw new Error('The accessTo value must be specified in the constructor options or directly when calling the methods')
    }
    return this.defaultAccessTo
  }

  /**
   * @description Get an unused subject id
   * @param {string} [base='new-acl-rule'] - The newly generated id will begin with this base id
   * @returns {string}
   */
  _getNewSubjectId (base = 'new-acl-rule-1') {
    let index = Number(base.match(/[\d]*$/)[0]) // Last positive number; 0 if not ending with number
    base = base.replace(/[\d]*$/, '')

    while (this.rules.hasOwnProperty(base + index)) {
      index++
    }
    return base + index
  }
}
