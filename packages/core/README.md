# Bluish Core

Bluish is a framework for creating azure function triggers programmatically through typescript with decorators.

It helps to write azure trigger functions directly in your class, without the need for auxiliary files and gives you autonomy to create interceptors to help and focus specifically on what the function has to deliver.

## Getting started

To start using bluish read the repositor [README](../../README.md).

## Triggers

The makers of bluish triggers want to make their code as readable as possible!

### Http

The http trigger can be defined with the `Http` decorator that `@bluish/core` provides.

```ts
import { Http } from '@bluish/core'

export class Users {
  @Http.Get('/users')
  public list(
    @Http.Query() query: unknown.
  ) {}

  @Http.Post('/users')
  public create(
    @Http.Body() body: unknown
  ) {}

  @Http.Patch('/users/{userId}')
  public create(
    @Http.Param('userId') userId: string,
    @Http.Body() body: unknown
  ) {}

  @Http.Delete('/users/{userId}')
  public create(
    @Http.Param('userId') userId: string,
  ) {}
}
```

For more details about the template see the [`Http` documentation](./docs/decorators/http.md)

### Timer
```ts
import { Timer } from '@bluish/core'

export class Class {
  @Timer('0 */1 * * * *')
  public timer() {
    console.log('doing')
  }
}
```

### EventGrid
```ts
import { EventGrid } from '@bluish/core'

export class Class {
  @EventGrid()
  public observer() {
    console.log('event')
  }
}
```

## Events

The events are used to infiltrate the flow of the bluish runner.

### OnInitialize

The initialization hook happens before actually entering your trigger, it helps you create custom validations and parsers.

```ts
import { OnInitialize, Http, HttpContext } from '@bluish/core'

export class Users {
  @Http.Get('/users')
  @OnInitialize(async (context: HttpContext) => {
    if (!isAuthorizedToReadUser(context.headers.authorization))
      throw new UnauthorizedError()
  })
  public async list() {}
}
```

see the [`OnInitialize` documentation](./docs/decorators/on-initialize.md).

### OnDestroy

Com ele voc?? pode se conectar ao fluxo de destrui????o do gatilho, ??til para limpeza e fechamento de conex??es.

```ts
import { OnInitialize, Http } from '@bluish/core'

@OnInitialize(async () => await connection.connect())
@OnDestroy(async () => await connection.end())
export class Users {
  @Http.Get('/users')
  public async list() {}
}
```

### OnError

Also with the same polymorphism as `OnInitialize` and `OnDestroy`, on `OnError` is always executed when an error is thrown during initialization and trigger execution. It can also be used for error handling.

```ts
@OnInitialize((context: HttpContext) => {
  if (!isAuthorizedToWriteUser(context.headers.authorization))
    throw new UnauthorizedError()
})
@OnError((error: unknown, context: HttpContext) => {
  if (error instanceof UnauthorizedError)
    return { status: 400, body: { message: 'unauthorized' } }
})
export class Users {
  @Http.Post('/users')
  public async create() {}

  @Http.Patch('/users')
  public async update() {}
}
```

### OnSuccess

Finally the `OnSuccess` call from the context with the generated payload, it works differently from the others because each result of each `OnSuccess` call is analyzed and given as an "official" answer. Example:

```ts
import { OnSuccess } from '@bluish/core'

export class Users {
  @OnSuccess(users => ({ status: 200, body: users }))
  public list() {
    const users = []
    return users
  }
}
```

Basically, you can transform the method's return into a response with other characteristics, or even transform the body's content, in short, it's up to your creativity.

## Under the hood

### Trigger

see [`Trigger` documentation](./docs/decorators/trigger.md).

### Context

see [`Context` documentation](./docs/context.md).
### Runner

see [`Runner` documentation](./docs/runner.md).
