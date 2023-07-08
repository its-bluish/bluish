export class Headers {
  constructor(private readonly _headers: Record<string, string>) {}

  public get(name: string): string | null
  public get(name: string, _default: string): string
  public get(name: string, _default?: string): string | null {
    return (
      this._headers[name] ??
      this._headers[name.toLowerCase()] ??
      _default ??
      null
    )
  }
}
