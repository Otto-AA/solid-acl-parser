# Solid ACL Parser
[![Build Status](https://travis-ci.org/Otto-AA/solid-acl-parser.svg?branch=master)](https://travis-ci.org/Otto-AA/solid-acl-parser)

A js library for working with acl files. It allows you to parse the turtle representation, update permissions and agents, and finally convert it back to turtle. *It does not cover fetching acl files.*

If you don't want to manually fetch and update the acl file, you can take a look at [solid-acl-utils](https://github.com/Otto-AA/solid-acl-utils).


# Status of the project
Everything which seems necessary has been implemented. It is not well tested, but _should work_.


# Documentation
Please refer to this website for documentation: https://otto-aa.github.io/solid-acl-parser/


## Basic example
This example demonstrates how to parse a turtle string into an AclDoc object, then modify the permissions for a specific user and finally parse it back to turtle.

```javascript
const SolidAclParser = require('SolicAclParser')

const webId = 'https://solid.example.org/profile/card#me'
const aclUrl = 'https://pod.example.org/private/file.ext.acl'
const fileUrl = 'https://pod.example.org/private/file.ext'
const turtle = `
@prefix   acl:  <http://www.w3.org/ns/auth/acl#>.
@prefix  foaf:  <http://xmlns.com/foaf/0.1/>.

<#authorization2>
    a               acl:Authorization;
    acl:agentClass  foaf:Agent;                               # everyone
    acl:mode        acl:Read;                                 # has Read-only access
    acl:accessTo    <https://alice.databox.me/profile/card>.`

const { AclParser, Permissions } = SolidAclParser
const { WRITE, CONTROL } = Permissions

async function main() {
  // Parse the turtle to an AclDoc object which we can modify
  const parser = new AclParser({ aclUrl, fileUrl })
  const doc = await parser.turtleToAclDoc(turtle)

  // Give the webId WRITE and CONTROL permissions
  doc.addRule([WRITE, CONTROL], webId)

  // Parse it back to turtle so we can store it in the pod
  const newTurtle = await parser.aclDocToTurtle(doc)
  console.log(newTurtle)
}
main()
```

Output turtle
```text/turtle
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

<https://pod.example.org/private/file.ext.acl#authorization2> a acl:Authorization;
    acl:agentClass foaf:Agent;
    acl:accessTo <https://pod.example.org/private/file.ext>;
    acl:mode acl:Read.
<solid-acl-parser-rule-0> a acl:Authorization;
    acl:agent <https://solid.example.org/profile/card#me>;
    acl:accessTo <https://pod.example.org/private/file.ext>;
    acl:mode acl:Write, acl:Control.
```