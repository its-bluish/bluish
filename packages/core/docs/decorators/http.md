# Http

A helper for creating specific triggers with `http` input and `http` output.

```ts
import { Http } from '@bluish/core'

export class Users {
  @Http('/users', 'get')
  public list() {}
}
```

## Methods

There are two ways to clarify the method that the kitten will use:

- As second argument of `Http` function

  ```ts
  import { Http } from '@bluish/core'

  export class Users {
    @Http('/users', 'get')
    public list() {}
  }
  ```

- As a property of the `Http` function

  ```ts
  import { Http } from '@bluish/core'

  export class Users {
    @Http.Get('/users')
    public list() {}
  }
  ```

The same thing is repeated for: `Post`, `Patch`, `Put`, `Delete`, `Head`, `Options`, `Trace` and `Connect`.

## Arguments

Requests are made up of `query`, `parameters`, `body` and `headers`, so we have decorators to pick each one specifically.

### Query

```ts
import { Http } from '@bluish/core'

export class Users {
  @Http.Get('/users')
  public list(
    @Http.Query('take') take: number = 20,
    @Http.Query('page') page: number = 1
  ) {}
}
```

### Parameter

```ts
import { Http } from '@bluish/core'

export class Users {
  @Http.Patch('/users/{id}')
  public update(
    @Http.Param('id') id: string
  ) {}
}
```

### Body

```ts
import { Http } from '@bluish/core'

export class Users {
  @Http.Post('/users')
  public create(
    @Http.Body() body: unknown
  ) {}
}
```

### Header

```ts
import { Http } from '@bluish/core'

export class Users {
  @Http.Post('/users')
  public create(
    @Http.Header('authorization') authorization?: string
  ) {}
}
```