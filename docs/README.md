# Solid ACL Parser
[![Build Status](https://travis-ci.org/Otto-AA/solid-acl-parser.svg?branch=master)](https://travis-ci.org/Otto-AA/solid-acl-parser)

A js library for working with acl files. It allows you to parse the turtle representation, update permissions and agents, and finally convert it back to turtle. *It does not cover fetching acl files.*


# Status of the project
Most features of the WAC-spec are already implemented and tested.

Current limitations:
- No support for acl:trustedApp
- No support for multiple accessTo's in the same acl file
- No support for multiple default's in the same rule (subject id group)

# Getting started
See [quickstart](quickstart)