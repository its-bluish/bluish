export type PromiseLikeToo<T> = T | PromiseLike<T>

export type ConstructorOf<
  TInstance,
  TParameters extends any[] = any[],
  AcceptAbstract extends boolean = true,
> = AcceptAbstract extends true
  ?
      | (new (...args: TParameters) => TInstance)
      | (abstract new (...args: TParameters) => TInstance)
  : new (...args: TParameters) => TInstance
