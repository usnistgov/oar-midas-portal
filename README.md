# OAR MIDAS (v2) Gateway Portal (oar-midas-portal)

[![main branch status](https://github.com/usnistgov/oar-midas-portal/actions/workflows/main.yml/badge.svg)](https://github.com/usnistgov/oar-midas-portal/actions/workflows/main.yml) | 
[![integration branch status](https://github.com/usnistgov/oar-midas-portal/actions/workflows/integration.yml/badge.svg)](https://github.com/usnistgov/oar-midas-portal/actions/workflows/integration.yml)

This repository provides the Angular applications that implement the gateway portal for the 
Management of Institutional Data Assets (MIDAS, V2) tool suite.  It provides access to a variety of
tools targeted to NIST researchers and management that support the publishing of NIST research. This
portal is developed and operated as part of the NIST Open Access to Research (OAR) program.  This
repository specifically provides applications built using the [Angular](https://angular.io/)
application framework and includes:
  * midas-portal -- the central app implementing the portal gateway

As software based on the the [Angular](https://angular.io/) application framework, the code is
written primarily in [Typescript](https://typescriptlang.org).

## Contents

```
midas-portal --> the Angular project directory for the midas-portal app
scripts/     --> Tools for running the demonstrations and running all tests
oar-build/   --> general oar build system support (do not customize)
docker/      --> Docker containers for building and running tests
.github/     --> GitHub repository configuration, including CI scripts for GitHub Actions
CODEOWNERS   --> A listing of contacts, administrators, and contributors for this repository
LICENSE.md   --> A statement of rights and responsibilities for use and copying of this software
```

## Prerequisites

Software in this repository is built using the [Angular](https://angular.io/) application framework
(v13), and, thus, is built and run using `nodejs` and `npm`.  Both become available to your
development environment when you install,

  * node 14.19.0 or higher

All prerequisite Javascript modules needed are provided via the `npm` build tool.  See
`package.json` for a listing of primary dependencies and `package-lock.json` for a
complete listing of all dependencies.

### Acquiring prerequisites via Docker

As an alternative to explicitly installing prerequisites to run the tests, the `docker` directory
contains scripts for building a Docker container with all prerequites installed in a properly
configured environment.  Running the `docker/run.sh` script will build the containers (caching them
locally), start the container, and put the user in a bash shell in the container.  From there, one
can run applications or tests.

The `scripts` directory also includes scripts that will launch Docker containers to build the
software (`makedist.docker`) and run tests (`testall.docker`).

To use these scripts and containers, Docker must be installed separately.  

## Building and Testing the software

As a standard OAR repository, it includes simple language-independent tools for building and testing
the software without special knowledge of Typescript or Angular (assuming all prerequisites have
been installed first); these are described in the section
["Simple Building and Testing with OAR Tools"](#simple-building-and-testing-with-oar-tools).

Developers, on the other hand, primarily use the native tools (`npm`) to build and test as described
in ["Building and Testing Using Native Tools"](#building-and-testing-using-native-tools).  

### Simple Building and Testing with OAR Tools

As a standard OAR repository, the software products can be built by simply via the `makedist`
script, assuming the prerequisites are installed:

```
  scripts/makedist
```

The built products will be written into the `dist` subdirectory (created by the `makedist`); each
will be written into a zip-formatted file with a name formed from the product name and a version
string.

The individual products can be built separately by specifying the product name as arguments, e.g:

```
  scripts/makedist midas-portal
```

Additional options are available; use the `-h` option to view the details:

```
  scripts/makedist -h
```

The `testall` script can be used to execute all unit and integration tests:

```
  scripts/testall
```

Like with `makedist`, you can run the tests for the different products separately by listing the
desired product names as arguments to `testall`.  Running `testall -h` will explain available
command-line options.


### Building and Testing Using Native Tools

The `npm` tool can be used in the standard way for [Angular projects](https://angular.io/docs) to
build and test this software.

Detail commands and instructions:

1. Clone this repository and update Angular library
    
    After clone the repository, do the following:
    
```
    cd oar-pdr-angular
    git submodule update --init --recursive
    cd lib
    git checkout integration
```

Now lib folder should have the latest code of oar-lib-angular.
    
2. Install packages

    Go to root folder, switch to initial-portal-setup02 branch, then do npm install:
    
```    
    Note: make sure your npm version is 7.0.0 or higher. Use npm -v to check your version. 
    If not, run npm install -g npm@latest.
    
    cd ..
    git checkout initial-portal-setup02
    npm i 
```    
    
3. Build and run your application

You can build Angular library and your application separately or with one command.

To build Angular library only:

```    
    npm run build-lib
```

To build your application only:

```    
    npm run build
```

To build both lib and your application:

```    
    npm run build-all
```

4. Testing your app

```
    Browse: http://localhost:4200
```

## Repository Administration

Please see [`LICENSE.md`](LICENSE.md) for the current licensing statements.  Software in this
repository is open-source and held in the public domain.

### Contacts

The administrators of this repository include:

  * Gretchen Greene (gretchen.greene@nist.gov)
  * Jon Zhang (yang.zhang@nist.gov)
  * Ray Plante (raymond.plante@nist.gov)
  * Christopher Davis (christopher.davis@nist.gov)

