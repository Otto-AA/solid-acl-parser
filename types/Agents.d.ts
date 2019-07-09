/**
 * @module Agents
 */
export declare type AgentsCastable = Agents | string | string[] | undefined;
/**
 * @description class describing multiple agents
 * @alias module:Agents
 * @example
 * const webId = 'https://solid.example.org/profile/card#me'
 * const secondWebId = 'https://second.example.org/profile/card#me'
 * const agents = new Agents(webId) // You can pass zero or more webIds to the constructor
 *
 * // Add a single web id
 * agents.addWebId(secondWebId)
 * agents.hasWebId(webId, secondWebId) // true
 * agents.deleteWebId(webId)
 *
 * // Target everyone (note: this doesn't modify other agents like webIds)
 * agents.addPublic()
 * agents.hasPublic() // true
 * agents.deletePublic()
 *
 * // Shortcut for creating new agents and then calling agents.addPublic()
 * const publicAgents = Agents.PUBLIC
 * agents.hasPublic() // true
 */
declare class Agents {
    readonly webIds: Set<string>;
    readonly groups: Set<string>;
    public: boolean;
    authenticated: boolean;
    constructor(...webIds: string[]);
    addWebId(...webIds: string[]): this;
    hasWebId(...webIds: string[]): boolean;
    deleteWebId(...webIds: string[]): this;
    addGroup(...groups: string[]): this;
    hasGroup(...groups: string[]): boolean;
    deleteGroup(...groups: string[]): this;
    /**
     * @description Access is given to everyone
     */
    addPublic(): this;
    hasPublic(): boolean;
    deletePublic(): this;
    /**
     * @description Access is only given to people who have logged on and provided a specific ID
     */
    addAuthenticated(): this;
    hasAuthenticated(): boolean;
    deleteAuthenticated(): this;
    clone(): Agents;
    equals(other: Agents): boolean;
    includes(other: Agents): boolean;
    isEmpty(): boolean;
    static from(firstVal: AgentsCastable): Agents;
    static from(...val: string[]): Agents;
    /**
     * @description Return all common agents
     */
    static common(first: Agents, second: Agents): Agents;
    /**
     * @description Return a new Agents instance which includes all agents from first and second
     */
    static merge(first: Agents, second: Agents): Agents;
    /**
     * @description Return all agents from the first which are not in the second
     */
    static subtract(first: Agents, second: Agents): Agents;
    static readonly PUBLIC: Agents;
    static readonly AUTHENTICATED: Agents;
}
export default Agents;
