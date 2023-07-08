import { emitKeypressEvents } from 'readline'

import { useFocus, useStdin } from 'ink'
import { useEffect } from 'react'

export const useKeyPressEffect = (
  fn: (
    ch: string,
    key: null | { name: string; shift: boolean; meta: boolean },
  ) => void,
  deps: unknown[],
): void => {
  const { isFocused } = useFocus()
  const { stdin = process.stdin, isRawModeSupported, setRawMode } = useStdin()

  useEffect(() => {
    if (!isRawModeSupported) return

    setRawMode(true)
    emitKeypressEvents(stdin)

    stdin.on('keypress', fn)

    return () => {
      stdin.off('keypress', fn)
    }
  }, [isFocused, stdin, isRawModeSupported, setRawMode, ...deps])
}
