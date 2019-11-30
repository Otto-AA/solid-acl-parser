import * as N3 from 'n3'
import AclDoc from '../../src/AclDoc'
import AclRule from '../../src/AclRule'
import Permissions from '../../src/Permissions'
import Agents from '../../src/Agents'

const { READ, WRITE, CONTROL } = Permissions

/**
 * @typedef Sample
 * @property {string} description
 * @property {string} turtle
 * @property {string} aclUrl
 * @property {string} fileUrl
 * @property {function(): AclDoc} getAclDoc
 */

/** @type {Sample[]} */
const samples = [
  {
    description: 'WAC-Spec | Example WAC Document',
    turtle: `
# Contents of https://alice.databox.me/docs/file1.acl
@prefix  acl:  <http://www.w3.org/ns/auth/acl#>  .

<#authorization1>
    a             acl:Authorization;
    acl:agent     <https://alice.databox.me/profile/card#me>;  # Alice's WebID
    acl:accessTo  <https://alice.databox.me/docs/file1>;
    acl:mode      acl:Read, 
                  acl:Write, 
                  acl:Control.`,
    aclUrl: 'https://alice.databox.me/docs/file1.acl',
    fileUrl: 'https://alice.databox.me/docs/file1',
    getAclDoc () {
      const doc = new AclDoc({ accessTo: this.fileUrl })
      doc.addRule([READ, WRITE, CONTROL], 'https://alice.databox.me/profile/card#me', { subjectId: `${this.aclUrl}#authorization1` })
      return doc
    }
  }, {
    description: 'WAC-Spec | Group example',
    turtle: `
# Contents of https://alice.databox.me/docs/shared-file1.acl
@prefix  acl:  <http://www.w3.org/ns/auth/acl#>.

# Individual authorization - Alice has Read/Write/Control access
<#authorization1>
    a             acl:Authorization;
    acl:accessTo  <https://alice.example.com/docs/shared-file1>;
    acl:mode      acl:Read,
                  acl:Write, 
                  acl:Control;
    acl:agent     <https://alice.example.com/profile/card#me>.

# Group authorization, giving Read/Write access to two groups, which are
# specified in the 'work-groups' document.
<#authorization2>
    a               acl:Authorization;
    acl:accessTo    <https://alice.example.com/docs/shared-file1>;
    acl:mode        acl:Read,
                    acl:Write;
    acl:agentGroup  <https://alice.example.com/work-groups#Accounting>;
    acl:agentGroup  <https://alice.example.com/work-groups#Management>.`,
    aclUrl: 'https://alice.databox.me/docs/shared-file1.acl',
    fileUrl: 'https://alice.example.com/docs/shared-file1',
    getAclDoc () {
      const doc = new AclDoc({ accessTo: this.fileUrl })
      doc.addRule([READ, WRITE, CONTROL], 'https://alice.example.com/profile/card#me', { subjectId: `${this.aclUrl}#authorization1` })

      const agents = new Agents()
      agents.addGroup('https://alice.example.com/work-groups#Accounting', 'https://alice.example.com/work-groups#Management')
      doc.addRule([READ, WRITE], agents, { subjectId: `${this.aclUrl}#authorization2` })

      return doc
    }
  }, {
    description: 'WAC-Spec | Public Access example',
    turtle: `
@prefix   acl:  <http://www.w3.org/ns/auth/acl#>.
@prefix  foaf:  <http://xmlns.com/foaf/0.1/>.

<#authorization2>
    a               acl:Authorization;
    acl:agentClass  foaf:Agent;                               # everyone
    acl:mode        acl:Read;                                 # has Read-only access
    acl:accessTo    <https://alice.databox.me/profile/card>.  # to the public profile`,
    aclUrl: 'https://alice.databox.me/profile/card.acl',
    fileUrl: 'https://alice.databox.me/profile/card',
    getAclDoc () {
      const doc = new AclDoc({ accessTo: this.fileUrl })
      doc.addRule(READ, Agents.PUBLIC, { subjectId: `${this.aclUrl}#authorization2` })
      return doc
    }
  }, {
    description: 'WAC-Spec | Authenticated Agents example',
    turtle: `
    @prefix   acl:  <http://www.w3.org/ns/auth/acl#>.
    @prefix  foaf:  <http://xmlns.com/foaf/0.1/>.
    
    <#authorization2>
        a               acl:Authorization;
        acl:agentClass  acl:AuthenticatedAgent;                   # everyone
        acl:mode        acl:Read;                                 # has Read-only access
        acl:accessTo    <https://alice.databox.me/profile/card>.  # to the public profile`,
    aclUrl: 'https://alice.databox.me/profile/card.acl',
    fileUrl: 'https://alice.databox.me/profile/card',
    getAclDoc () {
      const doc = new AclDoc({ accessTo: this.fileUrl })
      doc.addRule(READ, Agents.AUTHENTICATED, { subjectId: `${this.aclUrl}#authorization2` })
      return doc
    }
  }, {
    description: 'WAC-Spec | Default (Inherited) Authorizations example',
    turtle: `
    # Contents of https://alice.databox.me/docs/.acl
    @prefix  acl:  <http://www.w3.org/ns/auth/acl#>.
    
    <#authorization1>
        a                  acl:Authorization;
    
        # These statements specify access rules for the /docs/ container itself:
        acl:agent          <https://alice.databox.me/profile/card#me>;
        acl:accessTo       <https://alice.databox.me/docs/>;
        acl:mode           acl:Read, 
                           acl:Write, 
                           acl:Control;
    
        # default says: this authorization (the statements above) 
        #   will also be inherited by any resource within that container 
        #   that doesn't have its own ACL.
        acl:default  <https://alice.databox.me/docs/>.`,
    aclUrl: 'https://alice.databox.me/docs/.acl',
    fileUrl: 'https://alice.databox.me/docs/',
    getAclDoc () {
      const doc = new AclDoc({ accessTo: this.fileUrl })

      const rule = new AclRule([READ, WRITE, CONTROL], 'https://alice.databox.me/profile/card#me', undefined, { default: this.fileUrl })
      doc.addRule(rule, null, { subjectId: `${this.aclUrl}#authorization1` })

      return doc
    }
  }, {
    description: 'NSS | /public/.acl',
    turtle: `
# ACL resource for the public folder
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

# The owner has all permissions
<#owner>
    a acl:Authorization;
    acl:agent <https://example.solid.community/profile/card#me>;
    acl:accessTo <./>;
    acl:defaultForNew <./>;
    acl:mode acl:Read, acl:Write, acl:Control.

# The public has read permissions
<#public>
    a acl:Authorization;
    acl:agentClass foaf:Agent;
    acl:accessTo <./>;
    acl:defaultForNew <./>;
    acl:mode acl:Read.`,
    aclUrl: 'https://example.solid.community/public/.acl',
    fileUrl: 'https://example.solid.community/public/',
    getAclDoc () {
      const doc = new AclDoc({ accessTo: this.fileUrl })

      const ownerRule = new AclRule([READ, WRITE, CONTROL], 'https://example.solid.community/profile/card#me', undefined, { default: this.fileUrl, defaultForNew: this.fileUrl })
      doc.addRule(ownerRule, null, { subjectId: `${this.aclUrl}#owner` })

      const publicRule = new AclRule(READ, Agents.PUBLIC, undefined, { default: this.fileUrl, defaultForNew: this.fileUrl })
      doc.addRule(publicRule, null, { subjectId: `${this.aclUrl}#public` })

      return doc
    }
  }, {
    description: 'NSS | /private/.acl',
    turtle: `
    # ACL resource for the private folder
    @prefix acl: <http://www.w3.org/ns/auth/acl#>.
    
    # The owner has all permissions
    <#owner>
        a acl:Authorization;
        acl:agent <https://example.solid.community/profile/card#me>;
        acl:accessTo <./>;
        acl:defaultForNew <./>;
        acl:mode acl:Read, acl:Write, acl:Control.`,
    aclUrl: 'https://example.solid.community/private/.acl',
    fileUrl: 'https://example.solid.community/private/',
    getAclDoc () {
      const doc = new AclDoc({ accessTo: this.fileUrl })

      const ownerRule = new AclRule([READ, WRITE, CONTROL], 'https://example.solid.community/profile/card#me', undefined, { default: this.fileUrl, defaultForNew: this.fileUrl })
      doc.addRule(ownerRule, null, { subjectId: `${this.aclUrl}#owner` })

      return doc
    }
  }, {
    description: 'NSS | /.acl (root)',
    turtle: `
    # Root ACL resource for the user account
    @prefix acl: <http://www.w3.org/ns/auth/acl#>.
    
    <#owner>
        a acl:Authorization;
    
        acl:agent <https://example.solid.community/profile/card#me> ;
    
        # Optional owner email, to be used for account recovery:
        acl:agent <mailto:user@example.org>;
    
        # Set the access to the root storage folder itself
        acl:accessTo </>;
    
        # All resources will inherit this authorization, by default
        acl:defaultForNew </>;
    
        # The owner has all of the access modes allowed
        acl:mode
            acl:Read, acl:Write, acl:Control.
    
    # Data is private by default; no other agents get access unless specifically
    # authorized in other .acls`,
    aclUrl: 'https://example.solid.community/.acl',
    fileUrl: 'https://example.solid.community/',
    getAclDoc () {
      const doc = new AclDoc({ accessTo: this.fileUrl })
      const agents = new Agents('https://example.solid.community/profile/card#me', 'mailto:user@example.org')
      const rule = new AclRule([READ, WRITE, CONTROL], agents, undefined, { default: this.fileUrl, defaultForNew: this.fileUrl })
      doc.addRule(rule, null, { subjectId: `${this.aclUrl}#owner` })

      return doc
    }
  }, {
    description: 'Custom | Check if non-aclRule triples are stored',
    turtle: `
@prefix   acl:  <http://www.w3.org/ns/auth/acl#>.
@prefix  foaf:  <http://xmlns.com/foaf/0.1/>.

<#authorization2>
    a               acl:Authorization;
    foaf:name       "Jane Doe";
    acl:agentClass  foaf:Agent;                               # everyone
    acl:mode        acl:Read;                                 # has Read-only access
    acl:accessTo    <https://alice.databox.me/profile/card>.  # to the public profile

<#me>
    foaf:givenName  "Jane".`,
    aclUrl: 'https://alice.databox.me/profile/card.acl',
    fileUrl: 'https://alice.databox.me/profile/card',
    getAclDoc () {
      const doc = new AclDoc({ accessTo: this.fileUrl })

      const { DataFactory: { quad, namedNode, literal } } = N3
      const name = quad(
        namedNode(`${this.aclUrl}#authorization2`),
        namedNode('http://xmlns.com/foaf/0.1/name'),
        literal('Jane Doe')
      )
      const givenName = quad(
        namedNode(`${this.aclUrl}#me`),
        namedNode('http://xmlns.com/foaf/0.1/givenName'),
        literal('Jane')
      )

      const rule = new AclRule(READ, Agents.PUBLIC, undefined, { otherQuads: [ name ] })
      doc.addRule(rule, null, { subjectId: `${this.aclUrl}#authorization2` })
      doc.addOther(givenName)

      return doc
    }
  }
]

export default samples
