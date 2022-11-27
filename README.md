<h1 align="center">Bluish</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@bluish/core">
    <img src="https://img.shields.io/npm/v/@bluish/core?style=for-the-badge">
  </a>
  <img src="https://img.shields.io/github/workflow/status/its-bluish/bluish/CI?label=CI&style=for-the-badge">
</p>

## Table of Contents

  - [Getting Started](#getting-started)
    - [Install](#install)
    - [Configuration](#configuration)
    - [Coding](#coding)
    - [Execution](#Execution)
  - [Documentation](#documentation)
  - [Plugins](#plugins)
  - [Alpha](#alpha)
  - [License](#license)

Bluish is a framework for creating azure function triggers programmatically through typescript with decorators.

It helps to write azure trigger functions directly in your class, without the need for auxiliary files and gives you autonomy to create interceptors to help and focus specifically on what the function has to deliver.

## Getting Started

### Installation

```sh
yarn add @bluish/core
yarn add -D @bluish/cli
```

### Configuration

To run your code bluish uses typescript as interpreter, so configure your typescript in the best way without setting `compilerOptions.rootDir` and `compilerOptions.outDir` properties and any other configuration that makes the folder structure and/or or import switch. And since we are using decorators, we need to have their option enabled `compilerOptions.experimentalDecorators`, but we don't need the metadata that the typescript generates, of course you will activate this option if you use [`TypeORM`](https://github.com/typeorm/typeorm) for example.

To start using bluish you need to create a configuration file called `bluish.config.ts` in it you will have two configurations.

|property  |type                 |required |description            |
|----------|---------------------|---------|-----------------------|
|functions |`string \| string[]` |true     |trigger class paths    |
|app       |`string`             |false    |application class path |

Example:

```ts
const configuration = {
  functions: ['./src/functions/*.ts'],
}

export default configuration
```

### Coding

The class that will serve as a trigger collector has to stay in the configured path. So for this example we are going to create the class in the path `./src/functions`

```ts
import { HttpTrigger } from '@bluish/core'

class HelloWorld {
  @HttpTrigger.Get('/hello-world')
  public say() {
    return 'Hello world!'
  }
}
```

Our trigger is the `say` method of the `HelloWorld` class and it's going to be a `httpTrigger` type trigger with the `GET` method in the path `/hello-world`, very intuitive, isn't it?

### Execution

Okay, what now?

We are simply going to run the bluish command to start our azure functions server.

```sh
yarn bluish start
```

This is the exact same binary that goes up in `azure-functions-core-tools` with basically the same logs.

Ready, now you can start writing your triggers creating classes for better initialization and their methods.

## Documentation

Bluish is essentially made up of two packages, [`@bluish/core`](./packages/core) and [`@bluish/cli`](./packages/cli).

With `bluish` we can write custom plugins and hooks to see more details about this see the [`@bluish/core`](./packages/core) documentation.

## Plugins

  - [`@bluish/plugin-urlencoded`](./plugins/urlencoded)

## Alpha

Bluish is a tool under development, so it's in its alpha stage, we already have some features mapped like:

- Decorators for triggers:

  - [Blob](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-blob)

  - [Event Grid](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-event-grid)

  - [Event Hub](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-event-hubs)

  - [Queue storage](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-storage-queue)

  - [Timer](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-timer)

- Bindings merge

- Descriptive errors

Even though it doesn't have support for some triggers, you can create your own trigger using the exclusive interface for that. It's basically where all triggers are born. For that see the [`@bluish/core`](./packages/core) documentation.
## License

Bluish is [MIT licensed](./LICENSE).
