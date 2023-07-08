import { useEffect, useState } from 'react'

import { type Store } from '../helpers/Store.js'

export const useSelector = <TState extends object, TValue>(
  store: Store<TState>,
  selector: (state: TState) => TValue,
): TValue => {
  const [current, setCurrent] = useState(() => selector(store.getState()))

  useEffect(
    () =>
      store.subscribe(state => {
        const selected = selector(state)

        setCurrent(current => {
          if (selected !== current) return selected

          return current
        })
      }),
    [],
  )

  return current
}
