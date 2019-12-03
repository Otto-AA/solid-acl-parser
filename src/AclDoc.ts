import Agents, { AgentsCastable } from './Agents'
import Permissions, { PermissionsCastable, permissionString, permissionLinks } from './Permissions'
import AclRule from './AclRule'
import { iterableEquals } from './utils'
import { Quad } from 'n3'

/**
 * @module AclDoc
 */

interface AclDocOptions {
  accessTo: string // Url to the file/folder which will be granted access to
  strict?: boolean // Throw on possible errors
}

interface AddRuleOptions {
  subjectId?: string
}

/**
 * @description Class for storing information of an acl file
 * @alias module:AclDoc
 */
class AclDoc {
  public readonly accessTo: string
  public readonly strict: boolean
  public rules: Record<string, AclRule>
  public otherQuads: Quad[]

  constructor ({ accessTo, strict = true }: AclDocOptions) {
    this.accessTo = accessTo
    this.strict = strict
    this.rules = {}
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
  addRule (firstVal: AclRule|PermissionsCastable, agents?: Agents, { subjectId }: AddRuleOptions = {}) {
    const rule = this._ruleFromArgs(firstVal, agents)
    subjectId = this._normalizedSubectId(subjectId || this._getNewSubjectId(rule))
    this.rules[subjectId] = rule

    return this
  }

  /**
   * @description Adds a default rule which will be inherited by childs if they have no permissions set
   * Only makes sense on folders
   */
  addDefaultRule (firstVal: AclRule|PermissionsCastable, agents?: Agents, options: AddRuleOptions = {}) {
    const rule = this._ruleFromArgs(firstVal, agents)
    rule.default = this.accessTo

    return this.addRule(rule, undefined, options)
  }

  /**
   * @example
   * doc.addRule([READ, WRITE], ['https://first.web.id', 'https://second.web.id'])
   * doc.hasRule(READ, 'https://first.web.id') // true
   * doc.hasRule([READ, WRITE], ['https://first.web.id', 'https://second.web.id']) // true
   * doc.hasRule(CONTROL, 'https://first.web.id') // false
   * doc.hasRule(READ, 'https://third.web.id') // false
   */
  hasRule (firstVal: AclRule|PermissionsCastable, agents?: Agents) {
    // A rule may be split up across multiple subject groups
    // Therefore we allow splitting it up and then checking the smaller rules
    let rulesToCheck = [ this._ruleFromArgs(firstVal, agents) ]

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

  hasDefaultRule (firstVal: AclRule|PermissionsCastable, agents?: Agents) {
    const rule = this._ruleFromArgs(firstVal, agents)
    rule.default = this.accessTo

    return this.hasRule(rule)
  }

  /**
   * @description Get the rule with this subject id
   */
  getRuleBySubjectId (subjectId: string): AclRule|undefined {
    return this.rules[this._normalizedSubectId(subjectId)]
  }

  /**
   * @example
   * doc.addRule([READ, WRITE], ['https://first.web.id', 'https://second.web.id'])
   * doc.deleteRule(READ, 'https://first.web.id')
   * doc.hasRule(READ, 'https://first.web.id') // false
   * doc.hasRule(WRITE, 'https://first.web.id') // true
   * doc.hasRule([READ, WRITE], 'https://second.web.id') // true
   */
  deleteRule (firstVal: AclRule|PermissionsCastable, agents?: Agents) {
    const toDelete = this._ruleFromArgs(firstVal, agents)

    for (const subjectId of Object.keys(this.rules)) {
      this.deleteBySubjectId(subjectId, toDelete)
    }

    return this
  }

  deleteBySubjectId (subjectId: string, firstVal?: AclRule|PermissionsCastable, agents?: Agents) {
    const rule = firstVal ? this._ruleFromArgs(firstVal, agents) : null

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
            const newSubjectId = this._getNewSubjectId(newRule, subjectId)
            this.rules[newSubjectId] = newRule
          }
        }
      }
    }

    return this
  }

  /**
   * @example
   * // Remove all permissions for one specific webId and public
   * const agents = new Agents()
   * agents.addWebId('https://web.id')
   * agents.addPublic()
   * doc.deleteAgents(agents)
   */
  deleteAgents (agents: Agents) {
    this.deleteRule(this._ruleFromArgs(Permissions.ALL, agents))
    return this
  }

  /**
   * @example
   * // Set that no one (!) will be able to use APPEND on this resource
   * // Do not use this with CONTROL, except if you are sure you want that
   * doc.deletePermissions(APPEND)
   */
  deletePermissions (firstVal: PermissionsCastable, ...restPermissions: permissionString[]) {
    const permissions = Permissions.from(firstVal, ...restPermissions)

    for (const [subjectId, rule] of Object.entries(this.rules)) {
      const toDelete = this._ruleFromArgs(permissions, rule.agents)
      this.deleteBySubjectId(subjectId, toDelete)
    }
    return this
  }

  /**
   * @description Get all permissions a specific group of agents has
   * Public will not be added automatically to the agents.
   * Only works for single agents
   * @example
   * // Check if a specific user has READ permissions
   * const agents = new Agents('https://web.id')
   * const permissions = doc.getPermissionsFor(agents)
   * permissions.has(READ) // true if the user has read permissions
   */
  getPermissionsFor (agents: Agents) {
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
   * @example
   * // Get all agents which have WRITE permissions
   * const permissions = new Permissions(WRITE)
   * const agents = doc.getAgentsWith(permissions)
   * agents.hasWebId('https://web.id') // true if this user has write permissions
   * agents.hasPublic() // true if everyone has write permissions
   * // You can iterate over the webIds set if you want to list them all
   * [...agents.webIds].forEach(webId => console.log(webId))
   */
  getAgentsWith (firstVal: PermissionsCastable, ...restPermissions: permissionString[]) {
    const permissions = Permissions.from(firstVal, ...restPermissions)

    return Object.values(this.rules)
      .filter(rule => rule.accessTo === this.accessTo)
      .filter(rule => rule.permissions.includes(permissions))
      .map(rule => rule.agents)
      .reduce(Agents.merge, Agents.from())
  }

  /**
   * @description Delete all unused rules
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
   */
  addOther (...other: Quad[]) {
    this.otherQuads.push(...other)
    return this
  }

  equals (other: AclDoc) {
    return this.accessTo === other.accessTo &&
      iterableEquals(this.otherQuads, other.otherQuads) &&
      Object.entries(this.rules)
        .every(([subjectId, rule]) => {
          const otherRule = other.getRuleBySubjectId(subjectId)
          return typeof otherRule !== 'undefined' && rule.equals(otherRule)
        })
  }

  _ruleFromArgs (firstVal: AclRule|PermissionsCastable, agents?: AgentsCastable) {
    const rule = AclRule.from(firstVal, agents)
    if (!rule.accessTo) {
      rule.accessTo = this.accessTo
    }
    this._assertValidRule(rule)

    return rule
  }

  _assertValidRule (rule: AclRule) {
    if (this.strict) {
      if (rule.accessTo !== this.accessTo) {
        throw new Error(`Invalid accessTo: Found ${rule.accessTo} Expected ${this.accessTo}`)
      }
      if (rule.default && rule.default !== this.accessTo) {
        throw new Error(`Invalid default: Found ${rule.default} Expected ${this.accessTo}`)
      }
      if (rule.defaultForNew && rule.defaultForNew !== this.accessTo) {
        throw new Error(`Invalid defaultForNew: Found ${rule.defaultForNew} Expected ${this.accessTo}`)
      }
    }
  }

  /**
   * @description Get an unused subject id
   * @param {string} [base] - The newly generated id will begin with this base id
   */
  _getNewSubjectId (rule: AclRule, base = this._defaultSubjectIdForRule(rule)) {
    const digitMatches = base.match(/[\d]*$/) || ['0']
    let index = Number(digitMatches[0]) // Last positive number; 0 if not ending with number
    base = base.replace(/[\d]*$/, '')

    while (this._containsSubjectId(base + index)) {
      index++
    }
    return base + index
  }

  _containsSubjectId (subjectId: string) {
    return this.rules.hasOwnProperty(this._normalizedSubectId(subjectId))
  }

  _normalizedSubectId (subjectId: string) {
    if (!subjectId.startsWith(this.accessTo)) {
      return subjectId
    }
    return subjectId.includes('#') ? subjectId.substr(subjectId.lastIndexOf('#')) : subjectId
  }

  _defaultSubjectIdForRule (rule: AclRule) {
    let id = '#'
    id += Object.entries(permissionLinks)
      .filter(([name, permission]) => rule.permissions.has(permission))
      .map(([name]) => name[0] + name.substr(1).toLowerCase())
      .join('')
    if (rule.default || rule.defaultForNew) { id += 'Default' }
    return id + '-'
  }
}

export default AclDoc
