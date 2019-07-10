import N3 from 'n3';
import AclDoc from './AclDoc';
import AclRule from './AclRule';
/**
 * @module AclParser
 */
interface AclParserOptions {
    fileUrl: string;
    aclUrl: string;
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
declare class AclParser {
    private readonly parser;
    private readonly accessTo;
    constructor({ fileUrl, aclUrl }: AclParserOptions);
    turtleToAclDoc(aclTurtle: string): Promise<AclDoc>;
    _quadsToRule(quads: N3.Quad[]): AclRule;
    _isAclRule(quads: N3.Quad[]): boolean;
    _addQuadToRule(rule: AclRule, quad: N3.Quad): void;
    aclDocToTurtle(doc: AclDoc): Promise<string>;
    _ruleToQuads(subjectId: string, rule: AclRule): N3.Quad[];
}
export default AclParser;
