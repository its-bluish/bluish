import {
  type PropsWithChildren,
  type FC,
  Children,
  useState,
  useMemo,
  Fragment,
  type ReactNode,
} from 'react'
import { Box, type BoxProps, Text } from 'ink'

import { isMenuItemReactElement } from './isMenuItemReactElement.js'
import { type MenuItemState } from './Item.js'
import { useKeyPressEffect } from '../../hooks/useKeyPressEffect.js'

export { MenuItem, type MenuItemState, type MenuItemProps } from './Item.js'

export interface MenuProps extends BoxProps {
  initial: string
  flexDirection?: 'row' | 'column'
  onChange?: (name: string) => void
  render?: (state: MenuItemState) => ReactNode
}

const _defaultRender = (state: MenuItemState): ReactNode => (
  <Text color={state.isActive ? 'cyan' : 'gray'}>
    {state.label ?? state.name}
  </Text>
)

export const Menu: FC<PropsWithChildren<MenuProps>> = ({
  flexDirection = 'row',
  initial,
  children,
  render: defaultRender = _defaultRender,
  ...props
}) => {
  const items = Children.toArray(children)
    .filter(isMenuItemReactElement)
    .map(child => {
      const {
        name,
        label,
        render = defaultRender,
        component,
        children,
      } = child.props

      let node = component ?? children ?? null

      if (typeof node === 'function') {
        const Component = node
        node = <Component />
      }

      return { name, label, render, node }
    })

  const [currentName, setCurrentName] = useState(() => initial)

  const currentIndex = useMemo(
    () => items.findIndex(item => item.name === currentName),
    [currentName, items],
  )

  const current = items[currentIndex]

  const previous = useMemo(() => {
    if (currentIndex <= 0) return
    if (items.length <= 1) return
    return items[currentIndex - 1]
  }, [currentIndex, items])

  const next = useMemo(() => {
    if (currentIndex >= items.length - 1) return
    if (items.length <= 1) return
    return items[currentIndex + 1]
  }, [currentIndex, items])

  useKeyPressEffect(
    (char, key) => {
      if (!key) return

      if (flexDirection === 'row') {
        if (key.name === 'left' && previous) setCurrentName(previous.name)
        if (key.name === 'right' && next) setCurrentName(next.name)
      }

      if (flexDirection === 'column') {
        if (key.name === 'up' && previous) setCurrentName(previous.name)
        if (key.name === 'down' && next) setCurrentName(next.name)
      }
    },
    [previous, next],
  )

  return (
    <>
      <Box flexDirection={flexDirection} {...props}>
        {items.map(item => {
          const state: MenuItemState = {
            name: item.name,
            label: item.label,
            isActive: item.name === currentName,
          }

          return (
            <Fragment key={`menu:items:${item.name}`}>
              {item.render(state)}
            </Fragment>
          )
        })}
      </Box>
      {current.node}
    </>
  )
}
