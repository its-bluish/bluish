export function isConstructorOf<T>(
  value: unknown,
  constructor:
    | (new (...args: any[]) => T)
    | (abstract new (...args: any[]) => T),
): value is new (...args: any[]) => T {
  if (typeof value !== 'function') return false

  return value.prototype instanceof constructor
}

isConstructorOf.factory = <T>(
  constructor:
    | (new (...args: any[]) => T)
    | (abstract new (...args: any[]) => T),
) => {
  return (value: unknown): value is new (...args: any[]) => T =>
    isConstructorOf(value, constructor)
}
