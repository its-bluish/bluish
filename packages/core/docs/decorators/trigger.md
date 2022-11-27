# Trigger

It is the maker of the triggers with the settings you would normally put in your azure function `function.json`.

To assemble an input type of httpTrigger and the output of an http you could configure it like this:

```ts
import { HttpContext, Binding, Trigger } from '@bluish/core'

class Class {
  @Trigger({
    Context: HttpContext,
    bindings: [
      new Binding('httpTrigger', 'req', 'in', {
        route: 'route',
        methods: ['get']
      }),
      new Binding('http', '$return', 'out'),
    ]
  })
  public run() {
    return 'Ok'
  }
}
```

This is basically what `HttpTrigger` does within its function. But it gives you more simplicity but less configuration.

But see that I'm helping you to set up a context, to see how to create a custom context, [see context](../context.md).