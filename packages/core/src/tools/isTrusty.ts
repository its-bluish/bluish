export type Falsy = undefined | null | false | 0 | ''

export const isTrusty = <T>(value: T): value is Exclude<T, Falsy> => !!value
