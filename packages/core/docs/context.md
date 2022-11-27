# Context 

The context is how hooks and plugins manage to manipulate the trigger, what is certain is that each trigger has its own type of context. You can create your context by extending the abstract `Context` class from within `@bluish/core`

```ts
import { Context, AzureFunctionContext } from '@bluish/core'

export class CustomContext extends Context {
  constructor(context: AzureFunctionContext, arg: unknown) {
    super(context)
  }

  public success(payload: unknown): PromiseToo<unknown> {
    return payload
  }

  public unhandledError(error: unknown): PromiseToo<unknown> {
    throw error
  }

  public handledError(payload: unknown): PromiseToo<unknown> {
    return this.success(data)
  }
}
```

At this point we can already see how we leave a normal azure function module for bluish, in the constructor you will receive exactly the first argument that comes from the azure function which is the context it offers. The second argument will depend on what type of trigger the context will receive, for example: if it is an `httpTrigger` it will receive the request from the azure function.

To use your context just hand it to `TriggerD` or any other trigger decorator that allows you to hand a context constructor.

```ts
import { Binding, TriggerD } from '@bluish/core'
import { CustomContext } from '...'

class Class {
  @TriggerD({
    Context: CustomContext,
    bindings: [
      new Binding(...),
      new Binding(...),
    ]
  })
  public run() {
    return 'Ok'
  }
}
```