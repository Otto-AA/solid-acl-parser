import Agents, { AgentsCastable } from './Agents';
import Permissions, { PermissionsCastable, permissionString } from './Permissions';
import AclRule from './AclRule';
import { Quad } from 'n3';
/**
 * @module AclDoc
 */
interface AclDocOptions {
    accessTo: string;
}
interface AddRuleOptions {
    subjectId?: string;
}
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
declare class AclDoc {
    readonly accessTo: string;
    rules: Record<string, AclRule>;
    otherQuads: Quad[];
    constructor({ accessTo }: AclDocOptions);
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
    addRule(firstVal: AclRule | PermissionsCastable, agents?: Agents, { subjectId }?: AddRuleOptions): this;
    /**
     * @example
     * doc.addRule([READ, WRITE], ['https://first.web.id', 'https://second.web.id'])
     * doc.hasRule(READ, 'https://first.web.id') // true
     * doc.hasRule([READ, WRITE], ['https://first.web.id', 'https://second.web.id']) // true
     * doc.hasRule(CONTROL, 'https://first.web.id') // false
     * doc.hasRule(READ, 'https://third.web.id') // false
     */
    hasRule(firstVal: AclRule | PermissionsCastable, agents?: Agents): boolean;
    /**
     * @description Get the rule with this subject id
     */
    getRuleBySubjectId(subjectId: string): AclRule | undefined;
    /**
     * @example
     * doc.addRule([READ, WRITE], ['https://first.web.id', 'https://second.web.id'])
     * doc.deleteRule(READ, 'https://first.web.id')
     * doc.hasRule(READ, 'https://first.web.id') // false
     * doc.hasRule(WRITE, 'https://first.web.id') // true
     * doc.hasRule([READ, WRITE], 'https://second.web.id') // true
     */
    deleteRule(firstVal: AclRule | PermissionsCastable, agents?: Agents): this;
    deleteBySubjectId(subjectId: string, firstVal?: AclRule | PermissionsCastable, agents?: Agents): this;
    /**
     * @example
     * // Remove all permissions for one specific webId and public
     * const agents = new Agents()
     * agents.addWebId('https://web.id')
     * agents.addPublic()
     * doc.deleteAgents(agents)
     */
    deleteAgents(agents: Agents): this;
    /**
     * @example
     * // Set that no one (!) will be able to use APPEND on this resource
     * // Do not use this with CONTROL, except if you are sure you want that
     * doc.deletePermissions(APPEND)
     */
    deletePermissions(firstVal: PermissionsCastable, ...restPermissions: permissionString[]): this;
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
    getPermissionsFor(agents: Agents): Permissions;
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
    getAgentsWith(firstVal: PermissionsCastable, ...restPermissions: permissionString[]): Agents;
    /**
     * @description Delete all unused rules
     */
    minimizeRules(): this;
    /**
     * @description add data which isn't an access restriction
     */
    addOther(...other: Quad[]): this;
    equals(other: AclDoc): boolean;
    _ruleFromArgs(firstVal: AclRule | PermissionsCastable, agents?: AgentsCastable): AclRule;
    /**
     * @description Get an unused subject id
     * @param {string} [base] - The newly generated id will begin with this base id
     */
    _getNewSubjectId(base?: string): string;
    readonly _defaultSubjectId: string;
}
export default AclDoc;
