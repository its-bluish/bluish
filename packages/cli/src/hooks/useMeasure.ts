import { type DOMElement, measureElement } from 'ink'
import { type RefObject, useEffect, useRef, useState } from 'react'

type Measure = Record<'width' | 'height', number>

export const useMeasure = (): [RefObject<DOMElement>, Measure] => {
  const ref = useRef<DOMElement>(null)
  const [measure, setMeasure] = useState<Measure>({
    height: 0,
    width: 0,
  })

  useEffect(() => {
    if (!ref.current) return

    setMeasure(measureElement(ref.current))
  }, [])

  return [ref, measure]
}
