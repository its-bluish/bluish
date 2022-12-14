export class Collection<T> implements Iterable<T> {
  private _array: T[] = []

  protected get array(): readonly T[] {
    return this._array
  }

  public push(item: T): T
  public push(...items: T[]): T[]
  public push(...items: T[]): T | T[] {
    items.forEach((item) => {
      this.beforeAdd?.(item)

      this._array.push(item)

      this.afterAdd?.(item)
    })

    if (items.length === 1) return items[0]

    return items
  }

  public set(position: number, item: T) {
    this.beforeAdd?.(item)

    if (this._array[position] === void 0) this._array[position] = item
    else this._array.splice(position, 1, item, this._array[position])

    this.afterAdd?.(item)
  }

  public toArray(): T[] {
    return this._array.slice()
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (const item of this._array) yield item
  }

  protected beforeAdd?(item: T): void

  protected afterAdd?(item: T): void
}
