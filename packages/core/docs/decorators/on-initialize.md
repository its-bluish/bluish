# OnInitialize

The initialization hook happens before actually entering your trigger, it helps you create custom validations and parsers.

There are a few places you can use it, and that depends on whether or not you're going to pass a function to it.

On the trigger: Here you will need to pass as a parameter a function that will be executed before executing your trigger and only in it. The function passed as a parameter will receive as a parameter the context that was built by the trigger.

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

In a class method: Unlike the other case here, the function will not be necessary, because the decorated method will be called, with some characteristics, it will be executed for every initialization of any trigger that this class contains.

```ts
import { OnInitialize, Http, HttpContext } from '@bluish/core'

export class Users {
  @Http.Post('/users')
  public async create() {}

  @Http.Patch('/users')
  public async update() {}

  @OnInitialize()
  public async onInitialize(context: HttpContext) {
    if (!await isAuthorizedToWriteUser(context.headers.authorization))
      throw new UnauthorizedError()
  }
}
```

In the class: same characteristic as in the class method, however the function is required as a parameter.

```ts
import { OnInitialize, Http, HttpContext } from '@bluish/core'

@OnInitialize((context: HttpContext) => {
  if (!isAuthorizedToWriteUser(context.headers.authorization))
    throw new UnauthorizedError()
})
export class Users {
  @Http.Post('/users')
  public async create() {}

  @Http.Patch('/users')
  public async update() {}
}
```