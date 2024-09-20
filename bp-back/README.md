
### Nest API BoilerPlate

- [Overview](#overview)
- [Description](#description)
- [Contributing](#contributing)
- [Technologies Used](#technologies-used)
- [Recommended VSCode Extensions](#recommended-vscode-extensions)
- [Getting Started](#getting-started)
- [Swagger](#swagger)
- [Dependencies](#dependencies)
  - [Mapping and Validation](#mapping-and-validation)
  - [Fake data generator](#fake-data-generator)
  - [Authentication and Security](#authentication-and-security)
  - [Integrations and Middleware](#integrations-and-middleware)
  - [Database and ORM](#database-and-orm)
  - [Other Important Tools](#other-important-tools)
- [Environment Variables](#environment-variables)
- [Code standardization](#code-standardization)
- [How to run the project](#how-to-run-the-project)
  - [Seed base account](#seed-base-account)
- [Pre request for back-end](#pre-request-for-back-end)
- [Good practices and code explanations](#good-practices-and-code-explanations)
- [Prisma](#prisma)
- [Tenant](#tenant)
  - [Adding a New Module](#adding-a-new-module)
  - [Adding a New Role](#adding-a-new-roleg)
  - [Managing Assignments](#managing-assignments)
  - [Including Assignments](#including-assignments)
- [How to generate a new module](#how-to-generate-a-new-module)
  - [Pre generate ⚠️](#pre-generate-️)
  - [Entity Compose name](#entity-compose-name)
  - [Post generate ⚠️](#post-generate-️)
- [How does module-generator work?](#how-does-module-generator-work)
- [Websocket (Socket.IO)](#websocket-socketio)
- [How does docker compose work?](#how-does-docker-compose-work)
  - [Dev](#dev)
  - [Test](#test)
  - [./docker.stop](#dockerstop)
  - [./wait-for](#wait-for)
- [DockerFile](#dockerfile)
- [Tests](#tests)
- [Husky](#husky)
- [Utils](#utils)
- [Modules - Structure](#modules---structure)
  - [Aws](#aws)
  - [Base](#base)
  - [Cache](#cache)
  - [Crons](#crons)
  - [Email](#email)
  - [Health Check](#health-check)
  - [Log](#log)
  - [Mongo](#mongo)
  - [User](#user)
  - [Websocket](#websocket)
  - [Middlewares](#middlewares)
  - [Helpers](#helpers)
  - [Filters](#filters)
  - [Database](#database)
- [Auth - Structure](#auth---structure)
- [Sending Emails](#sending-emails)
- ["i18n"](#i18n)


<hr>

### Overview
This project provides a base API developed using Node.js and NestJS. It is designed to serve as a foundation for new projects in Node/Nest, aiming to reduce the development time for basic functionalities.

<hr>

### Description
The Nest API Template is an ideal starting point for new projects, offering a robust and efficient structure. It streamlines the development process, making it easier to build upon.

The project was based on full docker use.

<hr>

### Contributing
Create pull request describing all the data that has changed and what it improves in the white label.

<hr>

### Technologies Used
- **Node.js**: Version 20.11.0
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: An open-source database toolkit.
- **Python**: Version 3.11.7, used for generating modules.

<hr>

### Recommended VSCode Extensions

- Prisma
- Eslint
- Docker
- Jest
- NestJS Files

<hr>

### Getting Started
- Run 
  ``` bash
  npm i -g @nestjs/cli
  ```
- Run 
  ``` bash
  npm run start:project
  ```
- Set the project name and choose the modules you want in project
- Change the project name in package.json
- Create a .env
- Enter data from .env.example
- Modify the values
- Change the name of the Database within `docker-compose.yml` in the `POSTGRES_DB` key
- Inside `.env` in the variable `DATABASE_URL` change the name `database` to the same name placed in `POSTGRES_DB`
- Run to startup the husky for pre commits and pre pushs
  ```
  npx husky install
  ```
  
Note: Do not modify the .env.test; the docker for tests is configured to run with the environments set in it.

<hr>

### Swagger

Contém toda a documentação dos end points

    localhost:PORT/api/docs/#


### Dependencies

This API uses the following dependencies:

#### Mapping and Validation

- **@automapper/classes**: Used for mapping objects to classes in NestJS projects.
  - [Documentation of AutoMapper](https://automapperts.netlify.app/)
- **@automapper/nestjs**: AutoMapper extension for NestJS, facilitating its integration.
  - [Documentation of AutoMapper para NestJS](https://automapperts.netlify.app/docs/integrations/nestjs)
- **class-transformer**: Used for object transformation and serialization.
  - [GitHub of Class Transformer](https://github.com/typestack/class-transformer)
- **class-validator**: Validation library for classes and objects.
  - [GitHub of Class Validator](https://github.com/typestack/class-validator)

#### Fake data generator

- **@faker-js/faker**: Library for generating fake data for testing.
  - [Documentation of Faker.js](https://fakerjs.dev/guide/)

#### Authentication and Security

- **@nestjs/passport**: 
Passport.js integration with NestJS.
  - [Documentation of NestJS Passport](https://docs.nestjs.com/security/authentication)
- **@nestjs/jwt**: JWT Model for Nest.
  - [Documentation of NestJS JWT](https://docs.nestjs.com/security/authentication)
- **bcrypt**: Library for password hashing.
  - [GitHub of BCrypt to Node.js](https://github.com/kelektiv/node.bcrypt.js)

#### Integrations and Middleware

- **@nestjs/axios**: Axios integration with NestJS for HTTP requests.
  - [Documentation of NestJS Axios](https://docs.nestjs.com/techniques/http-module)
- **@nestjs/platform-express**: Express platform integrated with NestJS.
  - [Documentation of NestJS Platform-Express](https://docs.nestjs.com/first-steps)

#### Database and ORM

- **@nestjs/mongoose**: Mongoose integration with NestJS for MongoDB.
  - [Documentation of NestJS Mongoose](https://docs.nestjs.com/techniques/mongodb)
- **@prisma/client**: Prisma client for database access.
  - [Documentation of Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

#### Other Important Tools

- **puppeteer**: Library for browser automation.
  - [Documentation of Puppeteer](https://pptr.dev/)
- **socket.io**: Library for real-time web applications.
  - [Documentation of Socket.io](https://socket.io/docs/v4)
- **puppeteer**: Library for browser automation.
  - [Puppeteer Documentation](https://pptr.dev/)
- **socket.io**: Library for real-time web applications.
  - [Socket.io Documentation](https://socket.io/docs/v4)
- **Inquirer**: Library for CMD Interactive.
  - [Inquirer Documentation](https://www.npmjs.com/package/inquirer)
- **Generate Password**: Library for generate random passwords
  - [Generate Password](https://www.npmjs.com/package/generate-password-ts)
- **date-fns**: Library for manipulate dates
  - [Date Fns](https://date-fns.org/)

<hr>

### Environment Variables

JWT Configuration

- AT_SECRET: Secret used to generate and verify access tokens.

- RT_SECRET: Secret used to generate and verify refresh tokens.

- TK_EMAIL_SECRET: Secret used to generate and verify email tokens.

- TK_EMAIL_LIFETIME: Lifetime of email tokens.

  expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"

- JWT_ACCESS_LIFETIME: Lifetime of JWT access tokens. 

  expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"

- JWT_REFRESH_LIFETIME: Lifetime of JWT refresh tokens.

  expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"

Application

- ENV: Application execution environment (in this case, "PROD" for production, "DEV" for development "HOMOLOG" for homologation or "TEST" for testing).

- APP_PORT: Port on which the application will run.

- FRONTEND_RECOVER_PASSWORD_URL: Frontend URL for password recovery.

- FRONT_END_URL: FrontEnd URL access.

- MULTIPLE_LOGIN: Indicates whether multiple login is enabled ("true" or "false" value).

- DEACTIVATE_REQUIRED_IPS_IN_REQUEST: Indicates whether IP validation is disabled ("true" or "false" value).

Databases

- DATABASE_URL: This variable contains the URL to connect to the PostgreSQL database. It specifies the username, password, host, port, and database name that the application should use to connect to the database.
    - Note: use the url with encode

- MONGODB_URI: This variable contains the URI to connect to the MongoDB database. It includes the username, password, host, and database name for connecting to MongoDB.
    - Note: use the url with encode
    
Used to search for address by lat and lng

- GOOGLE_API_URL: Google API URL -> https://maps.google.com/maps/api/geocode/json
- GOOGLE_API_KEY: Google API Key

Used to send emails

- SENDGRID_API_KEY: SendGrid API key for sending emails.
- EMAIL_OPTIONS_FROM: Email address that will be used as the sender for sending emails.

Used to upload data to S3

- AWS_SECRET_ACCESS_KEY: AWS secret key with permission to read/delete/create s3 files
- AWS_ACCESS_KEY_ID: AWS access key with permission to read/delete/create s3 files
- AWS_BUCKET_NAME: Name of the AWS S3 bucket for storing files.
- AWS_BUCKET_REGION: AWS region where the bucket is located.

<br>
Encode/Decode: https://meyerweb.com/eric/tools/dencoder/

<hr>

### Code standardization
The project contains eslint and prettier already configured to handle standardization

<hr>

### How to run the project

- Install dependencies:

```bash
npm install
```

- Compose up the development database

```bash
docker compose -f "docker-compose.yml" up -d --build
```

- Run database migrations

```bash
npx prisma migrate dev
```

- Run database seeds

```bash
npx prisma db seed
```

- Start the application

```bash
npm run start:dev
```

or

```bash
npm start
```

<hr>

#### Seed base account

Account created by prisma seed

<b>Email:</b> admin@gmail.com

<b>Password:</b> admin

<hr>

### Pre request for back-end

You must send the real ip from the user in the header by "x-forwarded-for" for the back-end to ip middleware ( if enabled ) or create audit logs
And you must send the language preference by "accept-language" for the back-end

**How?**

``` typescript
fetch('https://api.ipify.org/?format=json')
    .then((response) => response.json())
    .then(data => data.ip)
```
https://www.ipify.org/

**OR**

``` typescript
fetch('https://api64.ipify.org/?format=json')
    .then(response => response.json())
    .then(data => data.ip);
```

https://api64.ipify.org

**OR**

``` typescript
fetch('https://api.bigdatacloud.net/data/client-ip')
    .then(response => response.json())
    .then(data => data.ip);
```
https://api.bigdatacloud.net

<hr>

### Good practices and code explanations

All service classes must contain

``` typescript
optionals?: {
    identifierRequest?: string;
    transaction?: Prisma.TransactionClient;
}
```

Received as a parameter, why?

R: the identifierRequest is a generator UUID that is passed from function to function to be logged together with a message, to have traceability of what happened with the request

example:

``` typescript
const identifierRequest = optionals?.identifierRequest || randomUUID();
this.logger.log(`${identifierRequest} Create user`);
```

Transaction is an instance of a Prisma transaction opened for use elsewhere.

It is necessary when opening a transaction to pass it to all places that will make queries to maintain the database's ACID in queries and transactions

``` typescript
const executeCreate = async (transaction: Prisma.TransactionClient) => {
      return await this.userRepository.createAsync(data, transaction);
    };

    try {
      if (optionals?.transaction) {
        this.logger.debug(`${identifierRequest} Executing in transaction`);

        return await executeCreate(optionals?.transaction);
      } else {
         this.logger.debug(
          `${identifierRequest} Transaction doesn't exists, creating a new transaction`,
        );

        return this.prisma.$transaction(async newTransaction => {
          return await executeCreate(newTransaction);
        });
      }
    } catch (error) {
      this.logger.debug(`${identifierRequest} rollin back transaction`);
      handleError(error, {
        identifierRequest,
      });
    }
```

If a transaction is not passed, it will create one, otherwise it will use the same transaction to carry out the business logic

Within each repository there are parameters:

``` typescript
  async repositoryCall(
    transaction?: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

      return await prisma.user.create({data})
  }
```

Basically, if it received a transaction it will use the open transaction to search/create/delete the data, otherwise it will use a new instance of prism

Service classes, which retrieve consistent entity data, should include an optional mapper for translating the results into another class. Simply specify the source class reflecting the service's response data and your destination class. Afterward, create a new profile mapper in the "x.mapping.ts" file.

Note: If you use the @AutoMap() annotation on the source class entity and create a profile without adding new "forMember" configurations, the class mapper will automatically map the properties. Thus, creating a "forMember" is only necessary when mapping a complex class.

```typescript
mapper: {
    sourceClass: new () => S;
    destinationClass: new () => T;
};
```

Example:

```typescript
  async findByIdAsync<S, T>(
    id: string,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<UserEntity | T | T[]> 
```

and use:

```typescript
const userById = await this.service.findByIdAsync(
      id,
      currentUser,
      getLanguage(request.headers['accept-language']),
      {
        mapper: {
          sourceClass: UserEntity,
          destinationClass: UserResponseDto,
        },
      },
    );
```

* End points url

Use kebab-case in case you have modules with compound names

example: "api/sportive-car"

* Classes names

All the Classes name must be Pascal Case

example: "UserCarRepository"

* How does an repository update works?

Basically, the controller will receive the entity through the DO through the body, the id through the url and the version of the entity through query params

    /user/1?version=5

And then the repository (directly in the base function implemented in the interface) will validate whether this version that was indicated is the same as the one saved in the database to avoid race condition

  Example: imagine that 2 users are modifying the same entity at the same time, whoever modifies last has to be warned that the entity he is trying to update is no longer the latest version of it.

``` typescript
 await this.validateVersion(id, Number(data.version), transaction);
```

* How to use Refresh Token in application?

You need to pass the refresh token in header like the authorization as `Bearer ${refreshToken}` and send it in the query params like `api/auth/refresh?YOUR_REFRESH_TOKEN`

<hr>

###  Prisma

The base class must contain "id", "version", "createdAt", "updatedAt", "deletedAt", "status"
When creating the entity, create the assignment enum with the same name but with all capitals to use for access permission

- seed-test
    Contains the seed of the entities initially needed to run the tests
- seeds
    Contains the initial entities to use the application

    email: admin@gmail.com
    password: admin

- migrations
    Contains the generated migration files

    Use standardization: OPERACAO_o_que_foi_modificado
        ex: insert_telephone_on_table_user
        npx prisma migrate dev --name "insert_telephone_on_table_user"
        
- Good practices
    * Do not use includes when not necessary*
        <h5> 90% of scenarios will not be necessary </h5>
    The best way is to create a select and only select what you want to use from the entity
    
    Create a class in the module/dto/type folder with the correct typing to type the return of the prism function and, if necessary, use it to map to the response DTO by the mapper.

<hr>

### Tenant

Tenant structure follows:
 * A user has 1 role, and a role has N modules, and each module has N assignments.
    * A role defines what the user is.
    * A module is one part of the system.
    * An assignment defines what a user can do within a module.
 
 Example:
 * Role: Admin
 * Modules: [Admin, User]
 * Assignments: [Create, Read, Update, Delete]

<hr>

#### Modules Section

The `modules` section of the permissions structure specifies access control for system modules, identifying which roles can access specific modules and the actions (assignments) permissible within those modules. This mechanism ensures users interact only with modules appropriate to their role's permissions.

Each module is identified by a key from `ModuleEnum`, with its value being an object that contains:

- **`allowedRoles`**: An array of `RoleEnum` entries specifying roles with access to the module.
- **`allowedAssignments`**: An array of `AssignmentsEnum` entries defining permissible actions within the module for those roles.
- **`mainAssignment`**: Main AssignmentEnum of module, that define which assignment can read/update/delete/create data in the module

<hr>

#### Adding a New Module

Modules represent different sections in the application. To add a new module, follow these steps:

1. **Update the ModuleEnum**
   Add your new module to the `ModuleEnum`.

2. **Update Permissions Structure:**
   Update the `permissionsStructure` on modules/tenant/rules/tenant-rules.ts to include this new module, specifying which roles can access it and what assignments are available to be inserted in an user creation and the main assignment used for manipulate the data in module.

    ```typescript
    [ModuleEnum.NEW_MODULE]: {
      allowedRoles: [RoleEnum.ROLE_CAN_ACCESS],
      assignmentsThatCanBeCreatedWithinModule: [AssignmentsEnum.ASSIGNMENT_ENUM],
      mainAssignment: AssignmentsEnum.NEW_MODULE
    }
    ```
    
3. **Setting the module's functions**

  On the `getFilterQueryFromSelectedModule` you need to setup the filter query for the user's module, creating a function `getModule'YOUR_MODULE'FilterQuery(baseFilter, filter);` and following the existent functions.
  
  ```typescript
  if (currentModule === ModuleEnum.YOUR_MODULE) {
      return this.getModule'YOUR_MODULE'FilterQuery(baseFilter, filter);
    }
  ```

  On the `getSelectQueryFromSelectedModule`you need to setup the select query for the users from your module, defining which data whould be returning in the filtering query. Adding the:

  ```typescript
  if (currentModule === ModuleEnum.YOUR_MODULE) {
      return this.getModule'YOUR_MODULE'SelectQuery();
    }
  ```
  and creating the function with the returning following the existents functions on the code

  <b>If you create an new module and not defining theses 3 steps, it will fail and throws exceptions.</b>
  
<hr>

#### Roles Section

The `roles` section delves into permissions specific to user roles, clarifying which modules each role can access, the assignments they're allowed to perform, and which roles have the authority to create entities or users with that role. This section is crucial for defining the scope of each role within the system and establishing a hierarchy or network of roles.

Similar to the modules, each role is represented by a key from `RoleEnum`, with its value being an object that encapsulates:

- **`accessibleModules`**: An array of `ModuleEnum` entries indicating the modules this role can access.
- **`allowedAssignments`**: An array of `AssignmentsEnum` entries listing the actions this role is authorized to perform across the system.
- **`canBeCreatedByRoles`**: An array of `RoleEnum` entries specifying which roles can create or assign this role to a user or entity.

<hr>

#### Adding a New Role

Roles define the access level or grouping for users within the application. To introduce a new role:

1. **Update the RoleEnum**
  Define the Role in RoleEnum schema's prisma

2. **Specify Role Permissions:**
   Update the `permissionsStructure` on modules/tenant/rules/tenant-rules.ts to define access for the new role, including which modules and assignments are permissible.

    ```typescript
    [RoleEnum.NEW_ROLE]: {
      accessibleModules: [ModuleEnum.MODULE],
      allowedAssignments: [AssignmentsEnum.ASSIGNMENT],
      canBeCreatedByRoles: [RoleEnum.USER],
    }
    ```

<hr>

#### Adding new Assignment

To include new assignments to a module or role, update the respective section in the `permissionsStructure` on modules/tenant/rules/tenant-rules.ts:

Adding the new assignment where it can be used

```
permissionsStructure -> modules[ModuleEnum.MODULE] -> permittedAssignments -> insert AssignmentsEnum.NEW_ASSIGNEMNT
```

<hr>

#### Permission Structure Object - permissionsStructure

This section outlines the permissions configuration within our system, categorizing permissions by modules and roles. This structure is a cornerstone of managing access control, dictating permissible actions (assignments) within each module by different roles, and delineating role hierarchies and creation capabilities.

The permissions structure is bifurcated into three primary sections:

- **Modules**: Defines access control specific to system modules.
- **Roles**: Outlines permissions associated with user roles.
- **Assignments**: Decide what can be accessed in the module

<hr>

### How to generate a new module

#### Pre generate ⚠️

Before running this command, you need to create your prism entity with the mandatory "base" fields and apply the migration with the same name of new module

* Base entity fields
  - id ( varchar - uuid )
  - version ( number )
  - createdAt ( date )
  - updatedAt ( date )
  - deletedAt ( date )
  - status ( StatusEnum)

<hr>
<br>

```bash
npm run generate:module --module=<module_name>
```

Replace the <module_name> for the module's real name

#### Entity Compose name

* If the name is compose, separate the names by "_" like "ConstructionBuilder" -> "construction_builder"
* Do the same with module enum CONSTRUCTIONBUILDER -> CONSTRUCTION_BUILDER

* Every folder must be kebab-case like end points url in case of name is compose 

<br>

The command will create a new module with the name passed in the -m parameter, it creates the following file
 
```
module
├── dto
│   └── request
│   │   └── create.dto.ts
│   │   └── update.dto.ts
│   └── response
│   │   └── pagination.response.ts
│   │   └── dto.ts
│   └── type
├── entity
│   └── entity.ts
│   └── type.map.ts
├── controller.ts
├── module.ts
├── mapping.ts
├── repository.ts
└── service.ts
├── tests
├── fixtures
│   └── fixture.generator
│   └── test-utils
└── e2e.spec.txt
```

- dto.ts (Contains a class that implements the prism entity creation interface)

- pagination.response.ts (It is the base pagination response class)

- create.dto.ts (Class received to create the entity)

- update.dto.ts (Class received to update the entity)

- dto.ts (DTO base class)

- type (Folder to insert the return types of prism queries)

- entity.ts (Contains a class that implements your prism entity)

- type.map.ts (It is the prism implementations of create, delete, update)

- controller.ts (Contains the 4 main end points GET, POST, PUT and DELETE)

- module.ts (Module imports and exports)

- mapping.ts (Entity to DTO mapping class)

- repository.ts (Repository containing the main queries for the initial operation of the module)

- service.ts (Service containing the main logic for the initial operation of the module)

- fixture.generator (Support class that generates data for tests)

- test-utils (Utility for tests)

- e2e.spec.txt (Initial tests for create, update, fetch, update)

<br>

<hr>

#### Post generate ⚠️

Necessary to look for the "TODO-GENERATOR" flag in control + shift + f to find the places where it will be necessary to make modifications for the initial module to work

Implement the interfaces, add class validator annotations, etc...


### How does module-generator work?
  It will get the "structure" folder inside the "module-generator" folder
  and will copy the existing text files and replace module_lc with the name of the module entered in the 100% command in lowercase letters
  and module_pc for the module name entered in camel case
  and module_uc for 100% uppercase letters

  It will create the entire structure and insert the module directly into the main app.module.

<hr>

### Websocket ( Socket.IO )

Websocket block user to connect in server if the Access Token sent in header is invalid.

The users connected on the websocket and these ips and socket ids are saved on the mongo database to maintain them saved even when the server goes down and up ( updated ) by the pipeline.

Websocket mantain the connected users information ( ip, email, socket_ip ) in the mongo schema "websocket"

Websocket reset the table "websocket" in the mongo db every time that module is started to clean up the old data

To connect in the websocket follow these steps:

* Angular example:
  ``` typescript
   const socket = io(SOCKET_URL, { 
      query: { ip: USER_IP }, extraHeaders: {
        Authorization: `Bearer ${BEARER_TOKEN}``
      }
    });
  ```

* JS Example:

  ``` javascript
  const accessWebSocket = () => {
    const { io } = require('socket.io-client');

    const ip = '12388';
    const bearerToken = 'Token';
    
    const socket = io(SOCKET_URL, { 
      query: { ip: USER_IP },  extraHeaders: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    });

    socket.on('connect', () => {
        console.log('Socket ID: ' + socket.id)
    });

    socket.on('logout', (data) => {
        console.log('User logout', data)
        socket.disconnect();
    });

    socket.on('blocked', (data) => {
        console.log('User blocked', data)
        socket.disconnect();
    });
  }

  accessWebSocket();
  ```

  const socket = io(this.SOCKET_URL, {...});: 
  
    This line creates a new Socket.IO client instance. this.SOCKET_URL should be the URL of the WebSocket server you're trying to connect to.

  query: { ip: USER_IP }
  
    This part sends a query with the WebSocket connection request. It includes the user's IP address.

  extraHeaders: { Authorization: `Bearer ${BEARER_TOKEN}`}

    This adds an Authorization header to the WebSocket connection request, for authentication purposes. The `Bearer ${USER_ACCESS_TOKEN}` it's a JWT (JSON Web Token).
  
  Websockets emits these events:

  * "block"

          When an user is blocked by the admin

  * "logout"

          When an user is forced to be logout from the server when another person access his account to avoid two person in the same account.

          Is possible to login N accounts since the N accounts is from the same ip requester.

### How does docker compose work?

#### Dev

* It will upload a postgres database to be used for dev and a mongo database as well

    * I advise using a Mongo database from a database generated by the Mongo website https://www.mongodb.com/pt-br/products/platform/cloud

#### Test

* It will upload a postgres database to be used for testing and a mongo database as well and a "wait-for-postgres" to wait for the banks to upload before proceeding with completion

#### ./docker.stop

* Used to pause currently active dockers before running tests

#### ./wait-for

* Used to "await" for something before the script progresses like: Wait 5 seconds until postgres database is completely running in docker. 

      Intend to prevent: Error: P1001: Can't reach database server at `localhost`:`5432` Please make sure your database server is running at `localhost`:`5432`.

<hr>

### DockerFile

Upload the project image and once started, it automatically generates migrations in the environment

It is not necessary to run "npx prisma migrate prod" in the environments, it does it automatically


**⚠️ If an error occurs in the puppeter, it is necessary to add it to the docker file before "RUN npm install --cache /app/cache; rm -rf /app/cache/"**

``` bash
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
```
<hr>

### Tests

**In the ./tests folder are all the application's e2e tests**

- jest.setup.ts

      Used to inject automatic mocks into tests

- jest.config.json

      It has all the e2e test configuration (run the tests from the ./tests folder)

- jest.all.config.json

      Configuration to run all project tests

When running the test's command it will:

- Delete all test dockers
- Docker compose up a new one
- Apply the migrations
- Apply the test seed 
- Run all tests

Objective: Maintaining the integrity and reliability of the data in which the tests being run are clean, reliable and controlled

- The shared folder contains the shared utils (such as, for example, authentication tests that return the token, password encryption, etc.)

- The fixtures folder contains the data generation files for the tests

<hr>

Runs all tests, e2e, integration and unit tests

``` bash
npm run test:all
```

<hr>

Runs e2e tests

``` bash
npm run test:e2e
```
<hr>

Runs e2e tests in <b>watch mode</b>

``` bash
npm run test:e2e:dev
```
<hr>

### Husky

* Commit: With each commit, npm run lint will automatically be run to adjust the code and its formatting and the changed files will be inserted into the commit

* Push: With each push it will stop the server, upload the test docker, run the seed and run all the application tests, if they all run successfully it will automatically go up to the repository

note: for pushes, it is essential to ensure that Docker is running in order to set up the test database.

<hr>

### Utils

The utils folder contains utility files such as:

- Axios - Configured with exportable functions to make calls from all http methods

- Pipes - Contains the nestjs transformation pipes to be used in the controller

- swagger-schemas - Contains the base application schemas for swagger

- types - Generic typings

- validators - has 'class-validator' validators to be used in data receiving data

- constants - contains the constants used in the project that are not confidential

- create-pdf - there is the configuration to generate a pdf with puppeter

- environment - contains .env control variables to facilitate usability

- excel - contains help files for creating configured excel

- exclude-fields - contains logic for excluding fields from an object

- get-ip-address - contains the logic for searching the user's IP from the request header through 'x-forwarded-for'

- getLanguage - contains the logic for searching the leaguange preference for the user

- google-maps - searches addresses by lat and lng
hash - support class for hashing data

- paginator - support class to create prism pagination

- qr-code-generator - QRCode generator to be used

- reformat-date - a date formatter (similar to moment.js)

- treat.exception - utility class for handling exceptions in service classes

- create-select-entity - utility class for generate select properties ( prisma ) of the entity ( class )

- translate-modules - utility class for translate the assignment database name in readable name

<hr>

## Modules - Structure

Contains the entire structure of the project modules

A module contains:

- DTO folder
- Entities folder
- Controller
- Mapping
- Module
- Repository
- Service
- Helper.service (if necessary, to contain granular business logic to be readable - e.g. instead of inserting:

  ``` typescript
  if(dto.data.hasClasse.isEmpty())
  ``` 

  it is better to place a function inside helper service that receives the dto and return a boolean with the logic of: 
  ```typescript
  dtoHasSomeData(dto) => return dto.data.hasClasse.isEmpty() )
  ```

- The DTO folder contains the DTO used to type Prisma
- The Entity folder contains prism entities implemented in classes

- All classes must have descriptive swagger typing for the api documentation

- Every request DTO must contain class-validator with descriptive messages and useful validations

### Aws

    Contains the logic for uploading data to S3

### Base

    Contains the base files of the self-generated (reusable) modules

### Cache

    Contains the cache creation files in mongo db

### Crons

    Contains the nest js scheduler responsible for running functions every X time

### Email

    Contains the sendgrid for sending email

### Health Check

    Just a controller that returns whether the application is OK
    
### Log

    Module responsible for generating audit logs of everything that happens to the user (Changes, creation, login, etc...)

### Mongo

    Mongo main module containing its initialization for use elsewhere

### User

    Application User Module

### Websocket

    Backend websocket connection module for sending messages

### Middlewares

  - Exception Filter

        Intercepts any application exception and manages to have a friendly message

  - Logger Middleware

        Intercepts any request and logs it in the console showing who made it, where the request went, what was sent and the response to it.

  - Request Ip Middleware

      **Based on whether multiple active users login to the same account is active or not**


        - Intercepts requests and validates whether the IP sent in the request is the same as the user logged in to the account, if not, it sends a logout via websocket

  - User Disabled Middleware

         Intercepts inactive or deleted users trying to send requests and blocks them

### Helpers
    Messages Helper

    - Contains messages usable throughout the application

### Filters

    Contains usable messagesContains the application's paging filter throughout the application

### Database

    Contains prism initialization

        Containing 3 attempts to connect (5 seconds between each attempt)

        Log queries depending on the "showQuery" variable in the Prisma service

### Auth - Structure
* Decorators

    * Assignments

            
            It is a decorator that represents access control validation

    * CurrentUser

            Decorator used in the controller to access the data of the user making the request

    * Is Public

            Decorator used to indicate that the end point does not need JWT authentication to be accessed

    * Roles

          Protection decorator that indicates who can use the end point (by role)

  * DTO
  
        Contains only the unauthorized error which is an implementation of the Error class

  * Errors

        Contains only the unauthorized error which is an implementation of the Error class
    
* Guards

    * Assignments

            Logic to block the user according to the assignment they contain, created to give route permission and tell them what they can do on the route
            example: only those who have the CARS assignment and READ permission can access route x

    * ATGuard

            Guard that validates the access token
    
    * RTGuard

              Guard that validates the refresh token

    * Local Auth Guard

            Guard that validates the login
        
    * Role Guard

            Guard that validates whether the user's role is compatible with the role required to access the end point (defined by the decorator)

* Models

    * AuthRequest

            Just an implementation of express's Request with a user to be able to capture the request headers in the controller

    * Request
              
              Express class implementation

    * UserPayload

              User signed token payload

    * UserToken

              User login return DTO

* Strategies

      Contains the logic of how each strategy will treat the JWT and what it will return
    
<hr>

### Sending Emails

Our project utilizes SendGrid for email delivery, and the system is pre-configured to handle various scenarios such as sending welcome emails to new users, resending activation emails, and assisting with password recovery. As a developer, your role involves customizing the HTML templates to align with your desired layout. These templates are located in the src/utils/templates directory and are named recover-password.html and registration.html.

Within the processors folder, you will find individual processors corresponding to each HTML template. These processors are designed to dynamically manipulate the HTML content, substituting specific string parts with user-provided input. You are encouraged to modify and adapt these processors as needed to suit your specific requirements, ensuring a seamless and personalized email experience.

- Base CSS for Email Templates (base.ts):

  * Ensure that your base CSS is well-optimized for email clients, as different email clients may have varying levels of support for CSS properties. Keep it simple and avoid using complex styles or features that might not be widely supported.

- HTML Templates (registration.html and recover-password.html)

  * Responsive Design: Ensure that your email templates are responsive to different screen sizes on email size.
  * Header CSS: To improve email client compatibility, header your CSS styles directly into the HTML. Some email clients may not fully support external stylesheets.
  * Use Alt Text for Images: If your email templates include images, provide alternative text for better accessibility.

- Processor for Each HTML Template

  * Customization Points: Make sure your processors provide easy customization points, allowing developers to modify the templates without diving too deep into the code. Use placeholders or variables that developers can easily replace with dynamic content.

- Base Processor (base-processor.ts)

  * Make sure your base processor functions are versatile and cover common use cases. For instance, they should handle dynamic content substitution effectively and be able to adapt to changes in the template structure.

<hr>

### "i18n"

Our system supports dynamic translation of error messages based on the client's preferred language specified in the "accept-language" header of the HTTP request. The supported languages include "pt-BR" (Portuguese - Brazil) and "en-US" (English - United States).

``` typescript
const errorMessage = getMessage(MessagesHelperKey.PASSWORD_CHANGED_ERROR, language);
```

Using this the variable errorMessage receive the error message in choosed language

How to create new message? 

 R: Create new message go to messages.helper.ts and follow the "MessagesHelper" structure that already exists.

<hr>

