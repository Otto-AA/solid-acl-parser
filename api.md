## Modules

<dl>
<dt><a href="#module_AclDoc">AclDoc</a></dt>
<dd></dd>
<dt><a href="#module_AclParser">AclParser</a></dt>
<dd></dd>
<dt><a href="#module_AclRule">AclRule</a></dt>
<dd></dd>
<dt><a href="#module_Agents">Agents</a></dt>
<dd></dd>
<dt><a href="#module_Permissions">Permissions</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#iterableEquals">iterableEquals(a, b)</a> ⇒ <code>boolean</code></dt>
<dd></dd>
</dl>

<a name="module_AclDoc"></a>

## AclDoc

* [AclDoc](#module_AclDoc)
    * [AclDoc](#exp_module_AclDoc--AclDoc) ⏏
        * [new AclDoc([options])](#new_module_AclDoc--AclDoc_new)
        * _instance_
            * [.rules](#module_AclDoc--AclDoc+rules) : <code>Object.&lt;string, AclRule&gt;</code>
            * [.otherQuads](#module_AclDoc--AclDoc+otherQuads) : <code>Array.&lt;Quad&gt;</code>
            * [.addRule(permissions, agents, [accessTo], [subjectId])](#module_AclDoc--AclDoc+addRule)
            * [.hasRule(rule)](#module_AclDoc--AclDoc+hasRule) ⇒ <code>boolean</code>
            * [.deleteRule(rule)](#module_AclDoc--AclDoc+deleteRule)
            * [.deleteBySubject(subjectId, [rule])](#module_AclDoc--AclDoc+deleteBySubject)
            * [.deleteAgents(agents)](#module_AclDoc--AclDoc+deleteAgents)
            * [.deletePermissions(permissions)](#module_AclDoc--AclDoc+deletePermissions)
            * [.getPermissionsFor(agents)](#module_AclDoc--AclDoc+getPermissionsFor) ⇒ <code>Permissions</code>
            * [.getAgentsWith(permissions)](#module_AclDoc--AclDoc+getAgentsWith) ⇒ <code>Agents</code>
            * [.getMinifiedRules()](#module_AclDoc--AclDoc+getMinifiedRules) ⇒ <code>Object.&lt;string, AclRule&gt;</code>
            * [.addOther(other)](#module_AclDoc--AclDoc+addOther)
            * [.toTurtle()](#module_AclDoc--AclDoc+toTurtle)
            * [._ruleFromArgs()](#module_AclDoc--AclDoc+_ruleFromArgs) ⇒ <code>AclRule</code>
            * [._getDefaultAccessTo()](#module_AclDoc--AclDoc+_getDefaultAccessTo) ⇒ <code>string</code>
            * [._getNewSubjectId([base])](#module_AclDoc--AclDoc+_getNewSubjectId) ⇒ <code>string</code>
        * _inner_
            * [~AclDocOptions](#module_AclDoc--AclDoc..AclDocOptions) : <code>object</code>

<a name="exp_module_AclDoc--AclDoc"></a>

### AclDoc ⏏
**Kind**: Exported class  
<a name="new_module_AclDoc--AclDoc_new"></a>

#### new AclDoc([options])
Class for storing information of an acl file


| Param | Type |
| --- | --- |
| [options] | <code>AclDocOptions</code> | 

<a name="module_AclDoc--AclDoc+rules"></a>

#### aclDoc.rules : <code>Object.&lt;string, AclRule&gt;</code>
**Kind**: instance property of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  
<a name="module_AclDoc--AclDoc+otherQuads"></a>

#### aclDoc.otherQuads : <code>Array.&lt;Quad&gt;</code>
**Kind**: instance property of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  
<a name="module_AclDoc--AclDoc+addRule"></a>

#### aclDoc.addRule(permissions, agents, [accessTo], [subjectId])
**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  

| Param | Type |
| --- | --- |
| permissions | <code>Permissions</code> | 
| agents | <code>Agents</code> | 
| [accessTo] | <code>string</code> | 
| [subjectId] | <code>string</code> | 

<a name="module_AclDoc--AclDoc+hasRule"></a>

#### aclDoc.hasRule(rule) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  
**Returns**: <code>boolean</code> - true if this combination of these agents have the permissions for the accessTo file  

| Param | Type |
| --- | --- |
| rule | <code>AclRule</code> | 

<a name="module_AclDoc--AclDoc+deleteRule"></a>

#### aclDoc.deleteRule(rule)
**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  

| Param | Type |
| --- | --- |
| rule | <code>AclRule</code> | 

<a name="module_AclDoc--AclDoc+deleteBySubject"></a>

#### aclDoc.deleteBySubject(subjectId, [rule])
**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  

| Param | Type | Description |
| --- | --- | --- |
| subjectId | <code>string</code> |  |
| [rule] | <code>AclRule</code> | if not specified it will delete the entire subject group |

<a name="module_AclDoc--AclDoc+deleteAgents"></a>

#### aclDoc.deleteAgents(agents)
**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  

| Param | Type |
| --- | --- |
| agents | <code>Agents</code> | 

<a name="module_AclDoc--AclDoc+deletePermissions"></a>

#### aclDoc.deletePermissions(permissions)
**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  

| Param | Type |
| --- | --- |
| permissions | <code>Permissions</code> | 

<a name="module_AclDoc--AclDoc+getPermissionsFor"></a>

#### aclDoc.getPermissionsFor(agents) ⇒ <code>Permissions</code>
Get all permissions a specific group of agents has
Ignores accessTo

**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  

| Param | Type |
| --- | --- |
| agents | <code>Agents</code> | 

<a name="module_AclDoc--AclDoc+getAgentsWith"></a>

#### aclDoc.getAgentsWith(permissions) ⇒ <code>Agents</code>
**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  

| Param | Type |
| --- | --- |
| permissions | <code>Permissions</code> | 

<a name="module_AclDoc--AclDoc+getMinifiedRules"></a>

#### aclDoc.getMinifiedRules() ⇒ <code>Object.&lt;string, AclRule&gt;</code>
Use this to get all rules for converting to turtle

**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  
<a name="module_AclDoc--AclDoc+addOther"></a>

#### aclDoc.addOther(other)
add data which isn't an access restriction

**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  

| Param | Type |
| --- | --- |
| other | <code>Quad</code> | 

<a name="module_AclDoc--AclDoc+toTurtle"></a>

#### aclDoc.toTurtle()
Create the turtle representation for this acl document

**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  
<a name="module_AclDoc--AclDoc+_ruleFromArgs"></a>

#### aclDoc.\_ruleFromArgs() ⇒ <code>AclRule</code>
**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  
<a name="module_AclDoc--AclDoc+_getDefaultAccessTo"></a>

#### aclDoc.\_getDefaultAccessTo() ⇒ <code>string</code>
**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  
<a name="module_AclDoc--AclDoc+_getNewSubjectId"></a>

#### aclDoc.\_getNewSubjectId([base]) ⇒ <code>string</code>
Get an unused subject id

**Kind**: instance method of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [base] | <code>string</code> | <code>&quot;&#x27;new-acl-rule&#x27;&quot;</code> | The newly generated id will begin with this base id |

<a name="module_AclDoc--AclDoc..AclDocOptions"></a>

#### AclDoc~AclDocOptions : <code>object</code>
**Kind**: inner typedef of [<code>AclDoc</code>](#exp_module_AclDoc--AclDoc)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [defaultAccessTo] | <code>string</code> | Url to the file/folder which will be granted access to |

<a name="module_AclParser"></a>

## AclParser

* [AclParser](#module_AclParser)
    * [AclParser](#exp_module_AclParser--AclParser) ⏏
        * [new AclParser([baseIRI])](#new_module_AclParser--AclParser_new)
        * [.turtleToAclDoc(aclTurtle)](#module_AclParser--AclParser+turtleToAclDoc) ⇒ <code>Promise.&lt;AclDoc&gt;</code>
        * [._parseRules(turtle, ruleCallback, otherCallback)](#module_AclParser--AclParser+_parseRules) ⇒ <code>Promise.&lt;void&gt;</code>
        * [._addQuadToRule(rule, quad)](#module_AclParser--AclParser+_addQuadToRule)
        * [.aclDocToTurtle(doc)](#module_AclParser--AclParser+aclDocToTurtle) ⇒ <code>string</code>
        * [._ruleToQuads(subjectId, rule)](#module_AclParser--AclParser+_ruleToQuads) ⇒ <code>Array.&lt;N3.Quad&gt;</code>

<a name="exp_module_AclParser--AclParser"></a>

### AclParser ⏏
**Kind**: Exported class  
<a name="new_module_AclParser--AclParser_new"></a>

#### new AclParser([baseIRI])
Class for parsing a turtle representation of an acl file into an instance of the Acl class


| Param | Type | Default |
| --- | --- | --- |
| [baseIRI] | <code>string</code> | <code>&quot;./&quot;</code> | 

<a name="module_AclParser--AclParser+turtleToAclDoc"></a>

#### aclParser.turtleToAclDoc(aclTurtle) ⇒ <code>Promise.&lt;AclDoc&gt;</code>
**Kind**: instance method of [<code>AclParser</code>](#exp_module_AclParser--AclParser)  

| Param | Type |
| --- | --- |
| aclTurtle | <code>string</code> | 

<a name="module_AclParser--AclParser+_parseRules"></a>

#### aclParser.\_parseRules(turtle, ruleCallback, otherCallback) ⇒ <code>Promise.&lt;void&gt;</code>
**Kind**: instance method of [<code>AclParser</code>](#exp_module_AclParser--AclParser)  

| Param | Type |
| --- | --- |
| turtle | <code>string</code> | 
| ruleCallback | <code>function</code> | 
| otherCallback | <code>function</code> | 

<a name="module_AclParser--AclParser+_addQuadToRule"></a>

#### aclParser.\_addQuadToRule(rule, quad)
**Kind**: instance method of [<code>AclParser</code>](#exp_module_AclParser--AclParser)  

| Param | Type |
| --- | --- |
| rule | <code>AclRule</code> | 
| quad | <code>N3.Quad</code> | 

<a name="module_AclParser--AclParser+aclDocToTurtle"></a>

#### aclParser.aclDocToTurtle(doc) ⇒ <code>string</code>
**Kind**: instance method of [<code>AclParser</code>](#exp_module_AclParser--AclParser)  

| Param | Type |
| --- | --- |
| doc | <code>AclDoc</code> | 

<a name="module_AclParser--AclParser+_ruleToQuads"></a>

#### aclParser.\_ruleToQuads(subjectId, rule) ⇒ <code>Array.&lt;N3.Quad&gt;</code>
**Kind**: instance method of [<code>AclParser</code>](#exp_module_AclParser--AclParser)  

| Param | Type |
| --- | --- |
| subjectId | <code>string</code> | 
| rule | <code>AclRule</code> | 

<a name="module_AclRule"></a>

## AclRule

* [AclRule](#module_AclRule)
    * [AclRule](#exp_module_AclRule--AclRule) ⏏
        * [new AclRule(permissions, agents, [accessTo], options)](#new_module_AclRule--AclRule_new)
        * _instance_
            * [.clone()](#module_AclRule--AclRule+clone) ⇒ <code>AclRule</code>
            * [.equals(other)](#module_AclRule--AclRule+equals) ⇒ <code>boolean</code>
            * [.includes(other)](#module_AclRule--AclRule+includes) ⇒ <code>boolean</code>
            * [.hasNoEffect()](#module_AclRule--AclRule+hasNoEffect) ⇒ <code>boolean</code>
        * _static_
            * [.from(first, [agents], [accessTo], [options])](#module_AclRule--AclRule.from) ⇒ <code>AclRule</code>
            * [.common(first, second)](#module_AclRule--AclRule.common) ⇒ <code>AclRule</code>
            * [.subtract(first, second)](#module_AclRule--AclRule.subtract) ⇒ <code>Array.&lt;AclRule&gt;</code>
        * _inner_
            * [~AclRuleOptions](#module_AclRule--AclRule..AclRuleOptions) : <code>object</code>

<a name="exp_module_AclRule--AclRule"></a>

### AclRule ⏏
**Kind**: Exported class  
<a name="new_module_AclRule--AclRule_new"></a>

#### new AclRule(permissions, agents, [accessTo], options)
Groups together permissions, agents and other relevant information for an acl rule


| Param | Type | Default |
| --- | --- | --- |
| permissions | <code>Permissions</code> |  | 
| agents | <code>Agents</code> |  | 
| [accessTo] | <code>Array.&lt;string&gt;</code> \| <code>string</code> | <code>[]</code> | 
| options | <code>AclRuleOptions</code> |  | 

<a name="module_AclRule--AclRule+clone"></a>

#### aclRule.clone() ⇒ <code>AclRule</code>
**Kind**: instance method of [<code>AclRule</code>](#exp_module_AclRule--AclRule)  
<a name="module_AclRule--AclRule+equals"></a>

#### aclRule.equals(other) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>AclRule</code>](#exp_module_AclRule--AclRule)  

| Param | Type |
| --- | --- |
| other | <code>AclRule</code> | 

<a name="module_AclRule--AclRule+includes"></a>

#### aclRule.includes(other) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>AclRule</code>](#exp_module_AclRule--AclRule)  

| Param | Type |
| --- | --- |
| other | <code>AclRule</code> | 

<a name="module_AclRule--AclRule+hasNoEffect"></a>

#### aclRule.hasNoEffect() ⇒ <code>boolean</code>
Return true when this rule has no effect (No permissions or no agents or no targets)

**Kind**: instance method of [<code>AclRule</code>](#exp_module_AclRule--AclRule)  
<a name="module_AclRule--AclRule.from"></a>

#### AclRule.from(first, [agents], [accessTo], [options]) ⇒ <code>AclRule</code>
**Kind**: static method of [<code>AclRule</code>](#exp_module_AclRule--AclRule)  

| Param | Type |
| --- | --- |
| first | <code>AclRule</code> \| <code>Permissions</code> \| <code>string</code> \| <code>Array.&lt;string&gt;</code> | 
| [agents] | <code>Agents</code> \| <code>string</code> \| <code>Array.&lt;string&gt;</code> | 
| [accessTo] | <code>Array.&lt;string&gt;</code> | 
| [options] | <code>AclRuleOptions</code> | 

<a name="module_AclRule--AclRule.common"></a>

#### AclRule.common(first, second) ⇒ <code>AclRule</code>
Return a new rule with all common permissions, agents, accessTo and quads

**Kind**: static method of [<code>AclRule</code>](#exp_module_AclRule--AclRule)  

| Param | Type |
| --- | --- |
| first | <code>AclRule</code> | 
| second | <code>AclRule</code> | 

<a name="module_AclRule--AclRule.subtract"></a>

#### AclRule.subtract(first, second) ⇒ <code>Array.&lt;AclRule&gt;</code>
Return new rules with all rules from the first which aren't in the second
If the neither the agents nor the permissions are equal, it is split up into two rules
accessTo and otherQuads will be set to the first one

**Kind**: static method of [<code>AclRule</code>](#exp_module_AclRule--AclRule)  

| Param | Type |
| --- | --- |
| first | <code>AclRule</code> | 
| second | <code>AclRule</code> | 

**Example**  
```js
const first = new AclRule([READ, WRITE], ['web', 'id'])
const second = new AclRule(READ, 'web')
console.log(AclRule.subtract(first, second))
// == [
//   AclRule([READ, WRITE], ['id']),
//   AclRule(WRITE, 'web')
// ]
```
<a name="module_AclRule--AclRule..AclRuleOptions"></a>

#### AclRule~AclRuleOptions : <code>object</code>
**Kind**: inner typedef of [<code>AclRule</code>](#exp_module_AclRule--AclRule)  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| [otherQuads] | <code>Array.&lt;Quad&gt;</code> | <code>[]</code> | 
| [default] | <code>string</code> |  | 
| [defaultForNew] | <code>string</code> |  | 

<a name="module_Agents"></a>

## Agents

* [Agents](#module_Agents)
    * [Agents](#exp_module_Agents--Agents) ⏏
        * [new Agents([...webIds])](#new_module_Agents--Agents_new)
        * _instance_
            * [.addWebId([...webIds])](#module_Agents--Agents+addWebId) ⇒ <code>this</code>
            * [.hasWebId(...webIds)](#module_Agents--Agents+hasWebId) ⇒ <code>boolean</code>
            * [.deleteWebId(...webIds)](#module_Agents--Agents+deleteWebId) ⇒ <code>this</code>
            * [.addGroup([...groups])](#module_Agents--Agents+addGroup) ⇒ <code>this</code>
            * [.hasGroup(...groups)](#module_Agents--Agents+hasGroup) ⇒ <code>boolean</code>
            * [.deleteGroup(...groups)](#module_Agents--Agents+deleteGroup) ⇒ <code>this</code>
            * [.addPublic()](#module_Agents--Agents+addPublic) ⇒ <code>this</code>
            * [.hasPublic()](#module_Agents--Agents+hasPublic) ⇒ <code>boolean</code>
            * [.deletePublic()](#module_Agents--Agents+deletePublic) ⇒ <code>this</code>
            * [.addAuthenticated()](#module_Agents--Agents+addAuthenticated) ⇒ <code>this</code>
            * [.hasAuthenticated()](#module_Agents--Agents+hasAuthenticated) ⇒ <code>boolean</code>
            * [.deleteAuthenticated()](#module_Agents--Agents+deleteAuthenticated) ⇒ <code>this</code>
            * [.clone()](#module_Agents--Agents+clone) ⇒ <code>Agents</code>
            * [.equals(other)](#module_Agents--Agents+equals) ⇒ <code>boolean</code>
            * [.includes(other)](#module_Agents--Agents+includes) ⇒ <code>boolean</code>
            * [.isEmpty()](#module_Agents--Agents+isEmpty) ⇒ <code>boolean</code>
        * _static_
            * [.PUBLIC](#module_Agents--Agents.PUBLIC) ⇒ <code>Agents</code>
            * [.AUTHENTICATED](#module_Agents--Agents.AUTHENTICATED) ⇒ <code>Agents</code>
            * [.from(...val)](#module_Agents--Agents.from) ⇒ <code>Agents</code>
            * [.common(first, second)](#module_Agents--Agents.common) ⇒ <code>Agents</code>
            * [.merge(first, second)](#module_Agents--Agents.merge) ⇒ <code>Agents</code>
            * [.subtract(first, second)](#module_Agents--Agents.subtract) ⇒ <code>Agents</code>

<a name="exp_module_Agents--Agents"></a>

### Agents ⏏
**Kind**: Exported class  
<a name="new_module_Agents--Agents_new"></a>

#### new Agents([...webIds])
class describing multiple agents


| Param | Type |
| --- | --- |
| [...webIds] | <code>string</code> | 

<a name="module_Agents--Agents+addWebId"></a>

#### agents.addWebId([...webIds]) ⇒ <code>this</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| [...webIds] | <code>string</code> | 

<a name="module_Agents--Agents+hasWebId"></a>

#### agents.hasWebId(...webIds) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| ...webIds | <code>string</code> | 

<a name="module_Agents--Agents+deleteWebId"></a>

#### agents.deleteWebId(...webIds) ⇒ <code>this</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| ...webIds | <code>string</code> | 

<a name="module_Agents--Agents+addGroup"></a>

#### agents.addGroup([...groups]) ⇒ <code>this</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type | Description |
| --- | --- | --- |
| [...groups] | <code>string</code> | link to vcard:Group |

<a name="module_Agents--Agents+hasGroup"></a>

#### agents.hasGroup(...groups) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| ...groups | <code>string</code> | 

<a name="module_Agents--Agents+deleteGroup"></a>

#### agents.deleteGroup(...groups) ⇒ <code>this</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| ...groups | <code>string</code> | 

<a name="module_Agents--Agents+addPublic"></a>

#### agents.addPublic() ⇒ <code>this</code>
Access is given to everyone

**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents+hasPublic"></a>

#### agents.hasPublic() ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents+deletePublic"></a>

#### agents.deletePublic() ⇒ <code>this</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents+addAuthenticated"></a>

#### agents.addAuthenticated() ⇒ <code>this</code>
Access is only given to people who have logged on and provided a specific ID

**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents+hasAuthenticated"></a>

#### agents.hasAuthenticated() ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents+deleteAuthenticated"></a>

#### agents.deleteAuthenticated() ⇒ <code>this</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents+clone"></a>

#### agents.clone() ⇒ <code>Agents</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents+equals"></a>

#### agents.equals(other) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| other | <code>Agents</code> | 

<a name="module_Agents--Agents+includes"></a>

#### agents.includes(other) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| other | <code>Agents</code> | 

<a name="module_Agents--Agents+isEmpty"></a>

#### agents.isEmpty() ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents.PUBLIC"></a>

#### Agents.PUBLIC ⇒ <code>Agents</code>
**Kind**: static property of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents.AUTHENTICATED"></a>

#### Agents.AUTHENTICATED ⇒ <code>Agents</code>
**Kind**: static property of [<code>Agents</code>](#exp_module_Agents--Agents)  
<a name="module_Agents--Agents.from"></a>

#### Agents.from(...val) ⇒ <code>Agents</code>
**Kind**: static method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| ...val | <code>Agents</code> \| <code>string</code> \| <code>Array.&lt;string&gt;</code> | 

<a name="module_Agents--Agents.common"></a>

#### Agents.common(first, second) ⇒ <code>Agents</code>
Return all common agents

**Kind**: static method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| first | <code>Agents</code> | 
| second | <code>Agents</code> | 

<a name="module_Agents--Agents.merge"></a>

#### Agents.merge(first, second) ⇒ <code>Agents</code>
Return a new Agents instance which includes all agents from first and second

**Kind**: static method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| first | <code>Agents</code> | 
| second | <code>Agents</code> | 

<a name="module_Agents--Agents.subtract"></a>

#### Agents.subtract(first, second) ⇒ <code>Agents</code>
Return all agents from the first which are not in the second

**Kind**: static method of [<code>Agents</code>](#exp_module_Agents--Agents)  

| Param | Type |
| --- | --- |
| first | <code>Agents</code> | 
| second | <code>Agents</code> | 

<a name="module_Permissions"></a>

## Permissions

* [Permissions](#module_Permissions)
    * [Permissions](#exp_module_Permissions--Permissions) ⏏
        * [new Permissions(...permissions)](#new_module_Permissions--Permissions_new)
        * _instance_
            * [.permissions](#module_Permissions--Permissions+permissions) : <code>Set.&lt;string&gt;</code>
            * [.add(...permissions)](#module_Permissions--Permissions+add) ⇒ <code>this</code>
            * [.has(...permissions)](#module_Permissions--Permissions+has) ⇒ <code>boolean</code>
            * [.delete(...permissions)](#module_Permissions--Permissions+delete) ⇒ <code>this</code>
            * [.equals(other)](#module_Permissions--Permissions+equals) ⇒ <code>boolean</code>
            * [.includes(other)](#module_Permissions--Permissions+includes) ⇒ <code>boolean</code>
            * [.clone()](#module_Permissions--Permissions+clone) ⇒ <code>Permissions</code>
            * [.isEmpty()](#module_Permissions--Permissions+isEmpty) ⇒ <code>boolean</code>
            * [._assertValidPermissions(...permissions)](#module_Permissions--Permissions+_assertValidPermissions)
            * [.Symbol.iterator()](#module_Permissions--Permissions+Symbol.iterator) ⇒ <code>IterableIterator.&lt;string&gt;</code>
        * _static_
            * [.from(...val)](#module_Permissions--Permissions.from) ⇒ <code>Permissions</code>
            * [.common(first, second)](#module_Permissions--Permissions.common) ⇒ <code>Permissions</code>
            * [.merge(first, second)](#module_Permissions--Permissions.merge) ⇒ <code>Permissions</code>
            * [.subtract(first, second)](#module_Permissions--Permissions.subtract) ⇒ <code>Permissions</code>

<a name="exp_module_Permissions--Permissions"></a>

### Permissions ⏏
**Kind**: Exported class  
<a name="new_module_Permissions--Permissions_new"></a>

#### new Permissions(...permissions)

| Param | Type |
| --- | --- |
| ...permissions | <code>string</code> | 

<a name="module_Permissions--Permissions+permissions"></a>

#### permissions.permissions : <code>Set.&lt;string&gt;</code>
**Kind**: instance property of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  
<a name="module_Permissions--Permissions+add"></a>

#### permissions.add(...permissions) ⇒ <code>this</code>
**Kind**: instance method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| ...permissions | <code>string</code> | 

<a name="module_Permissions--Permissions+has"></a>

#### permissions.has(...permissions) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| ...permissions | <code>string</code> | 

<a name="module_Permissions--Permissions+delete"></a>

#### permissions.delete(...permissions) ⇒ <code>this</code>
**Kind**: instance method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| ...permissions | <code>string</code> | 

<a name="module_Permissions--Permissions+equals"></a>

#### permissions.equals(other) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| other | <code>Permissions</code> | 

<a name="module_Permissions--Permissions+includes"></a>

#### permissions.includes(other) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| other | <code>Permissions</code> | 

<a name="module_Permissions--Permissions+clone"></a>

#### permissions.clone() ⇒ <code>Permissions</code>
**Kind**: instance method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  
<a name="module_Permissions--Permissions+isEmpty"></a>

#### permissions.isEmpty() ⇒ <code>boolean</code>
Return true when no permissions are stored

**Kind**: instance method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  
<a name="module_Permissions--Permissions+_assertValidPermissions"></a>

#### permissions.\_assertValidPermissions(...permissions)
**Kind**: instance method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| ...permissions | <code>string</code> | 

<a name="module_Permissions--Permissions+Symbol.iterator"></a>

#### permissions.Symbol.iterator() ⇒ <code>IterableIterator.&lt;string&gt;</code>
Make a permissions instance iterable

**Kind**: instance method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  
<a name="module_Permissions--Permissions.from"></a>

#### Permissions.from(...val) ⇒ <code>Permissions</code>
**Kind**: static method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| ...val | <code>Permissions</code> \| <code>string</code> \| <code>Array.&lt;string&gt;</code> | 

<a name="module_Permissions--Permissions.common"></a>

#### Permissions.common(first, second) ⇒ <code>Permissions</code>
Return all common permissions

**Kind**: static method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| first | <code>Permissions</code> | 
| second | <code>Permissions</code> | 

<a name="module_Permissions--Permissions.merge"></a>

#### Permissions.merge(first, second) ⇒ <code>Permissions</code>
Return all permissions which are in at least one of [first, second]

**Kind**: static method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| first | <code>Permissions</code> | 
| second | <code>Permissions</code> | 

<a name="module_Permissions--Permissions.subtract"></a>

#### Permissions.subtract(first, second) ⇒ <code>Permissions</code>
Return all permissions from the first which aren't in the second

**Kind**: static method of [<code>Permissions</code>](#exp_module_Permissions--Permissions)  

| Param | Type |
| --- | --- |
| first | <code>Permissions</code> | 
| second | <code>Permissions</code> | 

<a name="iterableEquals"></a>

## iterableEquals(a, b) ⇒ <code>boolean</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| a | <code>Iterable</code> | 
| b | <code>Iterable</code> | 

