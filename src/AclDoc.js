import Agents from './Agents'
import Permissions from './Permissions'
import AclRule from './AclRule'
import { iterableEquals } from './utils';

/**
 * @module AclDoc
 */
// /** @typedef {import("n3").Quad} Quad */

/**
 * @typedef {object} AclDocOptions
 * @property {string} accessTo - Url to the file/folder which will be granted access to
 */

/**
 * @typedef {object} AddRuleOptions
 * @property {string} [subjectId]
 */

const defaultSubjectIdBase = 'acl-utils-rule-'

/**
 * @description Class for storing information of an acl file
 * @alias module:AclDoc
 * @example
 * // Create a new AclDoc
 * // We can specify a default accessTo value here. If not specified we will need to add it to the AclRule's
 * const { READ } = Permissions
 * const webId = 'https://solid.example.org/profile/card#me'
 *
 * const doc = new AclDoc({ accessTo: 'https://solid.example.org/foo/file.ext' })
 *
 * // Give one user all permissions (READ, WRITE, APPEND and CONTROL)
 * // We can add a subjectId, else it will be generated automatically
 * doc.addRule(new AclRule(Permissions.ALL, webId), '#owner')
 *
 * // Give everyone read access
 * doc.addRule(new AclRule(READ, Agents.PUBLIC))
 *
 */
class AclDoc {
  /**
   * @param {AclDocOptions} options
   */
  constructor ({ accessTo }) {
    this.accessTo = accessTo

    /** @type {Object.<string, AclRule>} */
    this.rules = {}
    /** @type {Quad[]} */
    this.otherQuads = []
  }

  /**
   * @description Adds a new rule.
   * If subjectId is specified and already exits the old one will be overwritten
   * @param {Permissions} permissions
   * @param {Agents} agents
   * @param {AddRuleOptions} [options]
   * @returns {this}
   * @example
   * const rule = new AclRule(new Permissions(READ, WRITE), new Agents('https://my.web.id/#me'))
   * doc.addRule(rule)
   * // addRule uses AclRule.from which means we could use following too
   * doc.addRule([READ, WRITE], 'https://my.web.id/#me')
   */
  addRule (permissions, agents, { subjectId = this._getNewSubjectId() } = {}) {
    const rule = this._ruleFromArgs(permissions, agents)
    this.rules[subjectId] = rule

    return this
  }

  /**
   * @param {AclRule} rule
   * @returns {boolean} true if this combination of these agents have the permissions for the accessTo file
   * @example
   * doc.addRule([READ, WRITE], ['https://first.web.id', 'https://second.web.id'])
   * doc.hasRule(READ, 'https://first.web.id') // true
   * doc.hasRule([READ, WRITE], ['https://first.web.id', 'https://second.web.id']) // true
   * doc.hasRule(CONTROL, 'https://first.web.id') // false
   * doc.hasRule(READ, 'https://third.web.id') // false
   */
  hasRule (...args) {
    // A rule may be split up across multiple subject groups
    // Therefore we allow splitting it up and then checking the smaller rules
    let rulesToCheck = [ this._ruleFromArgs(...args) ]

    return Object.values(this.rules)
      .some(existingRule => {
        const newRulesToCheck = []
        for (const rule of rulesToCheck) {
          newRulesToCheck.push(...AclRule.subtract(rule, existingRule))
        }
        rulesToCheck = newRulesToCheck

        return rulesToCheck.length === 0
      })
  }

  /**
   * @description Get the rule with this subject id
   * @param  {string} subjectId
   * @returns {AclRule|undefined}
   */
  getRuleBySubjectId (subjectId) {
    return this.rules[subjectId]
  }

  /**
   * @param {AclRule} rule
   * @returns {this}
   * @example
   * doc.addRule([READ, WRITE], ['https://first.web.id', 'https://second.web.id'])
   * doc.deleteRule(READ, 'https://first.web.id')
   * doc.hasRule(READ, 'https://first.web.id') // false
   * doc.hasRule(WRITE, 'https://first.web.id') // true
   * doc.hasRule([READ, WRITE], 'https://second.web.id') // true
   */
  deleteRule (...args) {
    const toDelete = this._ruleFromArgs(...args)

    for (const subjectId of Object.keys(this.rules)) {
      this.deleteBySubjectId(subjectId, toDelete)
    }

    return this
  }

  /**
   * @param {string} subjectId
   * @param {AclRule} [rule] - if not specified it will delete the entire subject group
   * @returns {this}
   */
  deleteBySubjectId (subjectId, ...args) {
    const ignoreRule = !args.length
    const rule = !ignoreRule ? this._ruleFromArgs(...args) : null

    if (this.rules.hasOwnProperty(subjectId)) {
      if (ignoreRule) {
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

    return this
  }

  /**
   * @param {Agents} agents
   * @returns {this}
   * @example
   * // Remove all permissions for one specific webId and public
   * const agents = new Agents()
   * agents.addWebId('https://web.id')
   * agents.addPublic()
   * doc.deleteAgents(agents)
   */
  deleteAgents (agents) {
    this.deleteRule(new AclRule(Permissions.ALL, agents))
    return this
  }

  /**
   * @param {Permissions} permissions
   * @returns {this}
   * @example
   * // Set that no one (!) will be able to use APPEND on this resource
   * // Do not use this with CONTROL, except if you are sure you want that
   * doc.deletePermissions(APPEND)
   */
  deletePermissions (...permissions) {
    permissions = Permissions.from(...permissions)

    for (const [subjectId, rule] of Object.entries(this.rules)) {
      const toDelete = new AclRule(permissions, rule.agents)
      this.deleteBySubjectId(subjectId, toDelete)
    }
    return this
  }

  /**
   * @description Get all permissions a specific group of agents has
   * Public will not be added automatically to the agents.
   * Only works for single agents
   * @param {Agents} agents
   * @returns {Permissions}
   * @example
   * // Check if a specific user has READ permissions
   * const agents = new Agents('https://web.id')
   * const permissions = doc.getPermissionsFor(agents)
   * permissions.has(READ) // true if the user has read permissions
   */
  getPermissionsFor (agents) {
    agents = Agents.from(agents)

    const permissions = new Permissions()
    for (const perm of Permissions.ALL) {
      if (this.getAgentsWith(perm).includes(agents)) {
        permissions.add(perm)
      }
    }
    return permissions
  }

  /**
   * @param {Permissions} permissions
   * @returns {Agents}
   * @example
   * // Get all agents which have WRITE permissions
   * const permissions = new Permissions(WRITE)
   * const agents = doc.getAgentsWith(permissions)
   * agents.hasWebId('https://web.id') // true if this user has write permissions
   * agents.hasPublic() // true if everyone has write permissions
   * // You can iterate over the webIds set if you want to list them all
   * [...agents.webIds].forEach(webId => console.log(webId))
   */
  getAgentsWith (permissions) {
    permissions = Permissions.from(permissions)

    return Object.values(this.rules)
      .filter(rule => rule.permissions.includes(permissions))
      .map(rule => rule.agents)
      .reduce(Agents.merge, Agents.from())
  }

  /**
   * @description Delete all unused rules
   * @returns {this}
   */
  minimizeRules () {
    // TODO: Try to merge rules with a subject id starting with defaultSubjectIdBase
    for (const [subjectId, rule] of Object.entries(this.rules)) {
      if (rule.hasNoEffect()) {
        delete this.rules[subjectId]
      }
    }
    return this
  }

  /**
   * @description add data which isn't an access restriction
   * @param {...Quad} other
   * @returns {this}
   */
  addOther (...other) {
    this.otherQuads.push(...other)
    return this
  }

  /**
   * @param {AclDoc} other
   * @returns {boolean}
   */
  equals (other) {
    return this.accessTo === other.accessTo &&
      iterableEquals(this.otherQuads, other.otherQuads) &&
      Object.entries(this.rules)
        .every(([subjectId, rule]) => {
          const otherRule = other.getRuleBySubjectId(subjectId)
          return typeof otherRule !== 'undefined' && rule.equals(otherRule)
        })
  }

  /**
   * @param {string} subjectId
   * @param {AclRule} rule
   */

  /**
   * @returns {AclRule}
   */
  _ruleFromArgs (permission, agents) {
    const rule = AclRule.from(permission, agents)
    rule.accessTo = [ this.accessTo ]
    return rule
  }

  /**
   * @description Get an unused subject id
   * @param {string} [base] - The newly generated id will begin with this base id
   * @returns {string}
   */
  _getNewSubjectId (base = defaultSubjectIdBase) {
    let index = Number(base.match(/[\d]*$/)[0]) // Last positive number; 0 if not ending with number
    base = base.replace(/[\d]*$/, '')

    while (this.rules.hasOwnProperty(base + index)) {
      index++
    }
    return base + index
  }
}

export default AclDoc
