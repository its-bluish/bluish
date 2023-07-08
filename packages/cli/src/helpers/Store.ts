export class Store<TState extends object> {
  private _state: TState
  private readonly _subscriptions: Array<
    (newState: TState, oldState: TState) => void
  > = []

  constructor(initialState: TState) {
    this._state = initialState
  }

  public subscribe(
    subscription: (newState: TState, oldState: TState) => void,
  ): () => void {
    this._subscriptions.push(subscription)

    return () => {
      this._subscriptions.splice(this._subscriptions.indexOf(subscription), 1)
    }
  }

  public setState(newState: TState): void
  public setState(setter: (state: TState) => TState): void
  public setState(
    newStateOrSetter: TState | ((state: TState) => TState),
  ): void {
    if (typeof newStateOrSetter === 'function') {
      this.setState(newStateOrSetter(this._state))
      return
    }

    const oldState = this._state
    const newState = newStateOrSetter

    if (newState !== oldState)
      this._subscriptions.forEach(_subscription => {
        _subscription(newState, oldState)
      })

    this._state = newState
  }

  public getState(): TState {
    return this._state
  }
}
