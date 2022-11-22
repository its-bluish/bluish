export abstract class Builder {
  constructor(
    protected rootDir: string,
    protected outDir: string
  ) {}

  public abstract find(path: string): Promise<string> | string

  public abstract build(): Promise<void> | void

  public abstract watch(): Promise<() => void> | (() => void)
}
