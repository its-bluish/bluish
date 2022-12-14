# Events

Events serve to connect the `Runner` flow with the trigger defined in `Root`. The default `Runner` events of `@bluish/core` are:

## Initialize

The initialization event is, as the name itself says, an initialization of anything, for example a database connection, the inverse of this is `destroy` which, for this same example, serves to close the connection with the database.

```ts
@OnInitialize(async () => await databaseConnection.connect())
export class Users {
  @Http.Get('/users')
  public list() {
    return await databaseConnection.query('SELECT * FROM users')
  }
}
```

But it can also be used to perform validations even before executing the decorator method.

```ts
export class Users {
  @Http.Get('/users')
  @OnInitialize(async (context) => {
    context.query = await usersQuerySchema.validate(context.query)
  })
  public pagination(@Http.Query() query: UserQuerySchemaResult) {}
}
```

## Destroy

The destruction event always happens when the function is ready to die, the response has already been "sent" but we need to do things before or for the function to die in fact, such as: closing connections.

```ts
@OnDestroy(async () => await databaseConnection.end())
export class Users {
  @Http.Get('/users')
  public list() {}
}
```

## Success

The success event serves to make updates to the result generated by the function.

```ts
@OnSuccess((context: HttpContext) => {
  context.status(200)
})
export class Users {
  @Http.Get('/users')
  public list() {}
}
```

## Error

Error event serves to handle errors thrown during initialization and success.

```ts
@OnError((error, context) => {
  if (error instanceof Unauthorized) return {
    status: 400,
    body: {
      message: 'Unauthorized'
    }
  }

  return { status: 500, body: null }
})
export class Users {
  @Http.Get('/users')
  public list(@Http.Header('Authorization') authorization?: string) {
    if (!isAuthorized(authorization)) throw new Unauthorized()
  }
}
```

## Complete example using all events

```ts

export class Users {
  @Http.Get('/users')
  @OnInitialize(async () => await connection.connect())
  @OnDestroy(async () => await connection.end())
  @OnSuccess((users) => ({
    status: 200,
    body: { users },
  }))
  @OnError((error, context) => {
    if (error instanceof Unauthorized) return {
      status: 400,
      body: {
        message: 'Unauthorized'
      }
    }

    return { status: 500, body: null }
  })
  @OnInitialize((context: HttpContext) => {
    if (!isAuthorized(context.headers.authorization))
    
      throw new Unauthorized()
  })
  @OnInitialize((context) => {
    context.query = await usersPaginationSchema.validate(context.query)
  })
  public pagination(
    @Http.Query('page') page = 1,
    @Http.Query('take') take = 1,
  ) {
    return connection.query(
      `SELECT * FROM users LIMIT ${take} OFFSET ${(page - 1) * take}`
    )
  }
}
```

As you can see, we separate responsibility for not having all of this within the function that we deliver to the azure function, of course there are methods to work around this, but it makes the code much more elegant, especially when the separation of events in other files and with hooks or custom decorators

## Sequence of events

To see the order of events that the bluish pattern runs see the [`Runner` documentation](./runner.md#the-order).
