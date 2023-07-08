import { type Runner } from './Runner.js'

export abstract class Context {
  constructor(
    public runner: Runner<any, any, any>,
    ...args: any[]
  ) {
    args.forEach((arg, index) => {
      this[index] = arg
    })
  }

  [key: number]: unknown
  [key: string]: unknown
}

export interface Context extends Bluish.Context {}

declare global {
  namespace Bluish {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Context {}
  }
}
