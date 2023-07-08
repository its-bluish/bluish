import { useEffect, useMemo, useState } from 'react'

type SizeY = 'height' | 'rows' | 'y' | 'Y'

type SizeX = 'width' | 'columns' | 'x' | 'X'

type Size = SizeY | SizeX

const sizeX: Size[] = ['width', 'columns', 'x', 'X']

export function useSize(): [number, number]
export function useSize(stream: NodeJS.WriteStream): [number, number]
export function useSize(size: Size): number
export function useSize(
  streamOrSize?: NodeJS.WriteStream | Size,
): number | [number, number] {
  const target = useMemo(() => {
    if (typeof streamOrSize === 'string') return streamOrSize

    return null
  }, [])
  const stream = useMemo(() => {
    if (typeof streamOrSize === 'object') return streamOrSize
    return process.stdout
  }, [streamOrSize])
  const [[columns, rows], setSize] = useState(() => [
    stream.columns,
    stream.rows,
  ])

  useEffect(() => {
    const handle = (): void => {
      setSize([stream.columns, stream.rows])
    }

    stream.addListener('resize', handle)

    return () => {
      stream.removeListener('resize', handle)
    }
  }, [])

  return useMemo(() => {
    if (!target) return [rows, columns]

    if (sizeX.includes(target)) return columns

    return rows
  }, [target, rows, columns])
}
