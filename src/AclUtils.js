import AclParser from './AclParser'

/**
 * @description Class for working with acl files
 */
export default class AclUtils {
  /**
   * Create a new instance to work with an acl file
   * @param {string} aclTurtle
   */
  constructor (aclTurtle) {
    const parser = new AclParser()
    this.acl = parser.parse(aclTurtle)
  }

  // TODO
}
