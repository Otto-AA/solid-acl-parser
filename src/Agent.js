/**
 * @description class describing multiple agents
 */
export default class Agents {
  /**
   * @param {...string} [webIds]
   */
  constructor (...webIds) {
    this.webIds = new Set()
    this.groups = new Set()
    this.public = false
    this.authenticated = false
  }

  /**
   * @param {...string} [webIds]
   */
  addWebId (...webIds) {
    webIds.forEach(webId => this.webIds.add(webId))
  }

  /**
   * @param {string} webId
   * @returns {boolean}
   */
  hasWebId (webId) {
    return this.webIds.has(webId)
  }

  /**
   * @param {string} webId
   * @returns {boolean} return false if the element didn't exist
   */
  deleteWebId (webId) {
    return this.webIds.delete(webId)
  }

  /**
   * @param {...string} [groups] - instance of vcard:Group
   */
  addGroup (...groups) {
    groups.forEach(group => this.groups.add(group))
  }

  /**
   * @param {string} group
   * @returns {boolean}
   */
  hasGroup (group) {
    return this.groups.has(group)
  }

  /**
   * @param {string} group
   * @returns {boolean} return false if the element didn't exist
   */
  deleteGroup (group) {
    return this.groups.delete(group)
  }

  /**
   * @description Access is given to everyone
   */
  addPublic () {
    this.public = true
  }

  isPublic () {
    return this.public
  }

  removePublic () {
    this.public = false
  }

  /**
   * @description Access is only given to people who have logged on and provided a specific ID
   */
  addAuthenticated () {
    this.authenticated = true
  }

  isAuthenticated () {
    return this.authenticated
  }

  removeAuthenticated () {
    this.authenticated = false
  }
}
