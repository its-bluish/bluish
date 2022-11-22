<h1 align="center">
  Bluish
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@bluish/core">
    <img src="https://img.shields.io/npm/v/@bluish/core?style=for-the-badge">
  </a>
</p>

Bluish is a framework for creating Azure functions from programmatic meta information.

It helps to write azure trigger functions directly in your class, without the need for auxiliary files and gives you autonomy to create interceptors to help and focus specifically on what the function has to deliver.

## Install

```sh
yarn add @bluish/core
```

```sh
yarn add -D @bluish/cli
```

## Use

### Configuration file

```ts
// ./bluish.config.ts
export default {
  functions: ['./src/functions/*.ts'],
  application: './src/app'
}
```

### Application wrapper

The app is a layer above the trigger itself, with it you can customize the executions that will happen, before or after the trigger is executed.

The use of the app is not mandatory, but it certainly helps in the reuse of features. To disable just remove the `application` property from the configuration file.

```ts
// ./src/app/index.ts

import { App, OnInitialize, OnDestroy, OnError, ErrorHandler, Context } from '@bluish/core'

@App()
class Application() {
  @OnInitialize()
  public onInitialize(context: Context) {}

  @OnDestroy()
  public onDestroy(context: Context) {}

  @OnError()
  public onError(context: Context) {}

  @ErrorHandler()
  public errorHandler(error: unknown, context: Context) {}
}
```

### Trigger

Currently we only support the Http Trigger, but we plan to support all standard azure function triggers.

All examples are created in the pattern that is in the configuration

### Http

```ts
// ./src/functions/HelloWorld.ts

import { HttpTrigger } from '@bluish/core'

class HelloWorld {
  @HttpTrigger.Get('/hi')
  public sayHi(
    @HttpTrigger.Query('name') name?: string
  ) {
    if (name) return `Hi, ${name}`

    return `Hello, send param name to receive custom hi`
  }
}
```

### Plugins

Plugins serve to create an interception model, with which you can use a plugin at any time in your trigger's life flow.

Example:

```ts
import { Use, App } from '@bluish/core'
import BluishUrlencodedPlugin from '@bluish/plugin-urlencoded'

@App()
@Use(new BluishUrlencodedPlugin())
class Application {}
```

or

```ts
import { HttpTrigger } from '@bluish/core'
import BluishUrlencodedPlugin from '@bluish/plugin-urlencoded'

@Plugin(new BluishUrlencodedPlugin()) // here
export class Something {

  @HttpTrigger.Get('/')
  @Plugin(new BluishUrlencodedPlugin()) // or here
  public thing() {
    return 'ok'
  }
}
```

### Running

```sh
yarn bluish start
```

### Building

```sh
yarn bluish build
```

#### List of official plugins:

- [@bluish/plugin-urlencoded](./plugins/urlencoded/README.md)

## Under development

Bluish is a tool in alpha, so it can be found a flaw, if you find one please open an issue on our channel.

- Blob trigger support;
- Event grid trigger support;
- Event hub trigger support;
- Queue trigger support;
- Create bluish app;
- Better documentation;

## License
Bluish is [MIT licensed](./LICENSE).
