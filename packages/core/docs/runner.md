# Runner

`@bluish/core` uses a runner to run the trigger you configured. It will be the `Runner` class that you can import from within `@bluish/core`. Responsible for executing each hook, plugin and application you put in the middle between the azure function itself and your method.

## The order:

### Initialization by:
  - `Context`

  - `Application` `Plugins`

  - `Application` `Hooks`

  - `TriggerRoot` `Plugins`

  - `TriggerRoot` `Hooks`

  - `Trigger` `Plugins`

  - `Trigger` `Hooks`

### Execution

- Mopping the arguments to be delivered to the `Root` instance method

- Execution of `Trigger`


### Response success transformation by:

  - `Trigger Hooks`

  - `Trigger Plugins`

  - `TriggerRoot Hooks`

  - `TriggerRoot Plugins`

  - `Application Hooks`

  - `Application Plugins`

  - `Context` `success` call from the context with the generated payload

In case an error is thrown at any point in the above flows, another additional flow is activated.

### Error handling by:

  - `Trigger` `Hooks`
  
  - `Trigger` `Plugins`
  
  - `TriggerRoot` `Hooks`
  
  - `TriggerRoot` `Plugins`
  
  - `Application` `Hooks`
  
  - `Application` `Plugins`

If any of the error treatments returns some information other than `void/undefined`, the `Context` error treatment is executed to assemble the response from the obtained result. But if all the treatments don't return any result, the `Context` will be forced to mount an unhandled error response.

Regardless of whether the error was thrown or not the destruction flow will execute, no response or error handling is done at this point.

### Destruction by:

  - `Trigger` `Hooks`

  - `Trigger` `Plugins`

  - `TriggerRoot` `Hooks`

  - `TriggerRoot` `Plugins`

  - `Application` `Hooks`

  - `Application` `Plugins`

  - `Context`