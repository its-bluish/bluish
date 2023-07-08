import { type ValidationError } from 'class-validator'

export class ClassValidatorErrorCollection extends Error {
  constructor(
    public errors: ValidationError[],
    public parent?: string,
  ) {
    super()
  }

  public toMap(): Map<string, string> {
    const map = new Map<string, string>()

    this.errors.forEach(error => {
      if (error.children?.length)
        return new ClassValidatorErrorCollection(error.children)
          .toMap()
          .forEach((message, key) => {
            map.set(`${error.property}.${key}`, message)
          })

      map.set(
        this.parent ? `${this.parent}.${error.property}` : error.property,
        error.toString(false, true, this.parent, true),
      )
    })

    return map
  }

  public toObject() {
    return Object.fromEntries(this.toMap())
  }
}
