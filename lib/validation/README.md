We need runtime validated forms to crud data either on the client or server side (e.g., the prisma schema under the /prisma dir).

This could sometimes be a pain in the ass to create, manage, reason throug.
To accomplish this well, we'll need a couple of things.

1. A schema to describe the shape of data both the client and server is to expect from the form
2. An exported Typescript type for our Frontend Components and Database ORM 

## Naming Things

|name|nomenclature|casing|example|
|-|-|-|-|
|runtime object schema| [Entity][Action][Schema] |camelCase|messengerSchema|
|typescript interface| [Entity][Context] |PascalCase|MessengerInput (for api/services) or MessengerValues(for forms)|


## Passing Data Around

to simplify frontend data handling, we want the UI to accept full entity objects and have the api pull out relevant details

an example of this is having the UI pass customer objects through zod, but have underlying services and apis pull out the relevant properties from those objects