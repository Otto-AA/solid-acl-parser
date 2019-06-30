import N3 from 'n3'
import AclDoc from './AclDoc'

/**
 * @description Class for parsing a turtle representation of an acl file into an instance of the Acl class
 */
export default class AclParser {
  /**
   * @param {string} baseIRI
   */
  constructor (baseIRI) {
    this.acl = new AclDoc()
    this.parser = new N3.Parser({ baseIRI })
  }

  /**
   * @param {string} aclTurtle
   * @returns {AclDoc}
   */
  async parse (aclTurtle) {
    return this.acl
  }
}
