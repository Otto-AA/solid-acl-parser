import * as N3 from 'n3'
import AclDoc from './AclDoc'
import prefixes from './prefixes'
import AclRule from './AclRule'
import { parseTurtle, makeRelativeIfPossible } from './utils'
import { permissionString } from './Permissions'

/**
 * @module AclParser
 */

interface AclParserOptions {
  fileUrl: string
  aclUrl: string
}

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
 * @alias module:AclParser
 * @example
 * // Give a user read permissions to a file
 * const fileUrl = 'https://pod.example.org/private/'
 * const aclUrl = 'https://pod.example.org/private/file.acl' // Retrieve this from the acl field in the Link header
 * const turtle = await solid.auth.fetch(aclUrl)
 *
 * const parser = new AclParser({ fileUrl, aclUrl })
 * const doc = await parser.turtleToAclDoc(turtle)
 * doc.defaultAccessTo = fileUrl
 * doc.addRule(READ, 'https://other.web.id')
 *
 * const newTurtle = await parser.aclDocToTurtle(doc)
 * await solid.auth.fetch(aclUrl, { // TODO: Check if this works
 *   method: 'PUT',
 *   body: newTurtle
 * })
 */
class AclParser {
  private readonly parser: N3.N3Parser
  private readonly accessTo: string
  private readonly aclUrl: string

  constructor ({ fileUrl, aclUrl }: AclParserOptions) {
    this.parser = new N3.Parser({ baseIRI: aclUrl })
    this.accessTo = fileUrl
    this.aclUrl = aclUrl
  }

  async turtleToAclDoc (aclTurtle: string) {
    const data = await parseTurtle(this.parser, aclTurtle)
    const doc = new AclDoc({ accessTo: this.accessTo })

    for (const [subjectId, quads] of Object.entries(data)) {
      if (this._isAclRule(quads)) {
        const aclRule = this._quadsToRule(quads)
        doc.addRule(aclRule, undefined, { subjectId })
      } else {
        doc.addOther(...quads)
      }
    }

    return doc
  }

  _quadsToRule (quads: N3.Quad[]) {
    const rule = new AclRule()

    for (const quad of quads) {
      if (Object.values(predicates).includes(quad.predicate.id)) {
        this._addQuadToRule(rule, quad)
      } else {
        rule.otherQuads.push(quad)
      }
    }
    return rule
  }

  _isAclRule (quads: N3.Quad[]) {
    return quads.some(({ predicate, object: { value } }) => {
      return predicate.id === predicates.type &&
        value === types.authorization
    })
  }

  _addQuadToRule (rule: AclRule, quad: N3.Quad) {
    const { predicate, object: { value } } = quad

    switch (predicate.id) {
      case predicates.mode:
        rule.permissions.add(value as permissionString)
        break

      case predicates.accessTo:
        rule.accessTo = value
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

      case predicates.type:
        break

      default:
        throw new Error('Unexpected predicate: ' + predicate.id)
    }
  }

  aclDocToTurtle (doc: AclDoc): Promise<string> {
    const writer = new N3.Writer({ prefixes })

    doc.minimizeRules()
    /** @type {N3.Quad[]} */
    const quads = []
    for (const [subjectId, rule] of Object.entries(doc.rules)) {
      const ruleQuads = this._ruleToQuads(subjectId, rule)
      quads.push(...ruleQuads)
    }
    quads.push(...doc.otherQuads)
    writer.addQuads(quads)

    return new Promise<string>((resolve, reject) => {
      writer.end((error, result) => {
        if (error) {
          return reject(error)
        }
        return resolve(result)
      })
    })
  }

  _ruleToQuads (subjectId: string, rule: AclRule) {
    const { DataFactory: { quad, namedNode } } = N3
    const quads = []
    const relative = (url: string) => makeRelativeIfPossible(this.aclUrl, url)

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
        namedNode(relative(webId))
      ))
    }
    for (const group of rule.agents.groups) {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.agentGroup),
        namedNode(relative(group))
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

    // Targets
    if (rule.accessTo) {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.accessTo),
        namedNode(relative(rule.accessTo))
      ))
    }
    if (typeof rule.default !== 'undefined') {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.default),
        namedNode(relative(rule.default))
      ))
    }
    if (typeof rule.defaultForNew !== 'undefined') {
      quads.push(quad(
        namedNode(subjectId),
        namedNode(predicates.defaultForNew),
        namedNode(relative(rule.defaultForNew))
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

    quads.push(...rule.otherQuads)

    return quads
  }
}

export default AclParser
