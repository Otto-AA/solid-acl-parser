import N3 from 'n3'
import AclDoc from './AclDoc'
import prefixes from './prefixes'
import AclRule from './AclRule'

const predicates = {
  mode: `${prefixes.acl}mode`,
  agent: `${prefixes.acl}agent`,
  agentGroup: `${prefixes.acl}agentGroup`,
  agentClass: `${prefixes.acl}agentClass`,
  accessTo: `${prefixes.acl}accessTo`,
  default: `${prefixes.acl}default`,
  defaultForNew: `${prefixes.acl}defaultForNew`,
  type: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
}

const agentClasses = {
  public: `${prefixes.foaf}Agent`,
  authenticated: `${prefixes.acl}AuthenticatedAgent`
}

const types = {
  authorization: `${prefixes.acl}Authorization`
}

/**
 * @description Class for parsing a turtle representation of an acl file into an instance of the Acl class
 */
export default class AclParser {
  /**
   * @param {string} [baseIRI]
   */
  constructor (baseIRI = './') {
    this.parser = new N3.Parser({ baseIRI })
    this.subjectIdCounter = 0
  }

  /**
   * @param {string} aclTurtle
   * @returns {Promise<AclDoc>}
   */
  async turtleToAclDoc (aclTurtle) {
    const doc = new AclDoc()
    await this._parseRules(aclTurtle,
      (subjectId, rule) => doc.addRule(rule, null, null, subjectId),
      otherQuad => doc.addOther(otherQuad))

    return doc
  }

  /**
   * @param {string} turtle
   * @param {function} ruleCallback
   * @param {function} otherCallback
   * @returns {Promise<void>}
   */
  _parseRules (turtle, ruleCallback, otherCallback) {
    // Describes one block of statements
    const curBlock = {
      subj: null,
      rule: null,
      isAuthorizationType: false,
      quads: []
    }

    return new Promise((resolve, reject) => {
      this.parser.parse(turtle, (error, quad, prefixes) => {
        if (error) {
          return reject(error)
        }

        // N3 returns quad=null when finished
        if (quad === null) {
          if (curBlock.isAuthorizationType) {
            ruleCallback(curBlock.subj, curBlock.rule)
          } else {
            curBlock.quads.forEach(quad => otherCallback(quad))
          }
          return resolve()
        }

        const { subject, predicate, object } = quad
        curBlock.quads.push(quad)

        // Handle multiple blocks
        if (curBlock.subj !== subject.id) {
          if (curBlock.isAuthorizationType) {
            ruleCallback(curBlock.subj, curBlock.rule)
          } else if (curBlock.subj !== null) {
            curBlock.quads.forEach(quad => otherCallback(quad))
          }
          curBlock.subj = subject.id
          curBlock.rule = new AclRule()
          curBlock.isAuthorizationType = false
          curBlock.quads = []
        }

        // Handle quad
        if (predicate.id === predicates.type) {
          curBlock.isAuthorizationType = (object.value === types.authorization)
        } else if (Object.values(predicates).includes(predicate.id)) {
          this._addQuadToRule(curBlock.rule, quad)
        }
      })
    })
  }

  /**
   * @param {AclRule} rule
   * @param {N3.Quad} quad
   */
  _addQuadToRule (rule, quad) {
    const { predicate, object: { value } } = quad

    switch (predicate.id) {
      case predicates.mode:
        rule.permissions.add(value)
        break

      case predicates.accessTo:
        rule.accessTo.push(value)
        break

      case predicates.agent:
        rule.agents.addWebId(value)
        break

      case predicates.agentGroup:
        rule.agents.addGroup(value)
        break

      case predicates.agentClass:
        switch (value) {
          case agentClasses.public:
            rule.agents.addPublic()
            break

          case agentClasses.authenticated:
            rule.agents.addAuthenticated()
            break

          default:
            throw new Error('Unexpected value for agentClass: ' + value)
        }
        break

      case predicates.default:
        rule.default = value
        break

      // defaultForNew has been replaced by default
      // only for backwards compatibility
      case predicates.defaultForNew:
        rule.defaultForNew = value
        rule.default = value
        break

      default:
        throw new Error('Unexpected predicate: ' + predicate.id)
    }
  }

  /**
   * @param {AclDoc} doc
   * @returns {string}
   */
  aclDocToTurtle (doc) {
    const writer = new N3.Writer({ prefixes })

    const rules = doc.getMinifiedRules()
    /** @type {N3.Quad[]} */
    const quads = []
    for (const [subjectId, rule] of Object.entries(rules)) {
      const ruleQuads = this._ruleToQuads(subjectId, rule)
      quads.push(...ruleQuads)
    }
    quads.push(...doc.otherQuads)
    writer.addQuads(quads)

    return new Promise((resolve, reject) => {
      writer.end((error, result) => {
        if (error) {
          return reject(error)
        }
        return resolve(result)
      })
    })
  }

  /**
   * @param {string} subjectId
   * @param {AclRule} rule
   * @returns {N3.Quad[]}
   */
  _ruleToQuads (subjectId, rule) {
    const { DataFactory: { quad, namedNode } } = N3
    const quads = []
    subjectId = subjectId || ('acl-parser-subject-' + this.subjectIdCounter++)

    quads.push(quad(
      namedNode(subjectId),
      namedNode(predicates.type),
      namedNode(types.authorization)
    ))
    // Agents
    for (const webId of rule.agents.webIds) {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.agent),
        namedNode(webId)
      ))
    }
    for (const group of rule.agents.groups) {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.agentGroup),
        namedNode(group)
      ))
    }
    if (rule.agents.public) {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.agentClass),
        namedNode(agentClasses.public)
      ))
    }
    if (rule.agents.authenticated) {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.agentClass),
        namedNode(agentClasses.authenticated)
      ))
    }
    // accessTo
    for (const uri of rule.accessTo) { // TODO: Check if uri is the correct term
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.accessTo),
        namedNode(uri)
      ))
    }
    // Provides default permissions for contained items?
    if (typeof rule.default !== 'undefined') {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.default),
        namedNode(rule.default)
      ))
    }
    if (typeof rule.defaultForNew !== 'undefined') {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.defaultForNew),
        namedNode(rule.defaultForNew)
      ))
    }
    // Permissions
    for (const permission of rule.permissions) {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.mode),
        namedNode(permission)
      ))
    }

    return quads
  }
}
