# Quickstart
In this section the basic usage will be explained which should be sufficient for most use cases.

## Installing
**Warning:** In the future installing will be handled mainly via npm. Following is only temporary.

### Via CDN
Only use this for testing, this link will be broken in the future.

```text/html
<script type="application/javascript" src="https://cdn.jsdelivr.net/gh/otto-aa/acl-utils/dist/browser/acl-utils.bundle.js"></script>
<script type="application/javascript">
  const { AclParser, AclDoc, AclRule, Permissions, Agents } = AclUtils
  const { READ, WRITE, APPEND, CONTROL } = Permissions

  // Your code
</script>
```

### Downloading the build files
You can download the build files from the dist folder in the github repository and then do the same as in *Via CDN*

### Downloading the src
If you use a build tool yourself, you can download the src from the github repository and import it into your project. (Documentation for that will come with NPM)

## Basic example
This example demonstrates how to parse a turtle string into an AclDoc object, then modify the permissions for a specific user and finally parse it back to turtle.

*Tip: You can copy paste all complete example like this [here](./run.html ':ignore') to run it in CodePen*

```javascript
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

const { AclParser, Permissions } = AclUtils
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
<acl-utils-rule-0> a acl:Authorization;
    acl:agent <https://solid.example.org/profile/card#me>;
    acl:accessTo <https://pod.example.org/private/file.ext>;
    acl:mode acl:Write, acl:Control.
```