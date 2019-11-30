# Quickstart
In this section the basic usage will be explained which should be sufficient for most use cases.

## Installing

### Via NPM
Install it via npm
```sh
npm install --save solid-acl-parser
```
Then import it into your code
```javascript
const SolidAclParser = require('solid-acl-parser')
const { AclParser, AclDoc, AclRule, Permissions, Agents } = SolidAclParser
const { READ, WRITE, APPEND, CONTROL } = Permissions
```

### Via CDN
Just add the script tag with the link to the CDN to your html and you can use SolicAclParser afterwards. To only match a specific version you should use "https://cdn.jsdelivr.net/npm/solid-acl-parser@0.0.1/dist/browser/solid-acl-parser.bundle.js" or similar.

```text/html
<script type="application/javascript" src="https://cdn.jsdelivr.net/npm/solid-acl-parser/dist/browser/solid-acl-parser.bundle.js"></script>
<script type="application/javascript">
  const { AclParser, AclDoc, AclRule, Permissions, Agents } = SolidAclParser
  const { READ, WRITE, APPEND, CONTROL } = Permissions

  // Your code
</script>
```

### Downloading the build files
You can download the build files from the CDN link above and store it to your website. Then do the same, except for using `src="./path/to/solid-acl-parser.bundle.js"`


## Basic example
This example demonstrates how to parse a turtle string into an AclDoc object, then give a specific user more permissions and finally parse it back to turtle.

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
    acl:accessTo    <https://pod.example.org/private/file.ext>.`

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
<https://pod.example.org/private/file.ext#solid-acl-parser-rule-0> a acl:Authorization;
    acl:agent <https://solid.example.org/profile/card#me>;
    acl:accessTo <https://pod.example.org/private/file.ext>;
    acl:mode acl:Write, acl:Control.
```

## Modifying the AclDoc
After parsing the turtle into an AclDoc we can modify the permissions as we wish. Here are some common examples.

### Adding permissions for webIds
In this example we will give two webIds read access to bar.ext and the second webId also write and control permissions.

```javascript
const { AclDoc, Permissions } = SolidAclParser
const { READ, WRITE, CONTROL } = Permissions
const webIds = [
  'https://solid.example.org/profile/card#me',
  'https://second.example.org/profile/card#me'
]
// We will create a new doc here. In general you will likely get it from parsing a turtle
const doc = new AclDoc({ accessTo: 'https://pod.example.org/foo/bar.ext' })

// The first parameter can be an array of permissions or a single permission
// The second parameter can be an array of webIds or a single webId
doc.addRule(READ, webIds)
doc.addRule([WRITE, CONTROL], webIds[1])
```

### Checking if someone has specific permissions
In this example we will check if a webId has read and write permissions to bar.ext

```javascript
const { AclDoc, Permissions } = SolidAclParser
const { READ, WRITE, CONTROL } = Permissions
const webId = 'https://solid.example.org/profile/card#me'

const doc = new AclDoc({ accessTo: 'https://pod.example.org/foo/bar.ext' })
doc.addRule(READ, webId)
console.log(doc.hasRule(READ, webId)) // true
console.log(doc.hasRule([READ, WRITE], webId)) // false
```

### Deleting permissions for someone
Here we will revoke the writing permissions of a webId to bar.ext

```javascript
const { AclDoc, Permissions } = SolidAclParser
const { READ, WRITE, CONTROL } = Permissions
const webId = 'https://solid.example.org/profile/card#me'

const doc = new AclDoc({ accessTo: 'https://pod.example.org/foo/bar.ext' })
doc.addRule([READ, WRITE], webId)
console.log(doc.hasRule(WRITE, webId)) // true

doc.deleteRule(WRITE, webId)
console.log(doc.hasRule(WRITE, webId)) // false
console.log(doc.hasRule(READ, webId)) // true
```

### Working with more advanced agents
In an acl we can not only define permissions for specific webIds, but also for groups and Public agents (which means everyone) and Authenticated agents (which means everyone who is logged on).

In following example we will give everyone read access to the folder foo/
```javascript
const { AclDoc, Permissions, Agents } = SolidAclParser
const { READ, WRITE, CONTROL } = Permissions

const doc = new AclDoc({ accessTo: 'https://pod.example.org/foo/' })

// Note: Following two lines are the same as using Agents.PUBLIC
const agents = new Agents()
agents.addPublic()

doc.addRule(READ, agents)
console.log(doc.hasRule(READ, agents)) // true
doc.deleteRule(READ, Agents.PUBLIC)
console.log(doc.hasRule(READ, agents)) // false
```

### Getting everyone with specific permissions
In this example we will find out who has reading and writing permissions to bar.ext

```javascript
const { AclDoc, Permissions, Agents } = SolidAclParser
const { READ, WRITE, CONTROL } = Permissions
const webId = 'https://solid.example.org/public/card#me'
const groupId = 'https://solid.example.org/work-groups#Accounting'

const doc = new AclDoc({ accessTo: 'https://pod.example.org/foo/' })

const agentsForAdding = new Agents()
agentsForAdding.addWebId(webId)
agentsForAdding.addGroup(groupId)
agentsForAdding.addPublic()

doc.addRule([READ, WRITE], agentsForAdding)

const agents = doc.getAgentsWith(READ, WRITE)
console.log(agents.hasWebId(webId)) // true
console.log(agents.hasGroup(groupId)) // true
console.log(agents.hasPublic()) // true
console.log(agents.hasAuthenticated()) // false

// You can get an array of webIds with [...agents.webIds]
console.log([...agents.webIds]) // ['https://solid.example.org/public/card#me']
console.log([...agents.groups]) // ['https://solid.example.org/work-groups#Accounting']
```

### Getting all permissions of a specific agent
In this example we will check which permissions have been granted to a webId for bar.ext. Note that this only checks for directly given permissions, it doesn't include Public, Authenticated and group permissions when only checking for a webId.

```javascript
const { AclDoc, Permissions, Agents } = SolidAclParser
const { READ, WRITE, CONTROL } = Permissions
const webId = 'https://solid.example.org/public/card#me'

const doc = new AclDoc({ accessTo: 'https://pod.example.org/foo/' })
doc.addRule(WRITE, webId)
doc.addRule(CONTROL, webId)
doc.addRule(READ, Agents.PUBLIC)

const permissions = doc.getPermissionsFor(webId)
console.log(permissions.has(READ)) // false (It doesn't include Public permissions)
console.log(permissions.has(WRITE)) // true
console.log(permissions.has(CONTROL)) // true
console.log([...permissions]) // ["http://www.w3.org/ns/auth/acl#Write", "http://www.w3.org/ns/auth/acl#Control"]
```

### Working with default
In Solid you can specify a default value for folders, which will be used by childs if they don't have an own acl file.
The AclDoc provides two utility methods for creating those and checking if they exist.

```javascript
const { AclDoc, Permissions, Agents } = SolidAclParser
const { READ, WRITE, CONTROL } = Permissions
const webId = 'https://solid.example.org/public/card#me'
const accessTo = 'https://pod.example.org/foo/'

const doc = new AclDoc({ accessTo })

// Give the webId read access to contents of this folder per default
doc.addDefaultRule(READ, webId)  // same as doc.addRule(new AclRule(READ, webId, { default: accessTo }))
doc.addRule(WRITE, webId)

console.log(doc.hasDefaultRule(READ, webId)) // true
console.log(doc.hasDefaultRule(WRITE, webId)) // false
console.log(doc.hasRule([READ, WRITE], webId)) // true
```