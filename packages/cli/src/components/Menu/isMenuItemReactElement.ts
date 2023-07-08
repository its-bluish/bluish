import { type ReactElement, isValidElement } from 'react'

import { MenuItem, type MenuItemProps } from './Item.js'

export const isMenuItemReactElement = (
  value: unknown,
): value is ReactElement<MenuItemProps, typeof MenuItem> => {
  if (!isValidElement(value)) return false
  return value.type === MenuItem
}
