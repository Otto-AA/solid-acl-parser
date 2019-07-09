import { Quad } from 'n3';
import Permissions, { PermissionsCastable } from './Permissions';
import Agents, { AgentsCastable } from './Agents';
/**
 * @module AclRule
 */
interface AclRuleOptions {
    otherQuads?: Quad[];
    default?: string;
    defaultForNew?: string;
}
/**
 * @description Groups together permissions, agents and other relevant information for an acl rule
 * @alias module:AclRule
 * @example
 * // Store some data in an AclRule
 * const { READ, WRITE } = Permissions
 * const webId = 'https://solid.example.org/profile/card#me'
 * const accessTo = 'https://solid.pod.org/foo/file.ext' // Could be an array
 *
 * const permissions = new Permissions(READ, WRITE)
 * const agents = new Agents()
 * const rule = new AclRule(permissions, agents, accessTo)
 *
 * // The constructor uses Permissions.from and Agents.from
 * // Therefore we can also specify permissions and webIds like this:
 * const rule = new AclRule([READ, WRITE], [webId], accessTo)
 */
declare class AclRule {
    permissions: Permissions;
    agents: Agents;
    accessTo: string[];
    otherQuads: Quad[];
    default?: string;
    defaultForNew?: string;
    constructor(permissions?: PermissionsCastable, agents?: AgentsCastable, accessTo?: string[] | string, options?: AclRuleOptions);
    clone(): AclRule;
    equals(other: AclRule): boolean;
    /**
     * @description Return true when this rule has no effect (No permissions or no agents or no targets).
     * To prevent unexpected errors it will return false if any unknown statements (quads) are stored
     */
    hasNoEffect(): boolean;
    static from(firstVal: AclRule | PermissionsCastable, agents?: AgentsCastable, accessTo?: string[], options?: AclRuleOptions): AclRule;
    /**
     * @description Return a new rule with all common permissions, agents, accessTo and quads
     */
    static common(first: AclRule, second: AclRule): AclRule;
    /**
     * @description Return new rules with all rules from the first which aren't in the second
     * If the neither the agents nor the permissions are equal, it is split up into two rules
     * accessTo and otherQuads will be set to the first one
     * @returns {AclRule[]} Array containing zero, one or two AclRule instances.
     * If two are returned, the first one is the rule for the unaffected agents
     * @example
     * const first = new AclRule([READ, WRITE], ['web', 'id'])
     * const second = new AclRule(READ, 'web')
     * console.log(AclRule.subtract(first, second))
     * // == [
     * //   AclRule([READ, WRITE], ['id']),
     * //   AclRule(WRITE, 'web')
     * // ]
     */
    static subtract(first: AclRule, second: AclRule): AclRule[];
    static _getOptions(rule: AclRule): AclRuleOptions;
}
export default AclRule;
